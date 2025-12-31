import {
  Apple,
  Utensils,
  Plus,
  ArrowRight,
  Droplets,
  PieChart,
  Search,
  Dumbbell,
  Calendar,
  Filter,
  Package,
  X,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useInventory, type ConsumptionLog } from '../hooks/useInventory';

export default function DailyLogPage() {
  // Stable default date range using useMemo to prevent cache misses
  const defaultDateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    // Normalize to start/end of day for consistent caching
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }, []);

  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    inventoryId: '',
    category: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [hydration, setHydration] = useState(1.5);

  const { useGetConsumptionLogs, useGetInventories } = useInventory();
  const { data: inventories, isLoading: inventoriesLoading } =
    useGetInventories();

  // Memoize the consumption logs query parameters to prevent unnecessary refetches
  const consumptionParams = useMemo(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    inventoryId: filters.inventoryId || undefined,
  }), [dateRange.startDate, dateRange.endDate, filters.inventoryId]);

  const {
    data: consumptionLogs,
    isLoading: consumptionLoading,
    error: consumptionError,
  } = useGetConsumptionLogs(consumptionParams);


  // Filter logs based on selected filters
  const filteredLogs = useMemo(() => {
    if (!consumptionLogs) return [];

    return consumptionLogs.filter(log => {
      const matchesCategory =
        !filters.category || log.foodItem?.category === filters.category;
      const matchesSearch = !searchQuery || 
        log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.foodItem?.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [consumptionLogs, filters.category]);

  // Group logs by date
  const logsByDate = useMemo(() => {
    const grouped: Record<string, ConsumptionLog[]> = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.consumedAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  }, [filteredLogs]);

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayLogs = logsByDate[today] || [];

    const totalItems = todayLogs.length;
    const totalQuantity = todayLogs.reduce((sum, log) => sum + log.quantity, 0);
    const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const uniqueCategories = new Set(
      todayLogs.map(log => log.foodItem?.category).filter(Boolean),
    ).size;

    return { totalItems, totalQuantity, uniqueCategories, totalCalories };
  }, [logsByDate]);

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'fruit':
      case 'vegetable':
        return <Apple className="w-4 h-4" />;
      case 'dairy':
        return <Package className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  // Get category colors
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'fruit':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'vegetable':
        return 'bg-primary/20 text-black border-primary/30';
      case 'dairy':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'grain':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'protein':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      inventoryId: '',
      category: '',
    });
  };

  const hasActiveFilters = filters.inventoryId || filters.category;

  // Optimized date change handlers to prevent unnecessary cache invalidation
  const handleStartDateChange = useMemo(() =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      newDate.setHours(0, 0, 0, 0); // Start of day
      setDateRange(prev => ({
        ...prev,
        startDate: newDate,
      }));
    }, []
  );

  const handleEndDateChange = useMemo(() =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      newDate.setHours(23, 59, 59, 999); // End of day
      setDateRange(prev => ({
        ...prev,
        endDate: newDate,
      }));
    }, []
  );

  // Get unique categories from logs
  const availableCategories = Array.from(
    new Set(
      (consumptionLogs || [])
        .map(log => log.foodItem?.category)
        .filter(Boolean),
    ),
  ).sort();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };


  // Macro Totals for the right column
  const totalMacros = useMemo(() => {
    return filteredLogs.reduce((acc, log) => ({
      carbs: acc.carbs + (log.carbohydrates || 0),
      protein: acc.protein + (log.protein || 0),
      fat: acc.fat + (log.fat || 0)
    }), { carbs: 0, protein: 0, fat: 0 });
  }, [filteredLogs]);

  const goalCalories = 2500;
  const consumedCalories = dailyStats.totalCalories;
  const caloriesLeft = Math.max(0, goalCalories - consumedCalories);
  const caloriePercentage = Math.min(100, (consumedCalories / goalCalories) * 100);
  const strokeDasharray = 552;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * caloriePercentage) / 100;

  if (consumptionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-black font-black uppercase tracking-widest text-xs">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (consumptionError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-red-50 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2">Something went wrong</h2>
          <p className="text-muted-foreground font-medium mb-8">We couldn't load your consumption logs. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 rounded-full font-black hover:opacity-90 transition-all active:scale-95"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Consumption Log</h1>
          <p className="text-muted-foreground font-medium mt-1">Track your daily intake and maintain a healthy balance.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              className="pl-12 pr-4 py-3 rounded-full border-none bg-white text-gray-700 placeholder-gray-400 shadow-soft focus:ring-2 focus:ring-black w-full md:w-80 font-bold" 
              placeholder="Search food..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-black text-white px-8 py-3 rounded-full font-black flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-black/10">
            <Plus className="w-5 h-5 text-primary font-black" />
            Log Meal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Banner Card */}
          <div className="bg-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-soft flex flex-col md:flex-row items-center justify-between min-h-[320px] border border-gray-50/50">
            <div className="absolute inset-0 z-0 opacity-10">
              <img alt="Healthy Food" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
            </div>
            
            <div className="relative z-10 w-full md:w-1/2">
              <h2 className="text-5xl font-black text-black mb-4 leading-tight">Eat Smarter,<br/><span className="text-primary-dark">Live Better!</span></h2>
              <p className="text-muted-foreground font-medium mb-8 max-w-sm leading-relaxed">
                You've consumed <span className="text-black font-black">{Math.round(consumedCalories)} kcal</span> today. 
                That's <span className="text-black font-black flex items-center gap-1 inline-flex">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {Math.round(caloriePercentage)}%
                </span> of your daily goal.
              </p>
              <div className="flex items-center gap-6">
                <button className="bg-black text-white px-8 py-4 rounded-full font-black hover:bg-primary hover:text-black transition-all flex items-center gap-3 group shadow-xl shadow-black/10 active:scale-95">
                  View Analytics
                  <div className="bg-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 text-black" />
                  </div>
                </button>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-2/5 flex justify-center mt-12 md:mt-0">
              <div className="relative w-56 h-56">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-gray-100" cx="112" cy="112" fill="transparent" r="98" stroke="currentColor" strokeWidth="16"></circle>
                  <circle className="text-black transition-all duration-1000 ease-out" cx="112" cy="112" fill="transparent" r="98" stroke="currentColor" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="16"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-black tracking-tighter">{Math.round(caloriesLeft)}</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1">kcal Left</span>
                </div>
                <div className="absolute -top-2 -right-2 bg-primary/20 backdrop-blur-md border border-primary/50 text-black px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Carbs {Math.round((totalMacros.carbs * 4 / (consumedCalories || 1)) * 100)}%</div>
                <div className="absolute bottom-4 -left-6 bg-black text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Protein {Math.round((totalMacros.protein * 4 / (consumedCalories || 1)) * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Today's Meals Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex-1">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-black tracking-tight">Today's Meals</h3>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Daily Log Feed</p>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 border flex items-center gap-2 ${
                  showFilters || hasActiveFilters 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-50 text-black border-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mb-10 p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Date Range Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date Range</label>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <Calendar className="w-4 h-4 text-black" />
                      <input
                        type="date"
                        value={dateRange.startDate.toISOString().split('T')[0]}
                        onChange={handleStartDateChange}
                        className="bg-transparent text-xs font-bold focus:outline-none w-full"
                      />
                      <span className="text-muted-foreground font-black">—</span>
                      <input
                        type="date"
                        value={dateRange.endDate.toISOString().split('T')[0]}
                        onChange={handleEndDateChange}
                        className="bg-transparent text-xs font-bold focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Inventory Filter */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory</label>
                    <select
                      value={filters.inventoryId}
                      onChange={e => setFilters(prev => ({ ...prev, inventoryId: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black outline-none shadow-sm"
                      disabled={inventoriesLoading}
                    >
                      <option value="">All Inventories</option>
                      {(inventories || []).map(inventory => (
                        <option key={inventory.id} value={inventory.id}>{inventory.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black outline-none shadow-sm"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>
                          {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {filters.inventoryId && (
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          {inventories?.find(i => i.id === filters.inventoryId)?.name}
                          <button onClick={() => setFilters(prev => ({ ...prev, inventoryId: '' }))}>
                            <X className="w-3 h-3 text-primary" />
                          </button>
                        </span>
                      )}
                      {filters.category && (
                        <span className="px-3 py-1 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          {filters.category}
                          <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={clearFilters}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-black hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-12">
              {Object.keys(logsByDate).length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <Utensils className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No meals logged for this period</p>
                  <button className="mt-4 text-black font-black hover:text-primary underline underline-offset-8 transition-all">Log your first meal</button>
                </div>
              ) : (
                Object.entries(logsByDate)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([date, logs]) => (
                    <div key={date} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h4 className="text-sm font-black text-black uppercase tracking-[0.3em] whitespace-nowrap">{formatDate(date)}</h4>
                        <div className="h-px bg-gray-100 w-full" />
                      </div>
                      
                      <div className="space-y-4">
                        {logs.sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime()).map(log => (
                          <div key={log.id} className="flex items-center p-5 rounded-3xl hover:bg-gray-50 transition-all border border-gray-100/50 group bg-white shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-5 flex-shrink-0 group-hover:scale-105 transition-transform bg-gray-50 flex items-center justify-center">
                              <div className={`w-full h-full flex items-center justify-center ${getCategoryColor(log.foodItem?.category)}`}>
                                {getCategoryIcon(log.foodItem?.category)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-black text-lg text-black leading-none mb-1 group-hover:text-primary transition-colors">{log.itemName}</h4>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-primary" />
                                      {formatTime(log.consumedAt)} • {log.foodItem?.category || 'Uncategorized'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-xl text-black tracking-tighter block">{Math.round(log.calories || 0)} <span className="text-[8px] text-muted-foreground uppercase tracking-widest">kcal</span></span>
                                    {log.quantity > 1 && (
                                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Qty: {log.quantity}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <div className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-1 rounded-lg border border-gray-100">
                                    {log.carbohydrates?.toFixed(1) || 0}g Carbs
                                  </div>
                                  <div className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-1 rounded-lg border border-gray-100">
                                    {log.protein?.toFixed(1) || 0}g Protein
                                  </div>
                                  <div className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-1 rounded-lg border border-gray-100">
                                    {log.fat?.toFixed(1) || 0}g Fat
                                  </div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}

              {/* Add Snack Card */}
              <div className="flex items-center p-6 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-100 group cursor-pointer hover:border-black transition-all mt-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white text-gray-300 group-hover:scale-110 group-hover:bg-black group-hover:text-primary transition-all shadow-sm">
                  <Utensils className="w-8 h-8" />
                </div>
                <div className="flex-1 flex items-center justify-between ml-6">
                  <div>
                    <h4 className="font-black text-lg text-black">Feeling peckish?</h4>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Log a quick snack to stay precise</p>
                  </div>
                  <button className="w-12 h-12 rounded-2xl bg-black text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Hydration Card */}
          <div className="bg-gradient-to-br from-[#8EC5DB] to-[#7FB0C8] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl min-h-[340px] flex flex-col group">
            <div className="absolute -right-10 -top-10 w-44 h-44 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                Hydration <Droplets className="w-5 h-5 text-white/80" />
              </h3>
              <p className="text-xs font-medium opacity-80 mb-8 max-w-[80%] leading-relaxed">Boost your energy and focus with optimal water intake throughout the day.</p>
              
              <div className="grid grid-cols-6 gap-2 mb-10">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-12 rounded-xl transition-all duration-500 ${i < Math.floor(hydration / 0.2) ? 'bg-white opacity-100 shadow-lg' : 'bg-white/20'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-end mt-auto relative z-10">
              <button 
                onClick={() => setHydration(prev => Math.min(prev + 0.25, 3))}
                className="bg-white text-[#8EC5DB] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-all active:scale-95"
              >
                Add 250ml
              </button>
              <div className="text-right">
                <span className="text-5xl font-black block leading-none tracking-tighter">{hydration.toFixed(1)}L</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">/ 2.5L Goal</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 flex shadow-2xl">
              <button className="w-10 h-10 rounded-full bg-white text-[#8EC5DB] font-black text-xs flex items-center justify-center shadow-lg transition-all scale-105">D</button>
              <button className="w-10 h-10 rounded-full text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center transition-all">W</button>
              <button className="w-10 h-10 rounded-full text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center transition-all">M</button>
            </div>
          </div>

          {/* Macros Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-50/50">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-black text-xl text-black flex items-center gap-2 tracking-tight">
                  <PieChart className="w-6 h-6 text-primary" />
                  Macros
                </h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Daily Balance</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-black tracking-tighter">{Math.round(consumedCalories)}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">kcal</span>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { label: 'Carbohydrates', value: totalMacros.carbs, goal: 300, color: 'bg-primary', unit: 'g' },
                { label: 'Proteins', value: totalMacros.protein, goal: 180, color: 'bg-blue-400', unit: 'g' },
                { label: 'Fats', value: totalMacros.fat, goal: 70, color: 'bg-orange-400', unit: 'g' }
              ].map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-black text-black uppercase tracking-widest">{macro.label}</span>
                    <span className="text-sm font-black text-black tracking-tighter">
                      {Math.round(macro.value)}{macro.unit} 
                      <span className="text-muted-foreground text-[10px] font-bold ml-1">/ {macro.goal}{macro.unit}</span>
                    </span>
                  </div>
                  <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div 
                      className={`h-full ${macro.color} rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${Math.min(100, (macro.value / macro.goal) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50">
              <div className="flex justify-between items-end h-20 gap-1.5 px-2">
                {[40, 60, 45, 70, 90, 100, 80, 65, 50, 30, 25, 35, 40, 30, 45].map((h, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 rounded-full transition-all duration-500 hover:scale-y-110 cursor-pointer ${i >= 10 ? 'bg-gray-100' : 'bg-primary'}`} 
                    style={{ height: `${h}%`, opacity: i === 5 ? 0.3 : 1 }} 
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Morning</span>
                <span>Midnight</span>
              </div>
            </div>
          </div>

          {/* Weight Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-50/50 flex-1 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-xl text-black flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-muted-foreground group-hover:text-black transition-colors" />
                  Fitness
                </h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Target range: 68kg - 84kg</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-black text-black tracking-tighter">188 <span className="text-xs text-muted-foreground font-medium">cm</span></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8EC5DB]">Hero Build</span>
              </div>
            </div>

            <div className="relative h-20 w-full my-6 group-hover:scale-105 transition-transform duration-500">
              <svg className="w-full h-full text-[#8EC5DB] drop-shadow-xl" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,15 Q25,5 50,15 T100,15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                <circle cx="20" cy="11" fill="white" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div>
                <span className="text-5xl font-black text-black tracking-tighter">82<span className="text-2xl text-muted-foreground font-medium tracking-tight">kg</span></span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] w-32 leading-relaxed">Weekly Progress Goal</p>
                <p className="text-xs font-black text-black mt-1 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Keep Pushing →</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
