import { useState } from 'react';
import AvailableListings from '../components/neighbourhood/AvailableListings';
import CreateListing from '../components/neighbourhood/CreateListing';
import MyListings from '../components/neighbourhood/MyListings';
import MyBookings from '../components/neighbourhood/MyBookings';
import { ShoppingBag, Share2, List, Search } from 'lucide-react';

export default function NeighbourhoodPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'share' | 'mylistings' | 'mybookings'>('browse');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Neighbourhood Sharing
        </h1>
        <p className="text-foreground/70 max-w-2xl">
          Share surplus food with your neighbours or find what you need.
          Reduce waste and build community.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar bg-background/50 backdrop-blur-sm sticky top-0 z-10 pt-4 -mt-4">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap lg:flex-none flex-1 flex items-center justify-center gap-2 transition-smooth ${activeTab === 'browse'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card border border-border text-foreground hover:bg-secondary/10'
            }`}
        >
          <Search className="w-4 h-4" />
          Browse Food
        </button>
        <button
          onClick={() => setActiveTab('mybookings')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap lg:flex-none flex-1 flex items-center justify-center gap-2 transition-smooth ${activeTab === 'mybookings'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card border border-border text-foreground hover:bg-secondary/10'
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('share')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap lg:flex-none flex-1 flex items-center justify-center gap-2 transition-smooth ${activeTab === 'share'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card border border-border text-foreground hover:bg-secondary/10'
            }`}
        >
          <Share2 className="w-4 h-4" />
          Share Food
        </button>
        <button
          onClick={() => setActiveTab('mylistings')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap lg:flex-none flex-1 flex items-center justify-center gap-2 transition-smooth ${activeTab === 'mylistings'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card border border-border text-foreground hover:bg-secondary/10'
            }`}
        >
          <List className="w-4 h-4" />
          My Listings
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'browse' && <AvailableListings />}
        {activeTab === 'mybookings' && <MyBookings />}
        {activeTab === 'share' && <CreateListing onSuccess={() => setActiveTab('mylistings')} />}
        {activeTab === 'mylistings' && <MyListings />}
      </div>
    </div>
  );
}