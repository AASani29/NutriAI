import { useProfile } from '../context/ProfileContext';

export default function Dashboard() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.profile?.fullName || 'User'}! 👋
        </h1>
        <p className="text-foreground/70">
          Track your food consumption and reduce waste
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Items Tracked</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Waste Reduced</p>
              <p className="text-2xl font-bold text-foreground">0 kg</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Community</p>
              <p className="text-2xl font-bold text-foreground">1</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Goals Met</p>
              <p className="text-2xl font-bold text-foreground">0/0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-border p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Welcome to NutriTrack! 🌱
        </h2>
        <p className="text-foreground/70 mb-6">
          Start tracking your food consumption and reduce waste. Here are some quick actions to get you started:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium">
            Add Your First Item
          </button>
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-smooth font-medium">
            Set Your Goals
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-foreground/50">
            No activity yet. Start tracking to see your progress here!
          </p>
        </div>
      </div>
    </div>
  );
}