import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { AlertCircle, Plus, Search, Package, AlertTriangle, ArrowRight, CheckCircle2, MoreHorizontal, Settings2, Database, Warehouse } from 'lucide-react';

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

  const getInventoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fridge') || n.includes('refrigerator')) return <Warehouse className="w-8 h-8" />;
    if (n.includes('pantry') || n.includes('cabinet')) return <Database className="w-8 h-8" />;
    if (n.includes('office')) return <Package className="w-8 h-8" />;
    return <Package className="w-8 h-8" />;
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-soft border border-red-50 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Sync Error</h2>
          <p className="text-muted-foreground font-medium mb-8">Unable to fetch sync records from the server.</p>
          <button
            onClick={() => refetch()}
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 px-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Pantry Inventory</h1>
            <p className="text-slate-400 font-medium mt-1">Manage your nutrition stock efficiently.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 w-80 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 text-sm transition-all font-medium text-slate-800 outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-black/20 font-black text-[10px] uppercase tracking-widest active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Pantry</span>
            </button>
          </div>
        </header>

        {/* Hero & Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {/* Main Hero Card - Slate instead of Primary Gold */}
          <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white shadow-xl group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Nutrition Intelligence</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter uppercase">
                  Synthesize Your<br />
                  <span className="text-primary">Household Health</span>
                </h2>
                <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed">
                  Monitor <span className="text-white font-black">{totalItems} active units</span> distributed across <span className="text-white font-black">{inventories?.length || 0} secure hubs</span>. 
                  Leverage AI to optimize your consumption and eliminate waste.
                </p>
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <button className="bg-white text-slate-900 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-white/5">
                  Analyze Stock Integrity
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Inventory Health</h3>
                <MoreHorizontal className="w-5 h-5 text-slate-300" />
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 leading-none">{totalItems}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm border border-slate-100">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-red-500 leading-none">{expiringSoon}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Expiring Soon</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Freshness</span>
                <span className="text-xs font-black text-primary uppercase">{expiringSoon > 0 ? '80%' : '100%'} Optimal</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-1000" style={{ width: expiringSoon > 0 ? '80%' : '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 py-2 px-4">
          <button className="px-6 py-2 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">All Pantries</button>
          <button className="px-6 py-2 rounded-xl bg-white text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all">Active</button>
          <button className="px-6 py-2 rounded-xl bg-white text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all">Archived</button>
          <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>
            ))
          ) : filteredInventories.map((inventory) => (
            <div
              key={inventory.id}
              onClick={() => navigate(`/inventory/${inventory.id}`)}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(172,156,6,0.08)] transition-all duration-500 cursor-pointer flex flex-col relative overflow-hidden"
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[3rem] -z-10 group-hover:bg-primary/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100/50">
                  {getInventoryIcon(inventory.name)}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Hub Status</div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Sync</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-black text-2xl text-slate-900 tracking-tight group-hover:text-primary transition-colors mb-1">{inventory.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 line-clamp-1">{inventory.description || 'Global Storage Unit'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Load Factor</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{inventory.itemCount || 0}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white transition-colors">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Alerts</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-red-500">{inventory.expiringCount || 0}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hub Integrity</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{(inventory.expiringCount || 0) > 0 ? '85%' : '100%'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(172,156,6,0.3)]" 
                    style={{ width: (inventory.expiringCount || 0) > 0 ? '85%' : '100%' }}
                  ></div>
                </div>
              </div>

              {/* Hover Access Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Table & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 pb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-slate-800 tracking-tight">Detailed Registry</h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-dark transition-all">Export Data</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                    <th className="pb-4 pl-2">Hub Name</th>
                    <th className="pb-4">Load</th>
                    <th className="pb-4">Alerts</th>
                    <th className="pb-4">Condition</th>
                    <th className="pb-4 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredInventories.map(inv => (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => navigate(`/inventory/${inv.id}`)}>
                      <td className="py-5 pl-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">🏠</div>
                            <span className="font-black text-slate-700 tracking-tight">{inv.name}</span>
                        </div>
                      </td>
                      <td className="py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">{inv.itemCount || 0} Units</td>
                      <td className="py-5 font-black text-red-500 text-[10px] uppercase tracking-widest">{inv.expiringCount || 0} Critical</td>
                      <td className="py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Verified
                        </span>
                      </td>
                      <td className="py-5 pr-2 text-right">
                        <button className="text-slate-300 hover:text-primary transition-all"><ArrowRight className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Tasks */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-slate-800 tracking-tight">System Tasks</h3>
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">Active</span>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { title: "Check Freshness", sub: "Scan alert records" },
                { title: "Sync Groceries", sub: "Neural link refresh" },
                { title: "Meal Prepping", sub: "Logging vitals" }
              ].map((task, i) => (
                <label key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight">{task.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{task.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <button className="w-full mt-8 border-2 border-slate-50 text-slate-400 py-4 rounded-xl hover:bg-slate-50 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
              Access System Insights
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <form
            className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-slate-100"
            onSubmit={handleCreateInventory}
          >
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Pantry Hub</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Initialize a new inventory tracking system.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hub Name</label>
                <input
                  name="name"
                  required
                  autoFocus
                  placeholder="e.g. Master Fridge"
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl bg-slate-50 text-slate-800 font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea
                  name="description"
                  placeholder="What's in this hub?"
                  rows={3}
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl bg-slate-50 text-slate-800 font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="submit"
                disabled={createInventoryMutation.isPending}
                className="flex-1 py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
              >
                {createInventoryMutation.isPending ? 'Processing...' : 'Create Hub'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}