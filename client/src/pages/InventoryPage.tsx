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
    <main className="flex-1 overflow-y-auto bg-white rounded-xl">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 px-4 ">
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
                className="pl-11 pr-4 py-3 w-80 rounded-xl text-secondary border-none focus:ring-4 focus:ring-primary/10 text-sm transition-all font-medium text-slate-800 outline-none"
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
          

          {/* Status Card */}
          <div className="text-secondary rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Inventory Health</h3>
                <MoreHorizontal className="w-5 h-5 text-slate-300" />
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm border border-slate-100">
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
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 py-2 px-4">
          <button className="px-6 py-2 rounded-xl bg-primary text-secondary font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">All Pantries</button>
          <button className="px-6 py-2 rounded-xl bg-white text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all">Active</button>
          <button className="px-6 py-2 rounded-xl bg-white text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all">Archived</button>
          <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl text-secondary text-slate-400 hover:text-primary transition-all">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 text-secondary rounded-[2.5rem] animate-pulse"></div>
            ))
          ) : filteredInventories.map((inventory) => (
            <div
              key={inventory.id}
              onClick={() => navigate(`/inventory/${inventory.id}`)}
              className="group  shadow-xl bg-primary rounded-[2.5rem] p-8 border border-slate-100 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(172,156,6,0.08)] transition-all duration-500 cursor-pointer flex flex-col relative overflow-hidden"
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 text-secondary rounded-bl-[3rem] -z-10 group-hover:bg-primary/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl text-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100/50">
                  {getInventoryIcon(inventory.name)}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-black text-2xl text-slate-900 tracking-tight group-hover:text-primary transition-colors mb-1">{inventory.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 line-clamp-1">{inventory.description || 'Global Storage Unit'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-secondary rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{inventory.itemCount || 0}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</span>
                  </div>
                </div>
                <div className="text-secondary rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white transition-colors">
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
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea
                  name="description"
                  placeholder="What's in this hub?"
                  rows={3}
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
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
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl hover:text-secondary transition-all font-black text-xs uppercase tracking-widest"
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