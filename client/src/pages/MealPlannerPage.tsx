import { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Utensils,
  Sparkles,
  Brain,
  ArrowRight,
  ShoppingBag,
  ShoppingBasket,
  ChefHat,
  X,
  MessageSquare,
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  History,
  LayoutDashboard,
  Target,
  Zap
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useApi } from '../hooks/useApi';
import { useInventory } from '../hooks/useInventory';
import { Link } from 'react-router-dom';

interface MealPlan {
  isMealPlan: boolean;
  summary: string;
  meals: Array<{
    type: string;
    name: string;
    nutrition: {
      calories: number;
      protein: string;
      carbs: string;
      fat: string;
    };
    option1?: {
      name: string;
      items: string[];
      cost: number;
    };
    option2: {
      name: string;
      items: string[];
      cost: number;
    };
  }>;
  totalEstimatedCost: number;
}

export default function MealPlannerPage() {
  const { profile } = useProfile();
  const api = useApi();
  const { useGetConsumptionLogs, useGetHydration } = useInventory();
  const [selectedDate] = useState(new Date());
  const [activeTab, setActiveTab ] = useState<'optimizer' | 'saved'>('optimizer');
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  
  // No auto-switch for now as we use modal
  
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [consuming, setConsuming] = useState<string | null>(null);
  const [consumedMeals, setConsumedMeals] = useState<Set<string>>(new Set());
  const [activeMeal, setActiveMeal] = useState<{name: string, items: string[], nutrition: any, type: string} | null>(null);
  const [modalTab, setModalTab] = useState<'nutrition' | 'recipe'>('nutrition');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [config, setConfig] = useState({
    budget: 2000,
    timePeriod: 'one_day',
    notes: ''
  });

  const { data: logsData } = useGetConsumptionLogs({
    startDate: new Date(selectedDate.setHours(0,0,0,0)),
    endDate: new Date(selectedDate.setHours(23,59,59,999))
  });

  useGetHydration(selectedDate);

  const consumedNutrition = useMemo(() => {
    if (!logsData?.consumptionLogs) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return logsData.consumptionLogs.reduce((acc: any, log: any) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [logsData]);

  const fetchSavedPlans = async () => {
    try {
      const response = await api.getSavedMealPlans();
      setSavedPlans(response.data || response || []);
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    }
  };

  useMemo(() => {
    fetchSavedPlans();
  }, []);

  const aiInsight = useMemo(() => {
    const energyGoal = profile?.profile?.energyGoal || 2500;
    const proteinGoal = profile?.profile?.proteinGoal || 180;
    const items = [
      { name: 'Calories', current: consumedNutrition.calories, goal: energyGoal },
      { name: 'Protein', current: consumedNutrition.protein, goal: proteinGoal },
      { name: 'Carbs', current: consumedNutrition.carbs, goal: (energyGoal * 0.45) / 4 },
      { name: 'Fats', current: consumedNutrition.fat, goal: (energyGoal * 0.25) / 9 },
    ];
    
    const lowestNutrient = items.reduce((prev, curr) => 
      (curr.current / curr.goal) < (prev.current / prev.goal) ? curr : prev
    );
    
    let recommendation = '';
    let subtitle = '';
    
    switch(lowestNutrient.name) {
      case 'Protein':
        recommendation = 'Protein-rich meals';
        subtitle = 'Building strength, one meal at a time.';
        break;
      case 'Carbs':
        recommendation = 'Carb-focused meals';
        subtitle = 'Fuel your energy levels for the week ahead.';
        break;
      case 'Fats':
        recommendation = 'Healthy fat-rich meals';
        subtitle = 'Support your hormones and nutrient absorption.';
        break;
      case 'Calories':
      default:
        recommendation = 'Calorie-dense, nutrient-rich meals';
        subtitle = 'Boost your daily energy intake.';
        break;
    }

    return {
      title: `Focus on ${recommendation} this week!`,
      subtitle: subtitle,
    };
  }, [profile, consumedNutrition]);

  const displayTitle = aiInsight.title;
  
  const displayPlanSummary = useMemo(() => {
    const energyGoal = profile?.profile?.energyGoal || 2500;
    const proteinGoal = profile?.profile?.proteinGoal || 180;
    const carbsGoal = Math.round(energyGoal * 0.45 / 4);
    const fatsGoal = Math.round(energyGoal * 0.25 / 9);

    const calorieGap = Math.max(0, Math.round(energyGoal - consumedNutrition.calories));
    const proteinGap = Math.max(0, Math.round(proteinGoal - consumedNutrition.protein));
    const carbsGap = Math.max(0, Math.round(carbsGoal - consumedNutrition.carbs));
    const fatsGap = Math.max(0, Math.round(fatsGoal - consumedNutrition.fat));

    const gaps = [
      { name: 'protein', amount: proteinGap },
      { name: 'carbs', amount: carbsGap },
      { name: 'fats', amount: fatsGap },
      { name: 'calories', amount: calorieGap },
    ].sort((a, b) => b.amount - a.amount);

    const topGap = gaps[0];
    const secondaryGap = gaps[1];

    return `These meals target your biggest needs: ${topGap.name} (about ${topGap.amount} left) and ${secondaryGap.name} (about ${secondaryGap.amount} left). Suggestions prioritize foods rich in these nutrients to close today’s gaps while keeping overall calories on track.`;
  }, [profile, consumedNutrition]);

  const hasHealthMetrics = profile?.profile?.height && profile?.profile?.weight;

  const generatePlan = async () => {
    setLoading(true);
    setRawResponse(null);
    try {
      const energyGoal = profile?.profile?.energyGoal || 2500;
      const proteinGoal = profile?.profile?.proteinGoal || 180;
      const carbsGoal = Math.round(energyGoal * 0.45 / 4);
      const fatsGoal = Math.round(energyGoal * 0.25 / 9);
      const hydrationGoal = 2.5;

      const response = await api.getOptimizedMealPlan({
        budget: config.budget,
        timePeriod: config.timePeriod,
        notes: config.notes,
        userStats: {
          energyGoal,
          proteinGoal,
          carbsGoal,
          fatsGoal,
          hydrationGoal,
          consumed: consumedNutrition,
          remaining: {
            calories: Math.max(0, energyGoal - consumedNutrition.calories),
            protein: Math.max(0, proteinGoal - consumedNutrition.protein),
            carbs: Math.max(0, carbsGoal - consumedNutrition.carbs),
            fats: Math.max(0, fatsGoal - consumedNutrition.fat),
          },
          weight: profile?.profile?.weight,
          height: profile?.profile?.height,
        },
      });
      
      const content = response.data.response || JSON.stringify(response.data.mealPlan);
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
         try {
           let jsonString = jsonMatch[1].replace(/\\n/g, ' ').replace(/\r?\n|\r/g, ' ').trim();
           const parsed = JSON.parse(jsonString);

           if (!parsed.isMealPlan && (parsed.meals || parsed.mealPlan)) {
             parsed.isMealPlan = true;
             if (parsed.mealPlan && !parsed.meals) Object.assign(parsed, parsed.mealPlan);
           }

            if (parsed.isMealPlan && parsed.meals) {
              setMealPlan(parsed);
            } else {
             setRawResponse(content);
           }
         } catch (e) {
           setRawResponse(content);
         }
      } else {
        setRawResponse(content);
      }
    } catch (error: any) {
      console.error(error);
      setNotification({ message: 'Failed to generate meal plan. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: MealPlan) => {
    try {
      await api.saveMealPlan(plan);
      setNotification({ message: 'Meal plan saved successfully!', type: 'success' });
      fetchSavedPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  };

  const consumeMeal = async (idx: number, option: 'option1' | 'option2') => {
    if (!mealPlan) return;
    const meal = mealPlan.meals[idx];
    const items = option === 'option1' ? meal.option1?.items : meal.option2.items;
    if (!items) return;

    setConsuming(`${idx}-${option}`);
    try {
      const isMarketPurchase = option === 'option2';
      await api.consumeMeal(meal.name, items, isMarketPurchase);
      setConsumedMeals(prev => new Set(prev).add(`${idx}-${option}`));
      setNotification({ 
        message: isMarketPurchase ? `${meal.name} purchased and consumed!` : `Consumed ${meal.name} from inventory!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Failed to consume meal.', type: 'error' });
    } finally {
      setConsuming(null);
    }
  };

  const fetchRecipe = async (dishName: string, ingredients: string[]) => {
    setIsRecipeLoading(true);
    try {
      const response = await api.getRecipe(dishName, ingredients);
      setSelectedRecipe(response.data);
      setNotification({ message: 'Recipe instructions loaded!', type: 'success' });
      setModalTab('recipe');
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Failed to load recipe.', type: 'error' });
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleMealClick = (name: string, items: string[], nutrition: any, type: string) => {
    setActiveMeal({ name, items, nutrition, type });
    setModalTab('nutrition');
    setSelectedRecipe(null);
  };

  if (!hasHealthMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-primary/20">
          <Brain className="w-12 h-12 text-secondary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4">Complete Your Health Profile</h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            To generate a price-smart meal plan tailored to your metabolism and health goals, we need your height, weight, and preferences.
          </p>
        </div>
        <Link
          to="/profile/edit"
          className="inline-flex items-center gap-3 px-10 py-5 bg-secondary text-white rounded-2xl hover:bg-secondary/90 transition-all font-bold shadow-lg shadow-secondary/20 active:scale-95 group"
        >
          Setup My Profile
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#FFF8F0]/30 px-6">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Smart Meal Planner</h1>
            <p className="text-secondary/60 font-bold text-[10px] uppercase tracking-widest mt-2">Personalized nutritional strategies for {profile?.profile?.fullName || 'User'}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-soft border border-gray-100">
             <button 
                onClick={() => setActiveTab('optimizer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'optimizer' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-secondary hover:bg-gray-50'}`}
             >
                <Sparkles className="w-4 h-4" />
                Planner
             </button>
             <button 
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-secondary hover:bg-gray-50'}`}
             >
                <ShoppingBag className="w-4 h-4" />
                Saved Plans
             </button>
          </div>
        </header>

        {activeTab === 'optimizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
                   <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Target className="w-5 h-5 text-secondary" />
                      Plan Configuration
                   </h3>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Budget (BDT)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary">৳</span>
                          <input 
                            type="number" 
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all font-bold text-gray-900"
                            value={config.budget}
                            onChange={(e) => setConfig({...config, budget: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Time Period</label>
                        <select 
                           className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 appearance-none cursor-pointer"
                           value={config.timePeriod}
                           onChange={(e) => setConfig({...config, timePeriod: e.target.value})}
                        >
                           <option value="one_day">Single Day</option>
                           <option value="one_week">Full Week</option>
                           <option value="breakfast">Breakfast Only</option>
                           <option value="lunch">Lunch Only</option>
                           <option value="dinner">Dinner Only</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Specific Goals / Notes</label>
                        <textarea 
                           className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 h-32 resize-none placeholder:text-gray-300"
                           placeholder="e.g. Low sodium, high protein, avoiding lentils..."
                           value={config.notes}
                           onChange={(e) => setConfig({...config, notes: e.target.value})}
                        />
                      </div>

                      <button 
                        onClick={generatePlan}
                        disabled={loading}
                        className="w-full py-5 bg-secondary text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Optimizing...' : 'Generate AI Plan'}
                      </button>
                   </div>
                </div>

                <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20">
                   <h4 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Dynamic Intelligence
                   </h4>
                   <p className="text-xs text-secondary/70 font-medium leading-relaxed">
                      Our engine analyzes your current inventory stock, real-time bazaar prices, and metabolic gaps to craft the most cost-effective nutritional strategy.
                   </p>
                </div>
             </div>

             <div className="lg:col-span-8">
                {loading ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-20 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-secondary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Consulting NutriAI Engine</h3>
                      <p className="text-gray-500 font-medium max-w-sm">Generating your personalized, price-smart meal protocol based on your health metrics...</p>
                    </div>
                  </div>
                ) : mealPlan ? (
                   <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                      {/* Simple Insights Header */}
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 max-w-xl">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2 block">AI Strategy Analysis</span>
                           <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">{displayTitle}</h2>
                           <p className="text-gray-500 font-medium text-xs leading-relaxed">{displayPlanSummary}</p>
                        </div>

                        <div className="relative z-10 flex items-center gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                           <div className="text-center">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Total Cost</span>
                              <span className="text-3xl font-bold text-gray-900 italic">৳{mealPlan.totalEstimatedCost}</span>
                           </div>
                           <div className="w-px h-10 bg-gray-200"></div>
                           <button 
                              onClick={() => savePlan(mealPlan)}
                              className="px-6 py-3 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                           >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Save Plan
                           </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mealPlan.meals.map((meal, idx) => (
                          <div key={idx} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                      {meal.type.toLowerCase().includes('breakfast') && <Sunrise className="w-6 h-6 text-orange-400" />}
                                      {meal.type.toLowerCase().includes('lunch') && <Sun className="w-6 h-6 text-primary" />}
                                      {meal.type.toLowerCase().includes('dinner') && <Moon className="w-6 h-6 text-indigo-400" />}
                                   </div>
                                   <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/60">{meal.type}</span>
                                      <h4 onClick={() => handleMealClick(meal.name, [], meal.nutrition, meal.type)} className="text-md font-bold text-gray-900 cursor-pointer hover:text-secondary transition-colors line-clamp-1">{meal.name}</h4>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-sm font-bold text-gray-900">{meal.nutrition.calories} kcal</div>
                                   <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{meal.nutrition.protein}P • {meal.nutrition.carbs}C</div>
                                </div>
                             </div>

                             <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                  {meal.option1 && (
                                    <div className="relative p-4 bg-[#FFF8F0] rounded-xl border border-primary/20 group/opt hover:bg-white hover:shadow-sm transition-all cursor-default text-xs">
                                       <div className="absolute top-0 right-0 bg-secondary text-[7px] text-white px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-widest">In Stock</div>
                                       <div className="flex justify-between items-center mb-2">
                                          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                             <CheckCircle2 className="w-3 h-3 text-secondary" />
                                             Inventory
                                          </span>
                                          <span className="font-bold text-gray-900 font-mono italic">৳{meal.option1.cost}</span>
                                       </div>
                                       <p className="font-bold text-gray-900 line-clamp-1">{meal.option1.name}</p>
                                       <button 
                                        onClick={() => consumeMeal(idx, 'option1')}
                                        disabled={consuming === `${idx}-option1` || consumedMeals.has(`${idx}-option1`)}
                                        className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                       >
                                         {consuming === `${idx}-option1` ? <Zap className="w-2.5 h-2.5 animate-spin" /> : consumedMeals.has(`${idx}-option1`) ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Utensils className="w-2.5 h-2.5" />}
                                         {consumedMeals.has(`${idx}-option1`) ? 'Logged' : 'Log Use'}
                                       </button>
                                    </div>
                                  )}

                                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group/opt hover:bg-white hover:shadow-sm transition-all cursor-default text-xs">
                                     <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                           <ShoppingBasket className="w-3 h-3 text-gray-300" />
                                           Market
                                        </span>
                                        <span className="font-bold text-gray-900 font-mono italic">৳{meal.option2.cost}</span>
                                     </div>
                                     <p className="font-bold text-gray-900 line-clamp-1">{meal.option2.name}</p>
                                     <button 
                                        onClick={() => consumeMeal(idx, 'option2')}
                                        disabled={consuming === `${idx}-option2` || consumedMeals.has(`${idx}-option2`)}
                                        className="mt-3 w-full py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                     >
                                        {consuming === `${idx}-option2` ? <Zap className="w-2.5 h-2.5 animate-spin" /> : consumedMeals.has(`${idx}-option2`) ? <CheckCircle2 className="w-2.5 h-2.5" /> : <ShoppingBag className="w-2.5 h-2.5" />}
                                        {consumedMeals.has(`${idx}-option2`) ? 'Purchased' : 'Buy & Log'}
                                     </button>
                                  </div>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                ) : rawResponse ? (
                   <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-10 prose prose-slate max-w-none">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                         <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-secondary" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 m-0">AI Recommendations</h3>
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-gray-600 leading-relaxed italic">
                        {rawResponse}
                      </div>
                   </div>
                ) : (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center">
                      <LayoutDashboard className="w-12 h-12 text-gray-200" />
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to start planning?</h3>
                      <p className="text-gray-500 font-medium">Adjust your parameters on the left and hit 'Generate' to create a weekly nutrition protocol tailored just for you.</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
        {activeTab === 'saved' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {savedPlans.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {savedPlans.map((plan) => (
                   <div key={plan.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft hover:shadow-xl transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                      <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-4 h-4 text-secondary/40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</span>
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 mb-6">Protocols Strategy</h3>
                         <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-3xl font-bold text-gray-900">৳{plan.budget}</span>
                            <span className="text-xs text-gray-400 font-medium font-bold uppercase">Budget</span>
                         </div>
                         <button 
                          onClick={() => {
                            setMealPlan({
                              isMealPlan: true,
                              summary: "Archived Plan",
                              meals: plan.meals,
                            totalEstimatedCost: plan.totalCost
                            });
                            setActiveTab('optimizer');
                          }}
                          className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm"
                         >
                           View Plan
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-24 text-center">
                  <History className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Protocols</h3>
                  <p className="text-gray-500 font-medium">Your nutritional history will appear here once you save generated plans.</p>
               </div>
             )}
          </div>
        )}



        {/* Meal Detail Modal */}
        {activeMeal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col border border-gray-100">
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                   <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg">{activeMeal.type}</span>
                   <h2 className="text-3xl font-bold text-gray-900 mt-2">{activeMeal.name}</h2>
                </div>
                <button onClick={() => setActiveMeal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex gap-2 p-1.5 bg-gray-50 mx-8 rounded-2xl mb-8 border border-gray-100">
                <button onClick={() => setModalTab('nutrition')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${modalTab === 'nutrition' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400'}`}>Nutrition</button>
                <button onClick={() => setModalTab('recipe')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${modalTab === 'recipe' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400'}`}>Cooking Guide</button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">
                 {modalTab === 'nutrition' ? (
                   <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="grid grid-cols-4 gap-4">
                         <div className="bg-gray-50 p-6 rounded-2xl text-center">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calories</div>
                            <div className="text-2xl font-bold text-gray-900">{activeMeal.nutrition.calories}</div>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-2xl text-center">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Protein</div>
                            <div className="text-2xl font-bold text-gray-900">{activeMeal.nutrition.protein}g</div>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-2xl text-center">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carbs</div>
                            <div className="text-2xl font-bold text-gray-900">{activeMeal.nutrition.carbs}g</div>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-2xl text-center">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fat</div>
                            <div className="text-2xl font-bold text-gray-900">{activeMeal.nutrition.fat}g</div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-secondary" />
                            Core Ingredients
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {activeMeal.items.map((item, i) => (
                              <span key={i} className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm">{item}</span>
                            ))}
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="animate-in fade-in duration-500">
                      {selectedRecipe ? (
                        <div className="space-y-10">
                           <div className="bg-[#FFF8F0] p-8 rounded-3xl border border-primary/10 italic text-secondary/80 font-medium text-lg leading-relaxed">
                             "{selectedRecipe.description}"
                           </div>
                           <div className="grid grid-cols-2 gap-10">
                              <div className="space-y-6">
                                 <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Ingredients list</h4>
                                 <div className="space-y-3">
                                    {selectedRecipe.ingredients.map((ing: any, i: number) => (
                                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-50">
                                         <span className="font-bold text-gray-900">{ing.item}</span>
                                         <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-white px-3 py-1 rounded-lg border border-gray-100">{ing.amount}</span>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="space-y-6">
                                 <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Preparation Steps</h4>
                                 <div className="space-y-6">
                                    {selectedRecipe.instructions.map((step: string, i: number) => (
                                       <div key={i} className="flex gap-4">
                                          <span className="flex-shrink-0 w-8 h-8 bg-secondary text-white text-xs font-bold rounded-lg flex items-center justify-center">{i+1}</span>
                                          <p className="text-sm font-medium text-gray-600 leading-relaxed">{step}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                           <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
                              <ChefHat className="w-10 h-10 text-gray-200" />
                           </div>
                           <h3 className="text-2xl font-bold text-gray-900">Ready to cook?</h3>
                           <p className="text-gray-500 font-medium max-w-xs">Our AI can generate a precise culinary protocol for this specific meal.</p>
                           <button 
                             onClick={() => fetchRecipe(activeMeal.name, activeMeal.items)}
                             disabled={isRecipeLoading}
                             className="px-10 py-4 bg-secondary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 flex items-center gap-3"
                           >
                             {isRecipeLoading ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                             Generate Instructions
                           </button>
                        </div>
                      )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

      {isRecipeLoading && !selectedRecipe && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-md">
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-6 text-white font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">Consulting AI Chef...</p>
        </div>
      )}

        {/* Notification Popup */}
        {notification && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl shadow-2xl border ${
               notification.type === 'success' 
                 ? 'bg-white border-green-100 text-gray-900' 
                 : 'bg-white border-red-100 text-gray-900'
             }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                   notification.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                }`}>
                   {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div>
                   <p className="text-sm font-bold tracking-tight">{notification.message}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">System Notification</p>
                </div>
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-4 p-2 hover:bg-gray-50 rounded-lg transition-all"
                >
                   <X className="w-4 h-4 text-gray-400" />
                </button>
             </div>
          </div>
        )}
    </div>
  </main>
);
}
