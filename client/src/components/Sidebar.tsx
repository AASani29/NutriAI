import { useClerk, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  Package,
  NotebookPen,
  UtensilsCrossed,
  Library,
  MapPinHouse,
  ChevronLeft,
  LogOut,
  User,
  Info,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper for conditional classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",

    info: "Track inventory items,expiring foods,todays activities and top recommendations all for you",
  },
  
  {
    label: "Inventory",
    to: "/inventory",
    icon: Package,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",
  },
  {
    label: "Consumption Log",
    to: "/daily-log",
    icon: NotebookPen,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",
  },
  {
    label: "Meal Planner",
    to: "/meal-planner",
    icon: UtensilsCrossed,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",
  },
  {
    label: "Resources",
    to: "/resources",
    icon: Library,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",
  },
  {
    label: "Neighbourhood",
    to: "/neighbourhood",
    icon: MapPinHouse,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    activeColor: "bg-secondary text-white",
  },
];

export default function Sidebar({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}) {
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        " flex-shrink-0 flex flex-col items-center py-6 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl h-[calc(100vh)] fixed top-0 left-0 justify-between z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
        isExpanded ? "w-72 px-4" : "w-20 lg:w-24"
      )}
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo / Toggle Button */}
        <div className="w-full flex items-center justify-between px-2 mb-2">
          <div
            className={cn(
              "hidden transition-all duration-300 ",
              isExpanded && "block px-2"
            )}
          >
            <img
              src="/colored-logo.png"
              alt="NutriAI Logo"
              className="h-13 w-auto object-contain"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center justify-center rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden",
              isExpanded
                ? "w-10 h-10 bg-slate-100 text-slate-500 hover:bg-slate-200"
                : "w-12 h-12 bg-secondary shadow-lg mx-auto"
            )}
          >
            {isExpanded ? (
              <ChevronLeft size={18} />
            ) : (
              <img
                src="/gajor-white.png"
                alt="N"
                className="w-8 h-8 object-contain"
              />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                title={!isExpanded ? item.label : ""}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl transition-all duration-300 group ",
                  isExpanded
                    ? "px-4 py-3.5 w-full"
                    : "w-12 h-12 justify-center mx-auto",
                  isActive
                    ? cn(
                        item.activeColor,
                        "shadow-lg shadow-primary/20 font-medium"
                      )
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <Icon
                  size={22}
                  className={cn(
                    "transition-all duration-300",
                    isActive
                      ? "scale-110"
                      : cn(item.color, "group-hover:scale-110")
                  )}
                />

                {isExpanded && (
                  <span className="font-medium whitespace-nowrap tracking-wide">
                    {item.label}
                  </span>
                )}

                {isExpanded && item.info && (
                  // This wrapper shows icon on navitem hover
                  <div className="ml-auto relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Icon itself is a new group with a specific name */}
                    <div className="relative group/icon">
                      <Info
                        size={18}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                      />

                      {/* Tooltip only appears when icon is hovered */}
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-54 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm text-gray-500 opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-opacity duration-300 z-50 pointer-events-none">
                        {item.info}
                      </div>
                    </div>
                  </div>
                )}
                {/* Active Indicator Dot (Collapsed) */}
                {!isExpanded && isActive && (
                  <div
                    className={cn(
                      "absolute right-2 top-2 w-2 h-2 rounded-full ring-2 ring-white",
                      item.activeColor.split(" ")[0]
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions - User Logic */}
      <div className="flex flex-col gap-3 w-full">
        {isExpanded ? (
          // Expanded User Card
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm group hover:shadow-md transition-all duration-300 cursor-default">
            <Link to="/profile" className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                to="/profile"
                className="block truncate font-bold text-slate-800 hover:text-emerald-600 transition-colors"
              >
                {user?.fullName || "User"}
              </Link>
              <div className="text-xs text-slate-400 font-medium truncate">
                {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          // Collapsed User Avatar
          <Link
            to="/profile"
            className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white shadow-md mx-auto relative group"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="User"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                <User size={24} />
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
