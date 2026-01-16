import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { AlertCircle, Plus, Search, Package, AlertTriangle, ArrowRight, CheckCircle2, MoreHorizontal, Settings2, Database, Warehouse, X, User, ChevronDown, ArchiveX } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { EditInventoryDialog } from '../components/inventory/EditInventoryDialog';

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'archived'>('all');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { 
    useGetInventories, 
    useCreateInventory, 
    useUpdateInventory,
    useArchiveInventory,
    useUnarchiveInventory,
    useGetMultipleInventoryItems
  } = useInventory();
  const { data: inventories, isLoading, isError, refetch } = useGetInventories();

  // Fetch items for previews
  const inventoryIds = inventories?.map(inv => inv.id) || [];
  const itemsQueries = useGetMultipleInventoryItems(inventoryIds);
  const itemsMap = inventoryIds.reduce((acc, id, index) => {
    acc[id] = itemsQueries[index]?.data || [];
    return acc;
  }, {} as Record<string, any[]>);
  const createInventoryMutation = useCreateInventory();
  const updateInventoryMutation = useUpdateInventory();
  const archiveInventoryMutation = useArchiveInventory();
  const unarchiveInventoryMutation = useUnarchiveInventory();

  const searchUsers = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = await getToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserSearch(value);
    
    // Debounce search
    const timeout = setTimeout(() => {
      searchUsers(value);
    }, 300);

    return () => clearTimeout(timeout);
  };

  const addSelectedUser = (user: any) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearch('');
    setUserSearchResults([]);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const shareWithRaw = (formData.get('shareWith') as string) || '';
    const manualEmails = shareWithRaw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Combine selected users (by email) and manual emails
    const selectedEmails = selectedUsers.map(u => u.email);
    const allShareWith = [...selectedEmails, ...manualEmails];

    try {
      await createInventoryMutation.mutateAsync({
        name,
        description,
        shareWith: allShareWith.length ? allShareWith : undefined,
      });
      setShowAddModal(false);
      // Reset state
      setSelectedUsers([]);
      setUserSearch('');
      setUserSearchResults([]);
    } catch (err) {
      console.error('Error creating inventory:', err);
    }
  };

  const handleEditInventory = (inventory: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInventory(inventory);
  };

  const handleUpdateInventory = async (data: any) => {
    if (!editingInventory) return;
    try {
      await updateInventoryMutation.mutateAsync({
        id: editingInventory.id,
        data,
      });
      setEditingInventory(null);
    } catch (err) {
      console.error('Error updating inventory:', err);
    }
  };

  const handleArchive = async () => {
    if (!editingInventory) return;
    try {
      console.log('Archiving inventory:', editingInventory.id);
      const result = await archiveInventoryMutation.mutateAsync(editingInventory.id);
      console.log('Archive result:', result);
      setEditingInventory(null);
      setFilterTab('archived'); // Switch to archived tab
    } catch (err) {
      console.error('Error archiving inventory:', err);
      throw err;
    }
  };

  const handleUnarchive = async () => {
    if (!editingInventory) return;
    try {
      console.log('Unarchiving inventory:', editingInventory.id);
      const result = await unarchiveInventoryMutation.mutateAsync(editingInventory.id);
      console.log('Unarchive result:', result);
      setEditingInventory(null);
      setFilterTab('active'); // Switch to active tab
    } catch (err) {
      console.error('Error unarchiving inventory:', err);
      throw err;
    }
  };

  const filteredInventories = inventories?.filter(inv => {
    // First filter by search term
    if (!inv.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Then filter by tab
    if (filterTab === 'active') {
      return !inv.isArchived;
    } else if (filterTab === 'archived') {
      return inv.isArchived;
    }
    
    // 'all' tab shows everything
    return true;
  }) || [];

  const totalItems = inventories?.reduce((acc, inv) => acc + (inv.itemCount || 0), 0) || 0;
  const expiringSoon = inventories?.reduce((acc, inv) => acc + (inv.expiringCount || 0), 0) || 0;
  const archivedCount = inventories?.filter(inv => inv.isArchived).length || 0;

  const getInventoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fridge') || n.includes('refrigerator')) return <Warehouse className="w-8 h-8" />;
    if (n.includes('pantry') || n.includes('cabinet')) return <Database className="w-8 h-8" />;
    if (n.includes('office')) return <Package className="w-8 h-8" />;
    return <Package className="w-8 h-8" />;
  };

  const getItemEmoji = (category: string = '') => {
    const c = category.toLowerCase();
    if (c.includes('fruit')) return '🍎';
    if (c.includes('veg')) return '🥦';
    if (c.includes('meat')) return '🥩';
    if (c.includes('dairy')) return '🥛';
    if (c.includes('grain')) return '🌾';
    return '📦';
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-soft border border-red-50 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Sync Error</h2>
          <p className="text-muted-foreground font-medium mb-8">Unable to fetch sync records from the server.</p>
          <button
            onClick={() => refetch()}
            className="w-full py-4 bg-styled-card text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-styled-card-dark transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background/30 rounded-xl">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 px-4 ">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
            <p className="text-secondary/60 font-medium mt-1">Your Smart Pantry Tracker</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-secondary transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 w-80 rounded-xl text-foreground font-medium bg-white border border-border/50 focus:ring-4 focus:ring-primary/20 text-sm transition-all outline-none shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition-all shadow-lg font-bold active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>New Pantry</span>
            </button>
          </div>
        </header>

        {/* Inventory Health - Horizontal Stats */}
        <div className="px-4">
          <div className="bg-white rounded-[2rem] border border-border/60 p-8 shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Total Items</p>
                  <p className="text-3xl font-bold text-foreground">{totalItems}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 border-y md:border-y-0 md:border-x border-border/40 py-6 md:py-0 md:px-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">{expiringSoon}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm">
                  <ArchiveX className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Archived</p>
                  <p className="text-3xl font-bold text-foreground">{archivedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 py-2 px-4">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
              filterTab === 'all'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-white text-muted-foreground hover:text-secondary hover:shadow-sm border border-border/50'
            }`}
          >
            All Pantries
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
              filterTab === 'active'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-white text-muted-foreground hover:text-secondary hover:shadow-sm border border-border/50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterTab('archived')}
            className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
              filterTab === 'archived'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-white text-muted-foreground hover:text-secondary hover:shadow-sm border border-border/50'
            }`}
          >
            Archived
          </button>
          <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white text-muted-foreground border border-border/50 hover:text-secondary hover:shadow-sm transition-all">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Inventory Grid - Full Width */}
        <div className="grid grid-cols-1 gap-6 px-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 text-secondary rounded-[2.5rem] animate-pulse bg-gray-100/50"></div>
            ))
          ) : filteredInventories.map((inventory) => (
            <div
              key={inventory.id}
              onClick={() => !inventory.isArchived && navigate(`/inventory/${inventory.id}`)}
              className={`group shadow-soft hover:shadow-xl bg-white rounded-[2rem] p-8 border border-border/40 transition-all duration-500 flex flex-col md:flex-row gap-8 relative overflow-hidden ${
                inventory.isArchived
                  ? 'opacity-60 cursor-not-allowed bg-gray-50/50'
                  : 'hover:border-secondary/40 cursor-pointer active:scale-[0.99]'
              }`}
            >
              {/* Left Side: Icon & Basic Info */}
              <div className="flex flex-col md:w-1/4 gap-5">
                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/20">
                  {getInventoryIcon(inventory.name)}
                </div>
                <div>
                  <h4 className="font-bold text-2xl text-foreground tracking-tight group-hover:text-secondary transition-colors mb-1.5">{inventory.name}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80 line-clamp-2 leading-relaxed">{inventory.description || 'Smart Storage Hub'}</p>
                </div>
              </div>

              {/* Middle: Items Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inventory Content</span>
                  <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{inventory.itemCount || 0} Items</span>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {itemsMap[inventory.id]?.length > 0 ? (
                    itemsMap[inventory.id].slice(0, 8).map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className="flex flex-col items-center justify-center bg-gray-50/50 p-4 rounded-2xl border border-border/30 min-w-[110px] group/item hover:bg-white hover:shadow-md transition-all sm:w-28 md:w-32"
                      >
                        <div className="text-3xl mb-2 group-hover/item:scale-125 transition-transform duration-500 filter drop-shadow-sm">
                          {getItemEmoji(item.foodItem?.category)}
                        </div>
                        <p className="text-[11px] font-bold text-foreground truncate w-full text-center mb-1">
                          {item.customName || item.foodItem?.name}
                        </p>
                        <div className="px-2 py-0.5 bg-white rounded-full border border-border/40">
                          <p className="text-[9px] text-secondary font-bold uppercase tracking-tighter">
                            {item.quantity} {item.unit || 'pcs'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/30 italic text-sm py-10 w-full bg-gray-50/30 rounded-2xl border border-dashed border-border/40">
                      <ArchiveX className="w-6 h-6" />
                      <span className="text-xs font-medium">Empty pantry</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Status, Owner, Members & Actions */}
              <div className="md:w-1/4 flex flex-col items-end gap-5 border-t md:border-t-0 md:border-l border-border/20 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center justify-between w-full md:flex-col md:items-end gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${inventory.isArchived ? 'bg-muted-foreground' : 'bg-secondary shadow-[0_0_12px_rgba(210,105,30,0.5)]'}`}></div>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{inventory.isArchived ? 'Archived' : 'Active'}</span>
                    
                    {inventory.accessRole === 'owner' && !inventory.isArchived && (
                      <button
                        onClick={(e) => handleEditInventory(inventory, e)}
                        className="ml-2 p-2 hover:bg-primary/10 hover:text-secondary rounded-xl transition-all duration-300 border border-transparent hover:border-primary/20"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                    
                    {inventory.isArchived && inventory.accessRole === 'owner' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setEditingInventory(inventory);
                          try {
                            await unarchiveInventoryMutation.mutateAsync(inventory.id);
                            setEditingInventory(null);
                            setFilterTab('active');
                          } catch (err) {
                            console.error('Error unarchiving inventory:', err);
                            setEditingInventory(null);
                          }
                        }}
                        className="ml-2 px-3 py-1.5 bg-primary/20 text-secondary hover:bg-primary/30 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                  
                  {inventory.accessRole && (
                    <div className="flex flex-col items-end">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50 text-[9px] font-bold uppercase tracking-widest text-secondary border border-primary/20">
                        {inventory.accessRole === 'owner' ? (
                          <>
                            <User className="w-3.5 h-3.5" />
                            <span>Owner</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5" />
                            <span>Collaborator</span>
                          </>
                        )}
                      </div>
                      {inventory.ownerName && inventory.accessRole === 'member' && (
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium italic opacity-70">Managed by {inventory.ownerName}</p>
                      )}
                    </div>
                  )}

                  {/* Members Preview */}
                  {inventory.members && inventory.members.length > 0 && !inventory.isArchived && (
                    <div className="flex -space-x-3 mt-2">
                      {inventory.members.slice(0, 4).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-secondary/40" />
                        </div>
                      ))}
                      {inventory.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-white flex items-center justify-center text-[10px] font-bold text-secondary">
                          +{inventory.members.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Integrity Bar */}
                <div className="mt-auto w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Efficiency</span>
                    <span className="text-[10px] font-bold text-secondary">{(inventory.expiringCount || 0) > 0 ? '82%' : '100%'}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-secondary h-full rounded-full transition-all duration-1000 shadow-sm" 
                      style={{ width: (inventory.expiringCount || 0) > 0 ? '82%' : '100%', backgroundColor: (inventory.expiringCount || 0) > 0 ? '#D2691E' : '#FFB88C' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Bar */}
              {!inventory.isArchived && (
                <div className="absolute right-0 top-0 h-full w-2 bg-secondary/80 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 rounded-l-full shadow-lg shadow-secondary/20"></div>
              )}
            </div>
          ))
        }
        </div>

        
          
      </div>

      {/* Edit Inventory Dialog */}
      {editingInventory && (
        <EditInventoryDialog
          inventory={editingInventory}
          onClose={() => setEditingInventory(null)}
          onUpdate={handleUpdateInventory}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          isLoading={updateInventoryMutation.isPending || archiveInventoryMutation.isPending || unarchiveInventoryMutation.isPending}
        />
      )}

      {/* Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-foreground/30 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300"
          onClick={() => setShowAddModal(false)}
        >
          <form
            className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg border border-primary/20 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]"
            onSubmit={handleCreateInventory}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20">
                  <Warehouse className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">New Pantry Hub</h2>
                <p className="text-muted-foreground text-sm font-medium mt-2">Initialize a smart inventory system.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 px-1">Hub Name</label>
                <input
                  name="name"
                  required
                  autoFocus
                  placeholder="e.g. Master Fridge"
                  className="w-full px-6 py-4.5 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 px-1">Description</label>
                <textarea
                  name="description"
                  placeholder="What's in this hub?"
                  rows={3}
                  className="w-full px-6 py-4.5 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all outline-none resize-none placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 px-1">Collaborators</label>
                
                {/* Selected Users Chips */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mb-4 p-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 bg-primary/20 text-secondary px-3 py-2 rounded-xl text-xs font-bold border border-primary/20 shadow-sm animate-in scale-in duration-300"
                      >
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName || user.email}
                            className="w-5 h-5 rounded-full border border-white"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {user.fullName || user.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSelectedUser(user.id)}
                          className="hover:text-red-500 transition-colors bg-white/50 p-1 rounded-full ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* User Search Input */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary pointer-events-none transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={handleUserSearchChange}
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-6 py-4.5 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                  />
                  {isSearching && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {userSearchResults.length > 0 && (
                    <div className="absolute z-[110] w-full mt-3 bg-white rounded-[2rem] shadow-2xl border border-primary/20 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                      {userSearchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addSelectedUser(user)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/10 transition-colors text-left group/user"
                        >
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.fullName || user.email}
                              className="w-12 h-12 rounded-2xl object-cover border border-border/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-secondary">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-sm text-foreground group-hover/user:text-secondary transition-colors">
                              {user.fullName || 'Member'}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Plus className="w-4 h-4 text-primary opacity-0 group-hover/user:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-3 italic text-center">Your collaborators will have full view of this inventory hub.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
              <button
                type="submit"
                disabled={createInventoryMutation.isPending}
                className="py-5 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2"
              >
                {createInventoryMutation.isPending ? 'Processing...' : 'Create Hub'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-5 bg-white text-muted-foreground rounded-2xl hover:bg-gray-50 transition-all font-bold border border-border/40 hover:border-border order-2 sm:order-1"
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