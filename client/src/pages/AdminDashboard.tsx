import { BookOpen, Package, TrendingUp, Users, Menu } from 'lucide-react';
import { useState } from 'react';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import AddFoodModal from '../components/admin/AddFoodModal';
import AddResourceModal from '../components/admin/AddResourceModal';
import SystemHealth from '../components/admin/SystemHealth';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminDashboard() {
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Overview Content Component
  const OverviewContent = () => (
    <>
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
        Admin Overview
      </h1>
      <p className="text-muted-foreground font-medium">
        Platform health, user statistics, and global actions.
      </p>
    </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Items</p>
              <p className="text-3xl font-bold text-foreground">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <BookOpen className="h-7 w-7 text-black" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Resources</p>
              <p className="text-3xl font-bold text-foreground">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Users</p>
              <p className="text-3xl font-bold text-foreground">456</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <TrendingUp className="h-7 h-7 text-black" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Growth</p>
              <p className="text-3xl font-bold text-foreground">+12%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-12 shadow-soft">
        <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">
          Global Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setShowAddFoodModal(true)}
            className="p-8 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black hover:bg-gray-50 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/10 group-hover:bg-primary group-hover:text-black transition-colors">
                <Package className="w-10 h-10 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Add Food Item
              </h3>
              <p className="text-muted-foreground font-medium max-w-xs">
                Extend the global repository with new nutritional profiles.
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowAddResourceModal(true)}
            className="p-8 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black hover:bg-gray-50 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30 group-hover:bg-black group-hover:border-black transition-colors">
                <BookOpen className="w-10 h-10 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Add Resource
              </h3>
              <p className="text-muted-foreground font-medium max-w-xs">
                Upload educational guides and sustainability resources.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Recent Audit Log
          </h2>
          <button className="text-xs font-bold text-black uppercase tracking-widest hover:text-primary-dark transition-colors">View All Logs</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">
                Inventory Database Update
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Organic Quinoa successfully cataloged in global food list.
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2h ago</span>
          </div>

          <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-xl shadow-sm border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">
                Resource Revision
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Meal Planning Guide optimized for regional sustainability data.
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">5h ago</span>
          </div>

          <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">
                User Acquisition
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Significant spike in registrations from Dhaka North sector.
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">1d ago</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-card border-b border-border z-10 p-4 flex justify-between items-center">
            <h1 className="font-bold text-lg">Admin Portal</h1>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto mt-14 md:mt-0">
          <div className="max-w-7xl mx-auto">
             {activeTab === 'overview' && <OverviewContent />}
             {activeTab === 'system-health' && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">System Health</h1>
                        <p className="text-foreground/70">Real-time infrastructure monitoring</p>
                    </div>
                    <SystemHealth />
                </div>
             )}
          </div>
        </div>

        {/* Modals */}
        {showAddFoodModal && activeTab === 'overview' && (
          <AddFoodModal onClose={() => setShowAddFoodModal(false)} />
        )}

        {showAddResourceModal && activeTab === 'overview' && (
          <AddResourceModal onClose={() => setShowAddResourceModal(false)} />
        )}
      </div>
    </AdminProtectedRoute>
  );
}
