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
import { useListings, useSharingStats } from '../components/neighbourhood/sharing-service';
import { ListingStatus } from '../components/neighbourhood/types';
import { NeighborhoodMap } from '../components/neighbourhood/NeighborhoodMap';
import { useProfile } from '../context/ProfileContext';

export default function NeighbourhoodPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'share' | 'mylistings' | 'mybookings'>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: listings = [] } = useListings({
    status: ListingStatus.AVAILABLE,
    excludeOwnListings: true,
  });

  const { data: stats } = useSharingStats();
  const { profile } = useProfile();

  const featuredListing = listings[0];

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

  // Helper for distance calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // km
  };

  const userLat = profile?.profile?.latitude;
  const userLng = profile?.profile?.longitude;

  const recommendedListings = listings
    .filter(l => l.latitude && l.longitude && userLat && userLng)
    .map(l => ({
      ...l,
      distance: getDistance(userLat!, userLng!, l.latitude!, l.longitude!)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pt-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Neighbourhood</h1>
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
          My History
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'browse' && (
          <>
            <div className="grid grid-cols-12 gap-6">
              {/* Featured Hero Card */}
              <div className="col-span-12 lg:col-span-8 bg-black rounded-[2.5rem] p-0 relative overflow-hidden shadow-2xl group min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <img
                  alt="Featured Food"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  src={"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200"}
                />
                <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-12 text-white">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full w-fit mb-6 border border-white/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {featuredListing ? 'Just Posted • 10 mins ago' : 'No listings yet'}
                  </div>
                  {featuredListing ? (
                    <>
                      <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tighter">
                        {featuredListing.title}
                      </h2>
                      <p className="text-gray-300 max-w-md mb-8 font-medium text-lg leading-relaxed">
                        {featuredListing.description || "Fresh food available for pickup in your neighbourhood. Perfectly preserved and ready for you."}
                      </p>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex -space-x-3">
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center font-bold text-xs">A</div>
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center font-bold text-xs text-black">+2</div>
                        </div>
                        <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Interested neighbors</span>
                        <button className="md:ml-auto w-full md:w-auto bg-primary text-black hover:bg-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105">
                          Reserve Now
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl font-bold opacity-60">Start by sharing something with your community.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Near You / Map Placeholder */}
              <div className="col-span-12 lg:col-span-4 bg-gray-50 rounded-[2.5rem] p-8 relative flex flex-col shadow-soft border border-gray-100 overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-black tracking-tight">Near You</h3>
                  <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
                    <Filter className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 rounded-[2rem] bg-white border border-gray-100 relative overflow-hidden shadow-inner group-hover:border-black/5 transition-colors">
                  <NeighborhoodMap
                    listings={listings}
                    userLat={profile?.profile?.latitude || undefined}
                    userLng={profile?.profile?.longitude || undefined}
                    height="100%"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">Categories</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">What are you looking for?</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div className="space-y-3">
                  {categories.length > 0 ? categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-primary transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <Package className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-bold text-black capitalize">{cat.name}</span>
                      </div>
                      <span className="text-sm font-black bg-black text-white px-3 py-1 rounded-full group-hover:bg-white group-hover:text-black transition-colors">{cat.count}</span>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground font-medium py-4">No categories yet</p>
                  )}
                </div>
              </div>

              {/* Your Impact */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-black tracking-tight">Your Impact</h3>
                  <div className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Global Stats</div>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-black tracking-tighter">{stats?.totalQuantityShared || '0.0'}</span>
                    <span className="text-lg font-black text-muted-foreground mb-2">units shared</span>
                  </div>

                  <div className="relative h-28 w-full flex items-end justify-between gap-3 px-1">
                    {[40, 60, 30, 80, 50].map((h, i) => (
                      <div key={i}
                        className={`w-full ${i === 4 ? 'bg-primary' : 'bg-gray-100'} rounded-t-2xl transition-all duration-500 hover:bg-black group relative cursor-help`}
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round(h / 10)}kg
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                    <span>Wk 1</span>
                    <span>Wk 2</span>
                    <span>Wk 3</span>
                    <span>Wk 4</span>
                    <span className="text-primary">Now</span>
                  </div>
                </div>
              </div>

              {/* Recommended Near You Feed */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">Recommended Near You</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Based on proximity</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  {recommendedListings.length > 0 ? recommendedListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-5 group cursor-pointer p-2 hover:bg-gray-50 rounded-[1.5rem] transition-all border border-transparent hover:border-gray-100">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-soft flex-shrink-0 bg-gray-50">
                        <img
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          src={listing.inventoryItem.foodItem?.category === 'fruit' ? "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=150" : "https://images.unsplash.com/photo-1546767060-ee1592d38e65?auto=format&fit=crop&q=80&w=150"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-black truncate group-hover:text-primary transition-colors">{listing.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black">
                            {listing.distance < 1 ? `${(listing.distance * 1000).toFixed(0)}m` : `${listing.distance.toFixed(1)}km`}
                          </span>
                          <span className="text-xs text-muted-foreground font-bold truncate">away</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate">{listing.pickupLocation}</p>
                      </div>
                      <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white text-muted-foreground transition-all flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground max-w-[180px]">
                        {userLat ? "No listings found near your location yet." : "Please set your location in profile to see recommendations."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-black tracking-tight">Browse Listings</h2>
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