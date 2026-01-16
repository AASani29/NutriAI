import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Utensils,
  Droplets,
  Trophy,
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  ChevronRight as ChevronRightIcon,
  X
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory, type ConsumptionLog } from '../hooks/useInventory';
import { useProfile } from '../context/ProfileContext';
import DirectConsumption from '../components/DirectConsumption';

export default function DailyLogPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { useGetConsumptionLogs } = useInventory();

  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDirectConsumptionOpen, setIsDirectConsumptionOpen] = useState(false);

  // Derived intervals for calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Fetch logs for the ENTIRE displayed month (plus padding days)
  // We use a large limit to get all logs for dots/analytics
  const { data: consumptionData, isLoading } = useGetConsumptionLogs({
    startDate: calendarStart,
    endDate: calendarEnd,
    limit: 1000, 
  });

  const logs = consumptionData?.consumptionLogs || [];

  // Group logs by date for efficient lookup
  const logsByDate = useMemo(() => {
    const map = new Map<string, ConsumptionLog[]>();
    logs.forEach(log => {
      const dateKey = new Date(log.consumedAt).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(log);
    });
    return map;
  }, [logs]);

  // Selected Day Data
  const selectedDayLogs = useMemo(() => {
    return logsByDate.get(selectedDate.toDateString()) || [];
  }, [logsByDate, selectedDate]);

  // Selected Day Stats
  const dayStats = useMemo(() => {
    return selectedDayLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbohydrates || 0),
        fat: acc.fat + (log.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedDayLogs]);

  // Monthly Stats (for the current month view)
  const monthlyStats = useMemo(() => {
    const currentMonthLogs = logs.filter(log => isSameMonth(new Date(log.consumedAt), currentMonth));
    const totalCals = currentMonthLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    // Avg per DAY that has logs
    const daysWithLogs = new Set(currentMonthLogs.map(l => new Date(l.consumedAt).toDateString())).size;
    const dailyAvg = daysWithLogs > 0 ? Math.round(totalCals / daysWithLogs) : 0;

    return {
      totalCalories: Math.round(totalCals),
      dailyAvgCalories: dailyAvg,
      totalLogs: currentMonthLogs.length
    };
  }, [logs, currentMonth]);

  // Navigation Handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Determine Dot Color based on goals
  const getDayStatus = (date: Date) => {
    const dateKey = date.toDateString();
    const dayLogs = logsByDate.get(dateKey);
    if (!dayLogs || dayLogs.length === 0) return null;

    const totalCals = dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const goal = profile?.profile?.energyGoal || 2500;

    if (totalCals > goal * 1.1) return 'high'; // Red
    if (totalCals >= goal * 0.8) return 'good'; // Green
    return 'low'; // Blue/Neutral
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Calendar & Monthly Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-8 h-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Consumption Log</h1>
              <p className="text-gray-500 mt-1">Track your meals and nutrition over time</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-1 font-bold text-gray-900 min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex-1 flex flex-col">
            {/* Days Header - Colored Bar */}
            <div className="grid grid-cols-7 bg-secondary text-secondary-foreground">
              {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-wider py-3">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1">
              {calendarDays.map((day, dayIdx) => {
                const status = getDayStatus(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isFirstColumn = dayIdx % 7 === 0;
                const isFirstRow = dayIdx < 7;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      cursor-pointer aspect-square
                      relative flex flex-col items-center justify-center p-3 transition-all duration-200
                      border-gray-200
                      ${isFirstColumn ? 'border-l' : ''} ${isFirstRow ? 'border-t' : ''}
                      border-r border-b
                      ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900 bg-white hover:bg-gray-50'}
                      ${isSelected ? '!bg-secondary/10 !border-secondary !border-2 z-10' : ''}
                    `}
                  >
                    {isSelected && isToday(day) ? (
                      <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
                        {format(day, 'd')}
                      </div>
                    ) : (
                      <span className={`text-base font-semibold ${isSelected ? 'text-secondary' : ''} ${isToday(day) && !isSelected ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                    )}
                    
                    {/* Status Dot */}
                    {status && !isSelected && (
                      <div className="absolute bottom-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           status === 'good' ? 'bg-green-500' : 
                           status === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                         }`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Legend - Moved outside calendar */}
          <div className="flex items-center gap-6 px-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Regular</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>High Calorie</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Goal Met</span>
              </div>
          </div>

          {/* Monthly Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <CalendarIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">{monthlyStats.totalLogs}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entries this Month</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <Flame className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">{monthlyStats.dailyAvgCalories}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Daily Cals</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">Active</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lifestyle</p>
                 </div>
              </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Daily Detail View (Scrollable) */}
        <div className="lg:col-span-1 flex flex-col h-full overflow-hidden bg-white/50 rounded-[2.5rem] border border-gray-100/50 backdrop-blur-sm p-4 relative">
          
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            
            {/* Header / Add Entry */}
            <div className="flex justify-between items-center mb-2">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{isToday(selectedDate) ? 'Today\'s' : format(selectedDate, 'MMM d')} Log</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-widest">{format(selectedDate, 'EEEE')}</p>
                </div>
                <button 
                  onClick={() => setIsDirectConsumptionOpen(true)}
                  className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                  title="Add Direct Consumption"
                >
                  <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Summary */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                   <span className="text-2xl font-bold text-gray-900 tracking-tighter">{Math.round(dayStats.calories)}</span>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Calories</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                   <span className="text-2xl font-bold text-gray-900 tracking-tighter">{selectedDayLogs.length}</span>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Items</p>
                </div>
             </div>

            {/* Macros Compact */}
            <div className="bg-secondary p-6 rounded-[2rem] text-secondary-foreground shadow-lg">
               <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Macro Goals</span>
               </div>
               
               <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Protein</span>
                      <span>{Math.round(dayStats.protein)} / {profile?.profile?.proteinGoal || 150}g</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (dayStats.protein / (profile?.profile?.proteinGoal || 150)) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Carbs</span>
                      <span>{Math.round(dayStats.carbs)} / {profile?.profile?.carbGoal || 300}g</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (dayStats.carbs / (profile?.profile?.carbGoal || 300)) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Fats</span>
                      <span>{Math.round(dayStats.fat)} / {profile?.profile?.fatGoal || 70}g</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (dayStats.fat / (profile?.profile?.fatGoal || 70)) * 100)}%` }} />
                    </div>
                  </div>
               </div>
            </div>

            {/* Log List */}
            <div className="space-y-4 pb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-40">Consumed Items</h3>
              
              {selectedDayLogs.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <Utensils className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No entries for this day</p>
                </div>
              ) : (
                selectedDayLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary/50 transition-colors shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
                       {log.foodItem?.category === 'fruit' ? '🍎' : 
                        log.foodItem?.category === 'vegetable' ? '🥦' : 
                        log.foodItem?.category === 'protein' ? '🥩' : '🍽️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{log.itemName}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{format(new Date(log.consumedAt), 'h:mm a')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-gray-900">{Math.round(log.calories || 0)}</span>
                      <p className="text-[8px] text-gray-400 uppercase">kcal</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        
        </div>
      </div>

      {/* DirectConsumption Modal */}
      {isDirectConsumptionOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsDirectConsumptionOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <DirectConsumption />
          </div>
        </div>
      )}
    </main>
  );
}
