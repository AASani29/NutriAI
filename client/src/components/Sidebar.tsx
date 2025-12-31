import { useClerk, useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'home',
  },
  {
    label: 'AI Intelligence',
    to: '/intelligence',
    icon: 'analytics',
  },
  {
    label: 'Inventory',
    to: '/inventory',
    icon: 'inventory_2',
  },
  {
    label: 'Daily Log',
    to: '/daily-log',
    icon: 'book',
  },
  {
    label: 'Meal Planner',
    to: '/meal-planner',
    icon: 'calendar_today',
  },
  {
    label: 'Resources',
    to: '/resources',
    icon: 'bookmark',
  },
  {
    label: 'Neighbourhood',
    to: '/neighbourhood',
    icon: 'groups',
  },
];

export default function Sidebar({ isExpanded, setIsExpanded }: { isExpanded: boolean, setIsExpanded: (val: boolean) => void }) {
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside 
      className={`flex-shrink-0 flex flex-col items-center py-8 bg-card rounded-3xl shadow-soft h-[calc(100vh-2rem)] fixed top-4 left-4 justify-between z-20 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64 px-6' : 'w-20 lg:w-24'
      }`}
    >
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Logo / Toggle Button */}
        <div className="w-full flex items-center justify-between px-4">
          <div className={`flex items-center gap-3 text-primary transition-all duration-300 ${!isExpanded && 'mx-auto'}`}>
            <span className="material-icons-round text-4xl">grid_view</span>
            {isExpanded && <span className="text-xl font-black text-foreground tracking-tight">NutriAI</span>}
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-muted-foreground hover:bg-primary hover:text-black transition-all ${!isExpanded && 'hidden'}`}
          >
            <span className="material-icons-round text-sm">
              {isExpanded ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={!isExpanded ? item.label : ''}
                className={`flex items-center gap-4 rounded-full transition-all duration-300 group ${
                  isExpanded ? 'px-4 py-3 justify-start w-full' : 'w-12 h-12 justify-center mx-auto'
                } ${
                  isActive
                    ? 'bg-primary text-black shadow-lg shadow-primary/30 scale-105'
                    : 'text-muted-foreground hover:text-primary hover:bg-gray-50'
                }`}
              >
                <span className={`material-icons-outlined text-2xl ${isActive ? 'text-black' : ''}`}>{item.icon}</span>
                {isExpanded && (
                  <span className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isActive ? 'text-black' : 'text-foreground'
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mini Toggle for Collapsed State */}
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-muted-foreground hover:bg-primary hover:text-black transition-all"
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <Link
          to="/profile"
          className={`flex items-center gap-4 rounded-full text-muted-foreground hover:text-primary hover:bg-gray-50 transition-all font-display ${
            isExpanded ? 'px-4 py-3 justify-start w-full' : 'w-12 h-12 justify-center mx-auto'
          }`}
        >
          <span className="material-icons-outlined text-2xl">profile</span>
          {isExpanded && <span className="font-bold text-foreground">Profile</span>}
        </Link>

        {/* User Profile / Logout Toggle */}
        <div 
          className={`relative group cursor-pointer w-full flex items-center transition-all ${
            isExpanded ? 'gap-4 px-2' : 'justify-center'
          }`} 
          onClick={handleLogout} 
          title={!isExpanded ? 'Logout' : ''}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shadow-sm flex-shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white">
                <span className="material-icons-outlined">person</span>
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-foreground truncate">{user?.fullName || 'User'}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Logout</span>
            </div>
          )}
          {/* Logout Overlay on Hover (only for collapsed state) */}
          {!isExpanded && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity w-12 h-12 mx-auto">
              <span className="material-icons-outlined text-white text-xl">logout</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
