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
    useUnarchiveInventory 
  } = useInventory();
  const { data: inventories, isLoading, isError, refetch } = useGetInventories();
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
    <main className="flex-1 overflow-y-auto bg-white rounded-xl">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 px-4 ">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pantry Inventory</h1>
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
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-all shadow-lg font-bold active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Pantry</span>
            </button>
          </div>
        </header>

        {/* Inventory Health - Horizontal Stats */}
        <div className="px-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-500">{expiringSoon}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm">
                  <ArchiveX className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Archived</p>
                  <p className="text-2xl font-bold text-foreground">{archivedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 py-2 px-4">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              filterTab === 'all'
                ? 'bg-styled-card text-secondary shadow-lg shadow-primary/20'
                : 'bg-white text-slate-400 hover:text-secondary'
            }`}
          >
            All Pantries
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              filterTab === 'active'
                ? 'bg-styled-card text-secondary shadow-lg shadow-primary/20'
                : 'bg-white text-slate-400 hover:text-secondary'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterTab('archived')}
            className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              filterTab === 'archived'
                ? 'bg-styled-card text-secondary shadow-lg shadow-primary/20'
                : 'bg-white text-slate-400 hover:text-secondary'
            }`}
          >
            Archived
          </button>
          <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl text-secondary text-slate-400 hover:text-secondary transition-all">
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
              onClick={() => !inventory.isArchived && navigate(`/inventory/${inventory.id}`)}
              className={`group shadow-xl bg-styled-card rounded-[2.5rem] p-8 border border-slate-100 transition-all duration-500 flex flex-col relative overflow-hidden ${
                inventory.isArchived
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(172,156,6,0.08)] cursor-pointer'
              }`}
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 text-secondary rounded-bl-[3rem] -z-10 group-hover:bg-styled-card/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl text-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100/50">
                  {getInventoryIcon(inventory.name)}
                </div>
                <div className="flex items-center gap-3">
                  {/* Edit Menu Button or Unarchive Button - Only show for owners */}
                  {inventory.accessRole === 'owner' && (
                    inventory.isArchived ? (
                      // Show Unarchive button for archived inventories
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
                        disabled={unarchiveInventoryMutation.isPending}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xs uppercase tracking-widest transition-all z-10"
                      >
                        <ArchiveX className="w-4 h-4" />
                        {unarchiveInventoryMutation.isPending && editingInventory?.id === inventory.id ? 'Unarchiving...' : 'Unarchive'}
                      </button>
                    ) : (
                      // Show three-dot menu for active inventories
                      <button
                        onClick={(e) => handleEditInventory(inventory, e)}
                        className="transition-opacity p-2 hover:bg-white/50 rounded-lg z-10 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-5 h-5 text-slate-600" />
                      </button>
                    )
                  )}
                  {/* Status Badge */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status</div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${inventory.isArchived ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{inventory.isArchived ? 'Archived' : 'Active'}</span>
                    </div>
                    {inventory.accessRole && (
                      <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-white/70 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100">
                        {inventory.accessRole === 'owner' ? 'Owner' : 'Shared with you'}
                        {inventory.accessRole === 'member' && inventory.ownerName ? (
                          <span className="text-slate-400">· {inventory.ownerName}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-2xl text-slate-900 tracking-tight group-hover:text-secondary transition-colors mb-1">{inventory.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60 line-clamp-1">{inventory.description || 'Global Storage Unit'}</p>
              </div>

              {/* Shared Users Dropdown - Only show if there are members, user is owner, and not archived */}
              {inventory.accessRole === 'owner' && inventory.members && inventory.members.length > 0 && !inventory.isArchived && (
                <div className="mb-8 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === inventory.id ? null : inventory.id);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      Shared with ({inventory.members.length})
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openDropdown === inventory.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === inventory.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {inventory.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                        >
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {member.memberName || 'Unknown User'}
                            </p>
                            <p className="text-xs text-slate-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-secondary rounded-2xl p-4 border border-slate-100/50 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quantity</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{inventory.itemCount || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items</span>
                  </div>
                </div>
                <div className="text-secondary rounded-2xl p-4 border border-slate-100/50 bg-white">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Alerts</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-red-500">{inventory.expiringCount || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hub Integrity</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{(inventory.expiringCount || 0) > 0 ? '85%' : '100%'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-styled-card h-full rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(172,156,6,0.3)]" 
                    style={{ width: (inventory.expiringCount || 0) > 0 ? '85%' : '100%' }}
                  ></div>
                </div>
              </div>

              {/* Hover Access Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-styled-card transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </div>
          ))}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <form
            className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-slate-100"
            onSubmit={handleCreateInventory}
          >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">New Pantry Hub</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Initialize a new inventory tracking system.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Hub Name</label>
                <input
                  name="name"
                  required
                  autoFocus
                  placeholder="e.g. Master Fridge"
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea
                  name="description"
                  placeholder="What's in this hub?"
                  rows={3}
                  className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Share With Users</label>
                
                {/* Selected Users Chips */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 bg-styled-card/10 text-slate-800 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName || user.email}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold">
                          {user.fullName || user.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSelectedUser(user.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* User Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={handleUserSearchChange}
                    placeholder="Search users by name or email..."
                    className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {userSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto">
                      {userSearchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addSelectedUser(user)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.fullName || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">
                              {user.fullName || 'Unknown User'}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Search and select users to share this pantry with them.</p>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="submit"
                disabled={createInventoryMutation.isPending}
                className="flex-1 py-4 bg-secondary text-white rounded-lg font-bold hover:bg-secondary/90 transition-all shadow-lg"
              >
                {createInventoryMutation.isPending ? 'Processing...' : 'Create Hub'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-card text-muted-foreground rounded-lg hover:bg-muted transition-all font-medium border border-border"
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