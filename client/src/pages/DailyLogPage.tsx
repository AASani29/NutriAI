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
import { useMemo, useState, useRef, useEffect } from 'react';
import { useInventory, type ConsumptionLog } from '../hooks/useInventory';
import { useProfile } from '../context/ProfileContext';
import { useApi } from '../hooks/useApi';

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
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');



  /* --- HYDRATION LOGIC --- */
  const {
    useGetConsumptionLogs,
    useGetInventories,
    useUpdateHydration,
    useGetHydrationHistory,
    useGetFitness,
    useGetHydration,
    useUpdateFitness
  } = useInventory();

  const { profile, refreshProfile } = useProfile();
  const api = useApi();

  // New Date States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // For monthly view navigation
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [weightUpdateMutation, setWeightUpdateMutation] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.inventoryId, filters.category, searchQuery, selectedDate, dateRange.startDate, dateRange.endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setDateRange(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setDateRange(prev => ({ ...prev, endDate: date }));
    }
  };

  const clearFilters = () => {
    setFilters({ inventoryId: '', category: '' });
    setSearchQuery('');
    setDateRange(defaultDateRange);
  };

  const hasActiveFilters = filters.inventoryId || filters.category || searchQuery ||
    dateRange.startDate.toDateString() !== defaultDateRange.startDate.toDateString() ||
    dateRange.endDate.toDateString() !== defaultDateRange.endDate.toDateString();

  // Fitness Modal State
  const [isFitnessModalOpen, setIsFitnessModalOpen] = useState(false);
  const [tempWeight, setTempWeight] = useState('');
  const [tempSteps, setTempSteps] = useState('');
  // Start from 2 days before today (showing today and nearby days centered)
  const [weightChartStartIndex, setWeightChartStartIndex] = useState(27); // Index 27 = 2 days ago, 28 = yesterday, 29 = today
  // Weight chart view mode (daily carousel or monthly bars)
  const [weightChartViewMode, setWeightChartViewMode] = useState<'daily' | 'monthly'>('daily');
  // Monthly chart carousel index (showing 5 months at a time)
  const [monthlyChartStartIndex, setMonthlyChartStartIndex] = useState(7); // Start from 2 months ago

  // Fetch Hydration for Selected Date (Main Display)
  const { data: hydrationData, isLoading: hydrationLoading } = useGetHydration(selectedDate);
  const { data: fitnessData } = useGetFitness(selectedDate);
  const updateFitnessMutation = useUpdateFitness();

  // Past 30 dates for daily weight history view
  const pastDates = useMemo(() => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }
    return dates;
  }, []);

  // Past 12 months for monthly weight history view
  const pastMonths = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      months.push(d);
    }
    return months;
  }, []);

  // Fetch fitness data for each of the past 30 days (daily view)
  const fitnessHistory = useMemo(() => {
    return pastDates.map(date => {
      const isToday = date.toDateString() === new Date().toDateString();
      // For today, use current fitnessData. For other days, we'd need to fetch from backend
      // For now, we'll store just today's data; in production you'd fetch each day
      if (isToday && fitnessData?.weight) {
        return { date, weight: fitnessData.weight, steps: fitnessData.steps };
      }
      return { date, weight: null, steps: null };
    });
  }, [pastDates, fitnessData]);

  // Fetch History for Monthly View OR Daily Strip (last 30 days)
  // Determine range based on viewMode
  const historyStart = useMemo(() => {
    if (viewMode === 'monthly') {
      const d = new Date(selectedMonth);
      d.setDate(1); // Start of month
      return d;
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 30); // Last 30 days
      return d;
    }
  }, [viewMode, selectedMonth]);

  const historyEnd = useMemo(() => {
    if (viewMode === 'monthly') {
      const d = new Date(selectedMonth);
      d.setMonth(d.getMonth() + 1);
      d.setDate(0); // End of month
      return d;
    } else {
      return new Date(); // Today
    }
  }, [viewMode, selectedMonth]);

  const { data: hydrationHistory } = useGetHydrationHistory(historyStart, historyEnd);

  // Prepare Daily History Strip Data (ensuring all days exist)
  const dailyHistory = useMemo(() => {
    if (!hydrationHistory) return [];
    // For 'Daily' view, we want a list of last 30 days. 
    // We'll trust the API returns existing logs, but for the UI strip we might want to fill gaps
    // For now, let's just map what we have, or generate a full list if needed.
    // To keep it simple and robust, let's generate the last 30 days array and fill with data.
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const log = hydrationHistory.find((h: any) => new Date(h.date).toDateString() === d.toDateString());
      days.push({
        date: d,
        amount: log?.amount || 0,
        goal: log?.goal || 2.5
      });
    }
    return days;
  }, [hydrationHistory]);

  // Prepare Monthly Stats
  const monthlyStats = useMemo(() => {
    if (!hydrationHistory) return { total: 0, avg: 0, daysMetGoal: 0 };

    const total = hydrationHistory.reduce((sum: number, log: any) => sum + (log.amount || 0), 0);
    const avg = hydrationHistory.length > 0 ? total / hydrationHistory.length : 0;
    const daysMetGoal = hydrationHistory.filter((log: any) => (log.amount || 0) >= (log.goal || 2.5)).length;

    return { total, avg, daysMetGoal };
  }, [hydrationHistory]);


  const updateHydrationMutation = useUpdateHydration();

  const handleAddWater = async () => {
    // Optimistic update logic handles valid data check
    const current = hydrationData?.amount || 0;
    const newAmount = Math.min(current + 0.25, 5); // Cap at 5L reasonable max
    try {
      await updateHydrationMutation.mutateAsync({ amount: newAmount, date: selectedDate });
    } catch (err) {
      console.error("Failed to update hydration", err);
    }
  };

  const handleMonthChange = (delta: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setSelectedMonth(newMonth);
  };

  const hydrationAmount = hydrationData?.amount || 0;
  const hydrationGoal = hydrationData?.goal || 2.5;

  // Calculate calories burned - ONLY from activity (steps), not BMR
  const calculateCaloriesBurned = useMemo(() => {
    if (!fitnessData) return 0;
    
    const steps = fitnessData.steps || 0;
    // Activity calories from steps (approximately 0.05 cal per step for average person)
    // This represents actual movement/activity, not resting metabolic rate
    const activityCalories = steps * 0.05;
    
    return Math.round(activityCalories);
  }, [fitnessData]);

  // Daily calorie burn goal (for circular progress)
  const dailyBurnGoal = 500; // Average daily activity calorie goal

  // Weight history (last 30 days for daily view) - Each day has its own weight data
  const weightHistory = useMemo(() => {
    return fitnessHistory.map((entry) => {
      // Use logged weight if available, otherwise no data (don't fall back to profile for all days)
      const weight = entry.weight || 0;
      
      return {
        date: entry.date,
        weight,
        isToday: entry.date.toDateString() === new Date().toDateString()
      };
    });
  }, [fitnessHistory]);

  // Monthly weight history (last 12 months) - Shows average weight per month
  const monthlyWeightHistory = useMemo(() => {
    return pastMonths.map((monthStart) => {
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      
      const isCurrentMonth = monthStart.getMonth() === new Date().getMonth() && 
                            monthStart.getFullYear() === new Date().getFullYear();
      
      // Get all fitness data for this month to calculate average weight
      const monthFitnessData = fitnessHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === monthStart.getMonth() && 
               entryDate.getFullYear() === monthStart.getFullYear() &&
               entry.weight > 0;
      });
      
      // Calculate average weight for the month
      let averageWeight = 0;
      if (monthFitnessData.length > 0) {
        const totalWeight = monthFitnessData.reduce((sum, entry) => sum + entry.weight, 0);
        averageWeight = totalWeight / monthFitnessData.length;
      }
      
      return {
        date: monthStart,
        year: monthStart.getFullYear(),
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        weight: averageWeight,
        isCurrentMonth,
        entriesCount: monthFitnessData.length
      };
    });
  }, [pastMonths, fitnessHistory]);

  // Handle weight update with profile sync
  const handleWeightUpdate = async (newWeight: number) => {
    try {
      setWeightUpdateMutation(true);
      // Update fitness data
      await updateFitnessMutation.mutateAsync({ weight: newWeight, date: selectedDate });
      // Update profile
      await api.updateProfile({ weight: newWeight });
      // Refresh profile to get latest data
      await refreshProfile(true);
    } catch (err) {
      console.error('Failed to update weight:', err);
    } finally {
      setWeightUpdateMutation(false);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const handleScrollStats = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to show today at the leftmost position
  useEffect(() => {
    if (scrollContainerRef.current && dailyHistory && dailyHistory.length > 0) {
      // Find today's button position
      const todayButton = scrollContainerRef.current.querySelector('[data-today="true"]');
      if (todayButton) {
        // Scroll so today is at the leftmost visible position
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const buttonRect = todayButton.getBoundingClientRect();
        const scrollLeft = scrollContainerRef.current.scrollLeft + buttonRect.left - containerRect.left;
        scrollContainerRef.current.scrollLeft = Math.max(0, scrollLeft - 16); // 16px offset for padding
      }
    }
  }, [dailyHistory]);

  // Reset weight chart indices when switching views
  useEffect(() => {
    setWeightChartStartIndex(27); // Start from 2 days before today
    setMonthlyChartStartIndex(7); // Start from 2 months ago
  }, [viewMode]);


  // ... (Keep existing inventories query) ...
  const { data: inventories, isLoading: inventoriesLoading } =
    useGetInventories();

  // ... (Keep existing consumptionLogs query) ...

  // ... (Inside the usage in JSX) ...


  const consumptionParams = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    return {
      startDate: showFilters ? dateRange.startDate : start,
      endDate: showFilters ? dateRange.endDate : end,
      inventoryId: filters.inventoryId || undefined,
      category: filters.category || undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
  }, [selectedDate, dateRange, filters.inventoryId, filters.category, searchQuery, viewMode, currentPage, showFilters]);

  const {
    data: consumptionResult,
    isLoading: consumptionLoading,
    error: consumptionError,
  } = useGetConsumptionLogs(consumptionParams);

  const consumptionLogs = consumptionResult?.consumptionLogs || [];
  const totalPages = consumptionResult?.totalPages || 1;
  const totalCalories = consumptionResult?.totalCalories || 0;


  // No local filtering needed anymore, results are filtered by the backend
  const filteredLogs = consumptionLogs;

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

  const macroGoals = useMemo(() => ({
    carbs: profile?.profile?.carbGoal ?? 300,
    protein: profile?.profile?.proteinGoal ?? 180,
    fat: profile?.profile?.fatGoal ?? 70
  }), [profile]);

  const goalCalories = profile?.profile?.energyGoal ?? 2500;
  const safeGoalCalories = goalCalories > 0 ? goalCalories : 1;
  const consumedCalories = totalCalories;
  const caloriesLeft = Math.max(0, goalCalories - consumedCalories);
  const caloriePercentage = Math.min(100, (consumedCalories / safeGoalCalories) * 100);
  const strokeDasharray = 552;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * caloriePercentage) / 100;



  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">Daily Log</h1>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Banner Card */}
            <div className="bg-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-soft flex flex-col md:flex-row items-center justify-between min-h-[320px] border border-gray-50/50">
              <div className="absolute inset-0 z-0 opacity-10">
                <img alt="Healthy Food" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
              </div>

              <div className="relative z-10 w-full md:w-1/2">
                <h2 className="text-5xl font-black text-black mb-4 leading-tight">Eat Smarter,<br /><span className="text-primary-dark">Live Better!</span></h2>
                <div className="space-y-4 mb-8">
                  <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
                    You've consumed <span className="text-black font-black">{Math.round(consumedCalories)} kcal</span> today.
                    That's <span className="text-black font-black flex items-center gap-1 inline-flex">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {Math.round(caloriePercentage)}%
                    </span> of your daily goal.
                  </p>
                  <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
                    You've burned <span className="text-black font-black">{calculateCaloriesBurned} kcal</span> today.
                    Net balance: <span className="text-black font-black flex items-center gap-1 inline-flex">
                      {calculateCaloriesBurned - consumedCalories > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {Math.abs(calculateCaloriesBurned - consumedCalories)} kcal
                    </span>
                  </p>
                </div>
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
            <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex-1 relative overflow-hidden">
              {/* Subtle Refetching Indicator */}
              {consumptionLoading && consumptionLogs.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-50 overflow-hidden z-20">
                  <div className="h-full bg-primary animate-progress origin-left"></div>
                </div>
              )}
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-black tracking-tight">Today's Meals</h3>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Daily Log Feed</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 border flex items-center gap-2 ${showFilters || hasActiveFilters
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-50 text-black border-gray-100'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="mb-10 p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300 shadow-inner">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Date Range Selector */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Date Range</label>
                      </div>
                      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black transition-all">
                        <input
                          type="date"
                          value={dateRange.startDate.toISOString().split('T')[0]}
                          onChange={handleStartDateChange}
                          className="bg-transparent text-xs font-bold focus:outline-none w-full cursor-pointer hover:text-secondary transition-colors"
                        />
                        <span className="text-muted-foreground font-black opacity-30">—</span>
                        <input
                          type="date"
                          value={dateRange.endDate.toISOString().split('T')[0]}
                          onChange={handleEndDateChange}
                          className="bg-transparent text-xs font-bold focus:outline-none w-full cursor-pointer hover:text-secondary transition-colors text-right"
                        />
                      </div>
                    </div>

                    {/* Inventory Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Source Inventory</label>
                      </div>
                      <select
                        value={filters.inventoryId}
                        onChange={e => setFilters(prev => ({ ...prev, inventoryId: e.target.value }))}
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black outline-none shadow-sm cursor-pointer hover:border-primary transition-all appearance-none"
                        disabled={inventoriesLoading}
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/9 5l7 7-7 7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                      >
                        <option value="">All Inventories</option>
                        {(inventories || []).map(inventory => (
                          <option key={inventory.id} value={inventory.id}>{inventory.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Filter className="w-4 h-4 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Food Category</label>
                      </div>
                      <select
                        value={filters.category}
                        onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black outline-none shadow-sm cursor-pointer hover:border-primary transition-all appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/9 5l7 7-7 7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
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
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-black hover:text-secondary transition-colors underline underline-offset-4"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-12">
                {consumptionLoading && consumptionLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-black font-black uppercase tracking-widest text-[10px]">Updating Log Feed...</p>
                  </div>
                ) : consumptionError ? (
                  <div className="text-center py-16 bg-red-50/30 rounded-[2rem] border-2 border-dashed border-red-100">
                    <X className="w-16 h-16 text-red-200 mx-auto mb-4" />
                    <p className="text-red-700 font-black uppercase tracking-widest text-xs">Failed to load meals</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 text-black font-black hover:text-secondary underline underline-offset-8 transition-all"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : Object.keys(logsByDate).length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <Utensils className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No meals logged for this period</p>
                    <button className="mt-4 text-black font-black hover:text-secondary underline underline-offset-8 transition-all">Log your first meal</button>
                  </div>
                ) : (
                  Object.entries(logsByDate)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, logs]) => (
                      <div key={date} className="space-y-6 animate-in fade-in duration-500">
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
                                    <h4 className="font-black text-lg text-black leading-none mb-1 group-hover:text-secondary transition-colors">{log.itemName}</h4>
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs"
                    >
                      ←
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl border transition-all font-black text-xs ${currentPage === i + 1
                          ? 'bg-black text-primary border-black'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-black hover:text-black'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs"
                    >
                      →
                    </button>
                  </div>
                )}

                {/* Add Snack Card */}
                <div className="flex items-center p-6 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-100 group cursor-pointer hover:border-black transition-all mt-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white text-gray-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-secondary transition-all shadow-sm">
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
          <div className="xl:sticky xl:top-8 flex flex-col gap-8 h-fit">
            {/* Hydration Card */}
            <div className="bg-gradient-to-br from-[#8EC5DB] to-[#7FB0C8] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl min-h-[380px] flex flex-col group">
              <div className="absolute -right-10 -top-10 w-44 h-104 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

              {/* Header / Date Selector */}
              <div className="relative z-10 mb-6 h-26">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                      Hydration <Droplets className="w-5 h-5 text-white/80" />
                      {hydrationLoading && <span className="text-[10px] opacity-70">Syncing...</span>}
                    </h3>
                    <p className="text-xs font-medium opacity-80 max-w-[80%] leading-relaxed">
                      {viewMode === 'daily'
                        ? selectedDate.toDateString() === new Date().toDateString() ? "Today's Intake" : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        : selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      }
                    </p>
                  </div>

                  {/* Monthly Navigation Arrows */}
                  {viewMode === 'monthly' && (
                    <div className="flex bg-white/10 rounded-full p-1 mt-20 mr-180">
                      <button
                        onClick={() => handleMonthChange(-1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => handleMonthChange(1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {viewMode === 'daily' ? (
                <>
                  {/* Daily View: History Strip */}
                  <div className="relative z-10 mb-8 group/strip">
                    {/* Left Scroll Button */}
                    <button
                      onClick={() => handleScrollStats('left')}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity hover:bg-white/40"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>

                    <div
                      ref={scrollContainerRef}
                      className="overflow-x-auto pb-4 scrollbar-hide"
                    >
                      <div className="flex gap-3 w-max px-1">
                        {dailyHistory?.map((day: any) => {
                          const d = new Date(day.date);
                          const isSelected = d.toDateString() === selectedDate.toDateString();
                          const isToday = d.toDateString() === new Date().toDateString();
                          const percent = Math.min(100, (day.amount / (day.goal || 2.5)) * 100);

                          return (
                            <button
                              key={day.date}
                              onClick={() => setSelectedDate(d)}
                              data-today={isToday}
                              className={`group/day flex flex-col items-center gap-2 transition-all ${isSelected ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100'}`}
                            >
                              <div className={`w-2 h-8 rounded-full bg-white/20 overflow-hidden relative ${isSelected ? 'shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}>
                                <div className="absolute bottom-0 left-0 w-full bg-white transition-all duration-500" style={{ height: `${percent}%` }} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-white' : ''}`}>
                                {d.getDate()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Scroll Button */}
                    <button
                      onClick={() => handleScrollStats('right')}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity hover:bg-white/40"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Daily View: Cups Visualization */}
                  <div className="relative z-10 mb-8">
                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-10 rounded-lg transition-all duration-500 ${i < Math.floor(hydrationAmount / 0.2) ? 'bg-white opacity-100 shadow-lg scale-105' : 'bg-white/10 scale-95'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-auto relative z-10">
                    <button
                      onClick={handleAddWater}
                      disabled={updateHydrationMutation.isPending}
                      className="bg-white text-[#8EC5DB] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {updateHydrationMutation.isPending ? 'Saving...' : '+ 250ml'}
                    </button>
                    <div className="text-right">
                      <span className="text-5xl font-black block leading-none tracking-tighter">{hydrationAmount.toFixed(1)}L</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">/ {hydrationGoal}L Goal</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Monthly View: Stats */}
                  <div className="relative z-10 grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Total Intake</p>
                      <p className="text-3xl font-black">{monthlyStats.total.toFixed(0)}L</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Daily Avg</p>
                      <p className="text-3xl font-black">{monthlyStats.avg.toFixed(1)}L</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 bg-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white text-[#8EC5DB] flex items-center justify-center font-black text-lg">
                      {monthlyStats.daysMetGoal}
                    </div>
                    <div>
                      <p className="text-sm font-black">Goal Days</p>
                      <p className="text-[10px] opacity-70 uppercase tracking-widest">Days you hit your target</p>
                    </div>
                  </div>
                </>
              )}

              {/* D / M Selection */}
              <div className="absolute top-8 left-75 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 flex shadow-2xl z-20">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`w-12 h-10 rounded-full font-black text-xs flex items-center justify-center shadow-lg transition-all scale-105 ${viewMode === 'daily' ? 'bg-white text-[#8EC5DB]' : 'text-white hover:bg-white/10'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`w-16 h-10 rounded-full font-black text-xs flex items-center justify-center shadow-lg transition-all scale-105 ${viewMode === 'monthly' ? 'bg-white text-[#8EC5DB]' : 'text-white hover:bg-white/10'}`}
                >
                  Monthly
                </button>
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
                  { label: 'Carbohydrates', value: totalMacros.carbs, goal: macroGoals.carbs, color: 'bg-primary', unit: 'g' },
                  { label: 'Proteins', value: totalMacros.protein, goal: macroGoals.protein, color: 'bg-blue-400', unit: 'g' },
                  { label: 'Fats', value: totalMacros.fat, goal: macroGoals.fat, color: 'bg-orange-400', unit: 'g' }
                ].map((macro) => {
                  const percentage = macro.goal ? Math.min(100, (macro.value / macro.goal) * 100) : 0;

                  return (
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
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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

            {/* Fitness Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-50/50 flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-xl text-black flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-muted-foreground group-hover:text-black transition-colors" />
                    Fitness
                  </h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                    {fitnessData?.weight || profile?.profile?.weight ? `Current Weight: ${fitnessData?.weight || profile?.profile?.weight}kg` : 'No weight logged'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-black tracking-tighter">
                    {fitnessData?.steps || 0} <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Steps</span>
                  </span>
                </div>
              </div>

              {/* Burned Calories Circular Progress - Daily View Only */}
              {viewMode === 'daily' && (
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                    <circle
                      className="text-[#8EC5DB] transition-all duration-1000 ease-out"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="70"
                      stroke="currentColor"
                      strokeDasharray={439.82}
                      strokeDashoffset={439.82 - (439.82 * Math.min(100, (calculateCaloriesBurned / dailyBurnGoal) * 100)) / 100}
                      strokeLinecap="round"
                      strokeWidth="12"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#8EC5DB] tracking-tighter">{calculateCaloriesBurned}</span>
                    <span className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground">kcal burned</span>
                    <span className="text-[7px] font-black text-gray-400 mt-1">Goal: {dailyBurnGoal}kcal</span>
                  </div>
                </div>
              )}

              {/* Weight Chart Tabs */}
              <div className="relative mb-6 flex items-center justify-between">
                <div className="bg-gray-50 backdrop-blur-sm border border-gray-100 rounded-full p-1.5 flex shadow-sm">
                  <button
                    onClick={() => setWeightChartViewMode('daily')}
                    className={`px-5 py-2 rounded-full font-black text-xs flex items-center justify-center shadow-sm transition-all ${
                      weightChartViewMode === 'daily' ? 'bg-black text-primary' : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setWeightChartViewMode('monthly')}
                    className={`px-5 py-2 rounded-full font-black text-xs flex items-center justify-center shadow-sm transition-all ${
                      weightChartViewMode === 'monthly' ? 'bg-black text-primary' : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Weight History Chart - Daily View with Carousel */}
              {weightChartViewMode === 'daily' && (
                <div className="relative my-6">
                  {/* Left Button */}
                  <button
                    onClick={() => setWeightChartStartIndex(Math.max(0, weightChartStartIndex - 1))}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>

                  {/* Weight Chart Container - Bars Only */}
                  <div className="relative h-32 w-full bg-gray-50/50 rounded-t-2xl p-6 border border-b-0 border-gray-100 flex items-end justify-center gap-4">
                    {weightHistory.slice(weightChartStartIndex, weightChartStartIndex + 5).map((day, visIdx) => {
                      // Calculate min/max from ALL weights for consistent scaling
                      const validWeights = weightHistory.filter(d => d.weight > 0).map(d => d.weight);
                      const maxWeight = validWeights.length > 0 ? Math.max(...validWeights) : (profile?.profile?.weight || 80);
                      const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : (maxWeight - 2);
                      const range = Math.max(maxWeight - minWeight, 2);
                      const displayWeight = day.weight;
                      const height = displayWeight ? ((displayWeight - minWeight) / range) * 100 : 0;
                      const actualIndex = weightChartStartIndex + visIdx;
                      
                      return (
                        <div key={actualIndex} className="flex-1 flex flex-col items-center justify-end h-full group/bar" title={displayWeight ? `${displayWeight}kg` : 'No data'}>
                          <div className="w-full h-24 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-end justify-center group-hover/bar:bg-primary/10 transition-colors shadow-sm">
                            {displayWeight > 0 && (
                              <div
                                className={`w-2/3 rounded-t-lg transition-all duration-300 ${
                                  day.isToday ? 'bg-primary shadow-lg' : 'bg-gray-300'
                                }`}
                                style={{ height: `${Math.max(20, height)}%` }}
                              />
                            )}
                            {displayWeight === 0 && (
                              <span className="text-sm text-gray-300 font-bold">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weight Labels Below Chart */}
                  <div className="relative w-full bg-gray-50/50 rounded-b-2xl px-6 pb-4 border border-t-0 border-gray-100 flex items-start justify-center gap-4">
                    {weightHistory.slice(weightChartStartIndex, weightChartStartIndex + 5).map((day, visIdx) => {
                      const displayWeight = day.weight;
                      const actualIndex = weightChartStartIndex + visIdx;
                      
                      return (
                        <div key={actualIndex} className="flex-1 text-center">
                          <span className="text-lg font-black text-black block">{day.date.getDate()}</span>
                          <span className="text-[11px] font-bold text-gray-500">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          {displayWeight > 0 && <span className="text-sm font-black text-black block mt-2">{displayWeight}kg</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Button */}
                  <button
                    onClick={() => setWeightChartStartIndex(Math.min(weightHistory.length - 5, weightChartStartIndex + 1))}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Weight History Chart - Monthly View */}
              {weightChartViewMode === 'monthly' && (
                <div className="relative my-6">
                  {/* Left Button */}
                  <button
                    onClick={() => setMonthlyChartStartIndex(Math.max(0, monthlyChartStartIndex - 1))}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>

                  {/* Weight Chart Container - Bars Only */}
                  <div className="relative h-32 w-full bg-gray-50/50 rounded-t-2xl p-6 border border-b-0 border-gray-100 flex items-end justify-center gap-4">
                    {monthlyWeightHistory.slice(monthlyChartStartIndex, monthlyChartStartIndex + 5).map((month, visIdx) => {
                      // Calculate min/max from ALL weights for consistent scaling
                      const validWeights = monthlyWeightHistory.filter(d => d.weight > 0).map(d => d.weight);
                      const maxWeight = validWeights.length > 0 ? Math.max(...validWeights) : (profile?.profile?.weight || 80);
                      const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : (maxWeight - 2);
                      const range = Math.max(maxWeight - minWeight, 2);
                      const displayWeight = month.weight;
                      const height = displayWeight ? ((displayWeight - minWeight) / range) * 100 : 0;
                      const actualIndex = monthlyChartStartIndex + visIdx;
                      
                      return (
                        <div key={actualIndex} className="flex-1 flex flex-col items-center justify-end h-full group/bar" title={displayWeight ? `${displayWeight.toFixed(1)}kg (${month.entriesCount} entries)` : 'No data'}>
                          <div className="w-full h-24 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-end justify-center group-hover/bar:bg-primary/10 transition-colors shadow-sm">
                            {displayWeight > 0 && (
                              <div
                                className={`w-2/3 rounded-t-lg transition-all duration-300 ${
                                  month.isCurrentMonth ? 'bg-primary shadow-lg' : 'bg-gray-300'
                                }`}
                                style={{ height: `${Math.max(20, height)}%` }}
                              />
                            )}
                            {displayWeight === 0 && (
                              <span className="text-sm text-gray-300 font-bold">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Month Labels Below Chart */}
                  <div className="relative w-full bg-gray-50/50 rounded-b-2xl px-6 pb-4 border border-t-0 border-gray-100 flex items-start justify-center gap-4">
                    {monthlyWeightHistory.slice(monthlyChartStartIndex, monthlyChartStartIndex + 5).map((month, visIdx) => {
                      const displayWeight = month.weight;
                      const actualIndex = monthlyChartStartIndex + visIdx;
                      
                      return (
                        <div key={actualIndex} className="flex-1 text-center">
                          <span className="text-sm font-black text-black block">{month.month}</span>
                          <span className="text-[10px] font-bold text-gray-500">{month.year}</span>
                          {displayWeight > 0 && <span className="text-sm font-black text-black block mt-2">{displayWeight.toFixed(1)}kg</span>}
                          {month.entriesCount > 0 && <span className="text-[8px] font-bold text-gray-400 block">{month.entriesCount} logs</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Button */}
                  <button
                    onClick={() => setMonthlyChartStartIndex(Math.min(monthlyWeightHistory.length - 5, monthlyChartStartIndex + 1))}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end justify-between mt-auto gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <span className="text-4xl font-black text-black tracking-tighter">
                      {fitnessData?.weight || profile?.profile?.weight || '--'}
                      <span className="text-xl text-muted-foreground font-medium tracking-tight">kg</span>
                    </span>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {fitnessData?.weight ? 'Logged Today' : profile?.profile?.weight ? 'From Profile' : 'No Data'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTempWeight(fitnessData?.weight?.toString() || '');
                      setTempSteps(fitnessData?.steps?.toString() || '');
                      setIsFitnessModalOpen(true);
                    }}
                    disabled={weightUpdateMutation}
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm group-hover:shadow-md disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      setTempWeight(fitnessData?.weight?.toString() || '');
                      setTempSteps(fitnessData?.steps?.toString() || '');
                      setIsFitnessModalOpen(true);
                    }}
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] w-32 leading-relaxed hover:text-black transition-colors"
                  >
                    Log Activity →
                  </button>
                  <p className="text-xs font-black text-black mt-1 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Keep Pushing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fitness Update Modal */}
      {isFitnessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-black flex items-center gap-3">
                <Dumbbell className="w-7 h-7 text-primary" />
                Daily Fitness
              </h3>
              <button
                onClick={() => setIsFitnessModalOpen(false)}
                className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 group transition-all focus-within:border-black focus-within:bg-white focus-within:shadow-xl">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-black transition-colors">Current Weight (kg)</label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    step="0.1"
                    autoFocus
                    value={tempWeight}
                    onChange={(e) => setTempWeight(e.target.value)}
                    placeholder="00.0"
                    className="bg-transparent border-none p-0 text-5xl font-black tracking-tighter w-full focus:ring-0 placeholder:text-gray-200"
                  />
                  <span className="text-2xl font-black text-muted-foreground">kg</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 group transition-all focus-within:border-black focus-within:bg-white focus-within:shadow-xl">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-black transition-colors">Daily Steps</label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={tempSteps}
                    onChange={(e) => setTempSteps(e.target.value)}
                    placeholder="0"
                    className="bg-transparent border-none p-0 text-5xl font-black tracking-tighter w-full focus:ring-0 placeholder:text-gray-200"
                  />
                  <TrendingUp className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>

              <button
                onClick={() => {
                  const pWeight = tempWeight && !isNaN(parseFloat(tempWeight)) ? parseFloat(tempWeight) : undefined;
                  const pSteps = tempSteps && !isNaN(parseInt(tempSteps)) ? parseInt(tempSteps) : undefined;

                  if (pWeight) {
                    handleWeightUpdate(pWeight);
                  }

                  updateFitnessMutation.mutate({
                    weight: pWeight,
                    steps: pSteps,
                    date: selectedDate
                  }, {
                    onSuccess: () => {
                      setIsFitnessModalOpen(false);
                    },
                    onError: (err) => {
                      console.error("Failed to save fitness stats", err);
                      alert("Failed to save fitness stats. Please try again.");
                    }
                  });
                }}
                disabled={updateFitnessMutation.isPending || weightUpdateMutation}
                className="w-full bg-black text-primary py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateFitnessMutation.isPending || weightUpdateMutation ? 'Syncing...' : 'Save Daily Stats'}
                {!updateFitnessMutation.isPending && !weightUpdateMutation && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
