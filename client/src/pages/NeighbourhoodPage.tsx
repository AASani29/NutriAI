import { useState } from 'react';
import AvailableListings from '../components/neighbourhood/AvailableListings';
import CreateListing from '../components/neighbourhood/CreateListing';
import MyListings from '../components/neighbourhood/MyListings';
import MyBookings from '../components/neighbourhood/MyBookings';
import {
  ShoppingBag,
  Search,
  Plus,
  ArrowRight,
  MapPin,
  Package,
  Filter,
  LayoutGrid,
  History
} from 'lucide-react';
import { useListings, useUserListings } from '../components/neighbourhood/sharing-service';
import { ListingStatus } from '../components/neighbourhood/types';
import { useAuth } from "@clerk/clerk-react";

export default function NeighbourhoodPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'share' | 'mylistings' | 'mybookings'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const { userId } = useAuth();

  // Fetch all available listings (excluding own) for the Discovery feed
  const { data: allListings = [] } = useListings({
    status: ListingStatus.AVAILABLE,
    excludeOwnListings: true,
  });

  // Filter out any listings that the current user has already claimed/booked
  // This ensures the "Discovery" tab only shows items you can actually book.
  const listings = allListings.filter(listing =>
    !userId || !listing.sharingLogs?.some(log => log.claimerId === userId)
  );

  // Fetch user's own listings to calculate "Your Impact" (Completed items)
  const { data: userListings = [] } = useUserListings();

  // Fetch listings CLAIMED by the user for the "Your Bookings" feed
  const { data: myAllocatedListings = [] } = useListings({
    claimedBy: userId || undefined
  }, { enabled: !!userId });

  const activeBookings = myAllocatedListings
    .filter(l => l.status === ListingStatus.CLAIMED)
    .slice(0, 3);

  const featuredListing = listings[0];

  const completedListings = userListings.filter(l => l.status === ListingStatus.COMPLETED);
  const yourImpactCount = completedListings.length;

  // Calculate weekly activity for the graph
  const weeklyStats = [0, 0, 0, 0, 0].map((_, i) => {
    // 0 = 4 weeks ago (Wk 1)
    // 4 = This week (Now)
    const weekIndex = 4 - i;
    const now = new Date();
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;

    return completedListings.filter(l => {
      const date = new Date(l.updatedAt);
      const diffTime = now.getTime() - date.getTime();
      const diffWeeks = Math.floor(diffTime / msPerWeek);
      return diffWeeks === weekIndex;
    }).length;
  });

  const maxStat = Math.max(...weeklyStats, 4); // Min max of 4 to keep bars reasonable if low counts

  // Calculate categories
  const categoryCounts = listings.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.inventoryItem.foodItem?.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const getCategoryImage = (category: string = 'Other') => {
    switch (category.toLowerCase()) {
      case 'fruit':
      case 'fruits':
        return "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200"; // Fresh mixed fruit
      case 'vegetable':
      case 'vegetables':
        return "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=200"; // Fresh vegetables
      case 'dairy':
        return "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=200"; // Dairy
      case 'bakery':
      case 'bread':
        return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200"; // Bakery
      case 'meat':
        return "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=200"; // Meat
      case 'beverages':
      case 'drinks':
        return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=200"; // Drinks
      case 'meals':
      case 'prepared':
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"; // Prepared meal
      default:
        return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"; // General food grocery
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pt-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Neighbourhood</h1>
          <p className="text-muted-foreground font-medium mt-1">Find fresh, surplus food nearby and reduce waste.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for surplus food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-soft focus:ring-2 focus:ring-black outline-none transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl ${activeTab === 'share'
              ? 'bg-primary text-black scale-105'
              : 'bg-black text-white hover:bg-gray-900 active:scale-95'
              }`}
          >
            <Plus className="w-5 h-5" />
            <span>Share Food</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-3 mb-8 no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap flex items-center justify-center gap-2 transition-all border ${activeTab === 'browse'
            ? 'bg-black text-white border-black shadow-lg shadow-black/10'
            : 'bg-white border-gray-100 text-muted-foreground hover:text-black hover:bg-gray-50'
            }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Discovery
        </button>
        <button
          onClick={() => setActiveTab('mybookings')}
          className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap flex items-center justify-center gap-2 transition-all border ${activeTab === 'mybookings'
            ? 'bg-black text-white border-black shadow-lg shadow-black/10'
            : 'bg-white border-gray-100 text-muted-foreground hover:text-black hover:bg-gray-50'
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('mylistings')}
          className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap flex items-center justify-center gap-2 transition-all border ${activeTab === 'mylistings'
            ? 'bg-black text-white border-black shadow-lg shadow-black/10'
            : 'bg-white border-gray-100 text-muted-foreground hover:text-black hover:bg-gray-50'
            }`}
        >
          <History className="w-4 h-4" />
          My Listings
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'browse' && (
          <>
            <div className="grid grid-cols-12 gap-6">
              {/* Featured Hero Card */}
              <div className="col-span-12 lg:col-span-8 bg-black rounded-2xl p-0 relative overflow-hidden shadow-xl group min-h-[350px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <img
                  alt="Featured Food"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  src={"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200"}
                />
                <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8 text-white">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg w-fit mb-4 border border-white/20 text-xs font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {featuredListing ? 'Just Posted' : 'No items yet'}
                  </div>
                  {featuredListing ? (
                    <>
                      <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3 tracking-tight">
                        {featuredListing.title}
                      </h2>
                      <p className="text-gray-300 max-w-md mb-6 text-sm leading-relaxed">
                        {featuredListing.description || "Fresh food available for pickup in your neighbourhood."}
                      </p>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <button
                          className="w-full md:w-auto bg-primary text-black hover:bg-white px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        >
                          Reserve Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-lg font-bold opacity-60">Start by sharing something with your community.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Near You / Map */}
              <div className="col-span-12 lg:col-span-4 bg-gray-50 rounded-2xl p-6 relative flex flex-col shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-black">Near You</h3>
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                    <Filter className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white border border-gray-200 relative overflow-hidden z-0">
                  {/* Simulated Map Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

                  {listings.slice(0, 3).map((l, i) => (
                    <div key={l.id}
                      className="absolute transform hover:scale-110 transition-all cursor-pointer"
                      style={{
                        top: `${20 + (i * 25)}%`,
                        left: `${20 + (i * 30)}%`
                      }}
                    >
                      <div className={`w-8 h-8 ${i === 0 ? 'bg-secondary' : 'bg-gray-800'} rounded-lg border-2 border-white shadow-lg flex items-center justify-center`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}

                  <div className="absolute bottom-3 left-3 right-3 bg-white p-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-black truncate">{featuredListing?.title || 'No active items'}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{featuredListing?.pickupLocation || 'No location'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-black">Categories</h3>
                    <p className="text-sm text-gray-500 mt-1">What are you looking for?</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {categories.length > 0 ? categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-secondary/10 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Package className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="font-semibold text-gray-900 capitalize text-sm">{cat.name}</span>
                      </div>
                      <span className="text-xs font-bold bg-secondary text-white px-2 py-1 rounded-full">{cat.count}</span>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-4 text-sm">No categories yet</p>
                  )}
                </div>
              </div>

              {/* Your Impact */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-black">Your Impact</h3>
                  <div className="bg-secondary text-white px-3 py-1 rounded-lg text-[10px] font-bold">Stats</div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-black">{yourImpactCount}</span>
                    <span className="text-sm font-medium text-gray-500 mb-1">items shared</span>
                  </div>

                  <div className="relative h-24 w-full flex items-end justify-between gap-2 px-1">
                    {weeklyStats.map((count, i) => (
                      <div key={i}
                        className={`w-full ${i === 4 ? 'bg-secondary' : 'bg-gray-100'} rounded-t-lg transition-all duration-500 hover:bg-secondary/80 group relative cursor-help`}
                        style={{ height: `${maxStat > 0 ? (count / maxStat) * 100 : 0}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>Wk 1</span>
                    <span>Wk 2</span>
                    <span>Wk 3</span>
                    <span>Wk 4</span>
                    <span className="text-secondary font-bold">Now</span>
                  </div>
                </div>
              </div>

              {/* Active Bookings Feed */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-black tracking-tight">Your Bookings</h3>
                  <button
                    onClick={() => setActiveTab('mybookings')}
                    className="text-xs font-bold text-primary uppercase tracking-widest hover:text-black transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 space-y-5">
                  {activeBookings.length > 0 ? activeBookings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => setActiveTab('mybookings')}
                      className="flex items-center gap-5 group cursor-pointer p-2 hover:bg-gray-50 rounded-[1.5rem] transition-all"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-soft flex-shrink-0 relative">
                        <img
                          alt={listing.title}
                          className="w-full h-full object-cover grayscale-[20%]"
                          src={getCategoryImage(listing.inventoryItem.foodItem?.category)}
                        />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-black truncate group-hover:text-primary transition-colors">{listing.title}</h4>
                        <p className="text-xs text-muted-foreground font-bold mb-1 truncate">Ready for pickup</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          To Collect
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white text-muted-foreground transition-all flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-100 mb-4" />
                      <p className="text-sm font-bold text-muted-foreground">No active bookings</p>
                      <button
                        onClick={() => document.getElementById('search-input')?.focus()}
                        className="mt-2 text-xs text-primary font-bold uppercase tracking-widest"
                      >
                        Browse Food
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-black tracking-tight">Browse Listings</h2>
                <div className="h-px flex-1 bg-gray-100 mx-8" />
              </div>
              <AvailableListings externalSearch={searchQuery} />
            </div>
          </>
        )}

        {/* Existing Component Views */}
        {activeTab === 'mylistings' && <MyListings />}
        {activeTab === 'mybookings' && <MyBookings />}
        {activeTab === 'share' && (
          <div className="max-w-3xl mx-auto">
            <CreateListing onSuccess={() => setActiveTab('mylistings')} />
          </div>
        )}
      </div>
    </div>
  );
}