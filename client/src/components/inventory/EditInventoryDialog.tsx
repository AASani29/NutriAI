import { useState, useEffect } from 'react';
import { X, User, Archive, ArchiveX } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface EditInventoryDialogProps {
  inventory: {
    id: string;
    name: string;
    description?: string;
    members?: Array<{
      id: string;
      userId?: string | null;
      memberName?: string | null;
      role: string;
    }>;
    isArchived?: boolean;
  };
  onClose: () => void;
  onUpdate: (updatedData: any) => Promise<void>;
  onArchive: () => Promise<void>;
  onUnarchive: () => Promise<void>;
  isLoading?: boolean;
}

export function EditInventoryDialog({
  inventory,
  onClose,
  onUpdate,
  onArchive,
  onUnarchive,
  isLoading = false,
}: EditInventoryDialogProps) {
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  // Load existing members
  useEffect(() => {
    if (inventory.members) {
      const membersList = inventory.members
        .filter(m => m.userId)
        .map(m => ({
          id: m.userId,
          memberName: m.memberName || 'Unknown',
          email: m.memberName, // Using memberName as email placeholder
        }));
      setSelectedUsers(membersList);
    }
  }, [inventory.members]);

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
        // Filter out already selected users
        const filtered = (data.users || []).filter(
          (user: any) => !selectedUsers.find(u => u.id === user.id)
        );
        setUserSearchResults(filtered);
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

  const handleSaveChanges = () => {
    const shareWithEmails = selectedUsers.map(u => u.email || u.memberName);
    onUpdate({
      shareWith: shareWithEmails,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Pantry</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage users and archive settings.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pantry Info */}
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="font-black text-sm text-slate-900 mb-1">{inventory.name}</h3>
          {inventory.description && (
            <p className="text-xs text-slate-500 line-clamp-2">{inventory.description}</p>
          )}
        </div>

        {/* Shared Users Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Shared With ({selectedUsers.length})
            </label>

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
                        alt={user.fullName || user.email || user.memberName}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-bold">
                      {user.fullName || user.email || user.memberName}
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
                className="w-full px-5 py-4 border border-slate-100 rounded-xl text-secondary text-slate-800 font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
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
            <p className="text-xs text-slate-400 mt-2">Add users to share this pantry with them.</p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-100" />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Archive Section */}
        <div className="mb-8">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Archive Status
          </label>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-black text-sm text-slate-900">
                {inventory.isArchived ? 'Archived' : 'Active'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {inventory.isArchived
                  ? 'This pantry is archived and hidden from your main view.'
                  : 'This pantry is active and visible.'}
              </p>
            </div>
            {inventory.isArchived ? (
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await onUnarchive();
                  } catch (err: any) {
                    setError(err?.message || 'Failed to unarchive pantry');
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                <ArchiveX className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'Unarchive'}
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await onArchive();
                  } catch (err: any) {
                    setError(err?.message || 'Failed to archive pantry');
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                <Archive className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'Archive'}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="flex-1 py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl hover:text-secondary transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
