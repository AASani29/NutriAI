import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { AlertCircle } from 'lucide-react';

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { useGetInventories, useCreateInventory } = useInventory();
  const { data: inventories, isLoading, isError, refetch } = useGetInventories();
  const createInventoryMutation = useCreateInventory();

  const handleCreateInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      await createInventoryMutation.mutateAsync({ name, description });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating inventory:', err);
    }
  };

  const filteredInventories = inventories?.filter(inv =>
    inv.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalItems = inventories?.reduce((acc, inv) => acc + (inv.itemCount || 0), 0) || 0;
  const expiringSoon = inventories?.reduce((acc, inv) => acc + (inv.expiringCount || 0), 0) || 0;

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-red-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Inventories</h2>
          <p className="text-muted-foreground mb-6">We couldn't fetch your pantry data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="w-full py-3 bg-primary text-gray-900 rounded-full font-bold hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Pantry Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your nutrition stock efficiently.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <span className="material-icons-outlined">search</span>
            </span>
            <input
              type="text"
              placeholder="Search inventories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 w-80 rounded-full bg-white border-none shadow-soft focus:ring-2 focus:ring-primary/50 text-sm transition-all placeholder-muted-foreground text-foreground"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 font-medium"
          >
            <span className="material-icons-round text-lg">add</span>
            <span>New Pantry</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Hero Card */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#D2E823] to-[#b5c91e] rounded-3xl p-8 relative overflow-hidden text-gray-900 shadow-soft group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute left-20 bottom-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex justify-between items-start h-full flex-col md:flex-row">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-black text-sm font-medium mb-1 uppercase tracking-wider">Nutrition Summary</h3>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight font-display text-black">Optimizing your<br />household health!</h2>
                  <p className="text-black/80 max-w-sm text-sm md:text-base">You have {totalItems} items across {inventories?.length || 0} inventories. Keep track of expiry dates to reduce waste.</p>
                </div>
                <div className="mt-8">
                  <button className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 shadow-lg shadow-black/20">
                    Get AI Recommendations
                    <span className="material-icons-round text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="hidden md:block relative w-48 h-48 bg-black/10 rounded-2xl backdrop-blur-sm border border-black/20 p-4 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                <span className="material-icons-outlined text-6xl mb-2 text-black/80">eco</span>
                <span className="text-2xl font-bold text-black">{expiringSoon === 0 ? '100%' : '85%'}</span>
                <span className="text-xs text-black/60">Health Score</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-card  rounded-3xl p-6 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">Inventory Health</h3>
                <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <span className="material-icons-outlined text-gray-500 dark:text-gray-300 text-sm">more_horiz</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-icons-round">check_circle</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                    <p className="text-xs text-muted-foreground">Total Items tracked</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="material-icons-round">warning</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{expiringSoon}</p>
                    <p className="text-xs text-muted-foreground">Expiring Soon</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium dark:text-gray-300">Stock Freshness</span>
                <span className="text-xs text-gray-500">{expiringSoon > 0 ? '80%' : '100%'} optimal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: expiringSoon > 0 ? '80%' : '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 py-2">
          <button className="px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm transition-transform hover:scale-105">All Pantries</button>
          <button className="px-5 py-2 rounded-full bg-white  text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 font-medium text-sm shadow-sm transition-all hover:shadow-md">Active</button>
          <button className="px-5 py-2 rounded-full bg-white  text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 font-medium text-sm shadow-sm transition-all hover:shadow-md">Archived</button>
          <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-white  text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="material-icons-outlined text-xl">filter_list</span>
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white  rounded-3xl animate-pulse shadow-soft"></div>
            ))
          ) : filteredInventories.map((inventory) => (
            <div
              key={inventory.id}
              onClick={() => navigate(`/inventory/${inventory.id}`)}
              className="bg-card  rounded-3xl p-5 shadow-soft hover:shadow-lg transition-all group relative cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-primary/20 text-primary-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-primary/30">
                {inventory.itemCount || 0} items
              </div>
              <div className="flex items-center justify-center h-32 mb-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:scale-[1.02] transition-transform duration-300">
                <span className="text-6xl">📦</span>
              </div>
              <h4 className="font-bold text-lg text-foreground mb-1">{inventory.name}</h4>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{inventory.description || 'No description provided.'}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Status</span>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary-dark transition-colors shadow-md shadow-primary/30">
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Table & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card  rounded-3xl p-6 shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground">Detailed Pantry List</h3>
              <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pl-2 font-medium">Pantry Name</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Expiring</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 pr-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredInventories.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/inventory/${inv.id}`)}>
                      <td className="py-4 pl-2 font-medium text-foreground flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center text-lg">🏠</div>
                        {inv.name}
                      </td>
                      <td className="py-4 text-muted-foreground">{inv.itemCount || 0} items</td>
                      <td className="py-4 font-semibold text-orange-600">{inv.expiringCount || 0}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <button className="text-muted-foreground hover:text-primary transition-colors"><span className="material-icons-outlined text-lg">edit</span></button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">No pantries found. Create your first one!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / Shopping List Mock */}
          <div className="bg-card  rounded-3xl p-6 shadow-soft flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground">Quick Tasks</h3>
              <span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded-full">New</span>
            </div>
            <div className="flex-1 space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Check Freshness</p>
                  <p className="text-xs text-muted-foreground">Scan for expiring items</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Sync Groceries</p>
                  <p className="text-xs text-muted-foreground">Update from recent receipt</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Meal Prepping</p>
                  <p className="text-xs text-muted-foreground">Log used ingredients</p>
                </div>
              </label>
            </div>
            <button className="w-full mt-6 border border-gray-300 text-muted-foreground py-3 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium">
              View AI Insights
            </button>
          </div>
        </div>
      </div>

      {/* Create Inventory Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <form
            className="bg-white  rounded-3xl border border-border shadow-2xl p-8 w-full max-w-md"
            onSubmit={handleCreateInventory}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">New Pantry</h2>
            <p className="text-muted-foreground text-sm mb-6">Organize your home kitchen, office snacks, or gym supplements separately.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 ml-1">Pantry Name</label>
                <input
                  name="name"
                  required
                  autoFocus
                  placeholder="e.g. Master Kitchen"
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 ml-1">Description</label>
                <textarea
                  name="description"
                  placeholder="What's in this inventory? (Optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder-muted-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={createInventoryMutation.isPending}
                className="px-6 py-3 bg-primary text-black rounded-full font-bold hover:shadow-lg transition-all flex-1 disabled:opacity-50"
              >
                {createInventoryMutation.isPending ? 'Creating...' : 'Create Pantry'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 bg-gray-100 border border-transparent text-foreground rounded-full hover:bg-gray-200 transition-all font-bold flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </main>
  );
}