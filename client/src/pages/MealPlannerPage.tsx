import { useState, useMemo } from 'react';
import {
  Calendar,
  Utensils,
  Sparkles,
  DollarSign,
  Brain,
  ArrowRight,
  ShoppingBag,
  ShoppingBasket,
  ChefHat,
  X,
  ListChecks,
  MessageSquare,
  Search,
  ChevronRight,
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle
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
  const [loading, setLoading] = useState(false);
  const [selectedDate] = useState(new Date());
  const [showConfig, setShowConfig] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(() => {
    const saved = localStorage.getItem('current_meal_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'saved'>('current');
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [consuming, setConsuming] = useState<string | null>(null);
  const [consumedMeals, setConsumedMeals] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [activeMeal, setActiveMeal] = useState<{ name: string; items: string[]; nutrition: any; type: string } | null>(null);
  const [modalTab, setModalTab] = useState<'nutrition' | 'recipe'>('nutrition');
  
  const [config, setConfig] = useState({
    budget: 200,
    timePeriod: 'one_day',
    notes: '',
  });

  // Normalize selected date to full-day window to match backend filters
  const startOfDay = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const endOfDay = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [selectedDate]);

  // Fetch consumption logs for the full selected day
  const { data: consumptionResult } = useGetConsumptionLogs({
    startDate: startOfDay,
    endDate: endOfDay
  }) || { data: null };

  // Fetch hydration data for selected date
  const { data: hydrationData } = useGetHydration(selectedDate);

  const consumptionLogs = consumptionResult?.consumptionLogs || [];

  // Calculate consumed nutrition from consumption logs
  const consumedNutrition = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (Array.isArray(consumptionLogs)) {
      consumptionLogs.forEach((log: any) => {
        calories += log.calories || 0;
        protein += log.protein || 0;
        carbs += log.carbohydrates || 0;
        fat += log.fat || 0;
      });
    }

    return { calories, protein, carbs, fat };
  }, [consumptionLogs]);

  // Generate personalized AI insights based on health metrics and lowest nutrient
  const aiInsight = useMemo(() => {
    const userGoals = profile?.profile;
    const proteinGoal = userGoals?.proteinGoal || 180;
    const energyGoal = userGoals?.energyGoal || 2500;
    
    // Calculate percentages for each nutrient
    const carbsGoal = Math.round(energyGoal * 0.45 / 4);
    const fatsGoal = Math.round(energyGoal * 0.25 / 9);
    
    const caloriePercent = (consumedNutrition.calories / energyGoal) * 100;
    const proteinPercent = (consumedNutrition.protein / proteinGoal) * 100;
    const carbsPercent = (consumedNutrition.carbs / carbsGoal) * 100;
    const fatsPercent = (consumedNutrition.fat / fatsGoal) * 100;
    
    // Find the lowest percentage
    const percentages = [
      { name: 'Calories', percent: caloriePercent },
      { name: 'Protein', percent: proteinPercent },
      { name: 'Carbs', percent: carbsPercent },
      { name: 'Fats', percent: fatsPercent }
    ];
    
    const lowestNutrient = percentages.reduce((min, curr) => 
      curr.percent < min.percent ? curr : min
    );
    
    // Generate insight based on lowest nutrient
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
      metrics: {
        calories: 65,
        protein: 58,
        hydration: 70,
        steps: 45
      }
    };
  }, [profile, consumedNutrition]);

  // Banner text follows AI insight; meal plan summary is not used to override it
  const displayTitle = aiInsight.title;
  const displaySubtitle = aiInsight.subtitle;

  // Explain why these meals are suggested based on current macro gaps
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

  const fetchSavedPlans = async () => {
    try {
      const response = await api.getSavedMealPlans();
      setSavedPlans(response.data);
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    setShowConfig(false);
    setMealPlan(null);
    setRawResponse(null);
    try {
      // Calculate current nutritional status and gaps
      const energyGoal = profile?.profile?.energyGoal || 2500;
      const proteinGoal = profile?.profile?.proteinGoal || 180;
      const carbsGoal = Math.round(energyGoal * 0.45 / 4);
      const fatsGoal = Math.round(energyGoal * 0.25 / 9);
      const hydrationGoal = 2.5; // L

      console.log('Generating meal plan with config:', config);
      const response = await api.getOptimizedMealPlan({
        budget: config.budget,
        timePeriod: config.timePeriod,
        notes: config.notes,
        // Pass comprehensive health stats for AI consideration
        userStats: {
          energyGoal,
          proteinGoal,
          carbsGoal,
          fatsGoal,
          hydrationGoal,
          consumed: {
            calories: consumedNutrition.calories,
            protein: consumedNutrition.protein,
            carbs: consumedNutrition.carbs,
            fat: consumedNutrition.fat,
          },
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
      
      console.log('API Response received:', response);

      if (!response.data || (!response.data.response && !response.data.mealPlan)) {
        throw new Error('AI service returned an empty or invalid response. Please try again.');
      }

      const content = response.data.response || JSON.stringify(response.data.mealPlan);
      
      console.log('Extracting JSON from content:', content.substring(0, 100) + '...');

      // Try to extract JSON from the AI response
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
         try {
           let jsonString = jsonMatch[1];
           
           // Basic cleaning of common AI artifacts
           jsonString = jsonString.replace(/\\n/g, ' ')
                                .replace(/\r?\n|\r/g, ' ')
                                .trim();

           const parsed = JSON.parse(jsonString);
           
           console.log('Successfully parsed JSON:', parsed);

           // Validation and repair
           if (!parsed.isMealPlan && (parsed.meals || parsed.mealPlan)) {
             parsed.isMealPlan = true;
             // Handle case where AI wraps it in another object
             if (parsed.mealPlan && !parsed.meals) {
               Object.assign(parsed, parsed.mealPlan);
             }
           }

           if (parsed.isMealPlan && parsed.meals) {
             setMealPlan(parsed);
             localStorage.setItem('current_meal_plan', JSON.stringify(parsed));
             setViewMode('current'); // Switch to current view to show the generated plan
           } else {
             console.warn('Parsed object is not a valid meal plan structure:', parsed);
             setRawResponse(content);
           }
         } catch (e) {
           console.error('JSON Parse Error Detail:', e, 'Raw content block:', content.substring(0, 200));
           setRawResponse(content);
         }
      } else {
        console.warn('No JSON structure found in AI response text');
        setRawResponse(content);
      }
    } catch (error: any) {
      console.error('Final generation error:', error);
      alert(error.message || 'Failed to generate meal plan. The AI might be busy, please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: MealPlan) => {
    try {
      await api.saveMealPlan(plan);
      alert('Meal plan saved successfully!');
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
      // Pass isMarketPurchase flag for option2 (market purchases)
      const isMarketPurchase = option === 'option2';
      await api.consumeMeal(meal.name, items, isMarketPurchase);
      
      // Mark as consumed
      setConsumedMeals(prev => new Set(prev).add(`${idx}-${option}`));
      
      const message = isMarketPurchase 
        ? `${meal.name} purchased and added to inventory, then consumed!`
        : `Consumed ${meal.name} from inventory!`;
      alert(message);
    } catch (error) {
      console.error('Error consuming meal:', error);
      alert('Failed to consume meal: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setConsuming(null);
    }
  };

  const fetchRecipe = async (dishName: string, ingredients: string[]) => {
    setIsRecipeLoading(true);
    try {
      const response = await api.getRecipe(dishName, ingredients);
      setSelectedRecipe(response.data);
      setModalTab('recipe');
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Failed to load recipe. Please try again.');
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
    <main className="flex-1 overflow-y-auto bg-background/30 px-6">
      <div className="max-w-7xl mx-auto py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Weekly Meal Plan</h1>
          <p className="text-secondary/60 font-bold text-[10px] uppercase tracking-widest mt-2 opacity-80">Plan your nutrition for a healthier week, {profile?.profile?.fullName || 'User'}!</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary w-4 h-4 transition-colors" />
            <input 
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border/40 bg-white text-foreground shadow-soft focus:ring-4 focus:ring-primary/20 focus:border-transparent placeholder-gray-300 transition-all text-sm font-bold" 
              placeholder="Search recipes or ingredients..." 
              type="text"
            />
          </div>
          <button 
            onClick={() => setShowConfig(true)}
            className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all whitespace-nowrap active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Plan</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-8 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-[#D2691E] to-[#8B4513] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[320px] border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-secondary/30 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-10">
              <div className="max-w-md">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-1.5 inline-block mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Intelligence Engine</span>
                </div>
                <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tighter italic font-operetta">{displayTitle}</h2>
                <p className="text-white/70 font-medium text-lg">{displaySubtitle}</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:gap-4 w-full lg:w-auto">
                {/* Calorie Goal */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center justify-center group/metric hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3 text-center opacity-80">Calories</div>
                  <div className="text-xl font-bold text-center tracking-tight mb-1">{Math.round(consumedNutrition.calories)}</div>
                  <div className="text-[10px] text-white/40 font-bold text-center mb-4 italic uppercase tracking-widest">Goal: {profile?.profile?.energyGoal || 2500}</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (consumedNutrition.calories / (profile?.profile?.energyGoal || 2500)) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Protein Goal */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center justify-center group/metric hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3 text-center opacity-80">Protein</div>
                  <div className="text-xl font-bold text-center tracking-tight mb-1">{Math.round(consumedNutrition.protein)}g</div>
                  <div className="text-[10px] text-white/40 font-bold text-center mb-4 italic uppercase tracking-widest">Goal: {profile?.profile?.proteinGoal || 180}g</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (consumedNutrition.protein / (profile?.profile?.proteinGoal || 180)) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Carbs Goal */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center justify-center group/metric hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3 text-center opacity-80">Carbs</div>
                  <div className="text-xl font-bold text-center tracking-tight mb-1">{Math.round(consumedNutrition.carbs)}g</div>
                  <div className="text-[10px] text-white/40 font-bold text-center mb-4 italic uppercase tracking-widest">Goal: {Math.round((profile?.profile?.energyGoal || 2500) * 0.45 / 4)}g</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (consumedNutrition.carbs / (Math.round((profile?.profile?.energyGoal || 2500) * 0.45 / 4))) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Hydration Goal */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center justify-center group/metric hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3 text-center opacity-80">Hydration</div>
                  <div className="text-xl font-bold text-center tracking-tight mb-1">{(hydrationData?.amount || 0).toFixed(1)}L</div>
                  <div className="text-[10px] text-white/40 font-bold text-center mb-4 italic uppercase tracking-widest">Goal: {hydrationData?.goal || 2.5}L</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((hydrationData?.amount || 0) / (hydrationData?.goal || 2.5)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between mt-auto pt-10">
              <button 
                onClick={() => setViewMode(viewMode === 'current' ? 'saved' : 'current')}
                className="bg-white text-secondary px-8 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary/20 hover:text-white border border-white/20 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-[0.2em]"
              >
                <span>{viewMode === 'current' ? 'View Saved Plans' : 'Return to Current Plan'}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${viewMode === 'current' ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>

          {/* Meal Section Content (Loading/Saved/Current) */}
          {loading ? (
            <div className="bg-white rounded-[3rem] border border-primary/20 p-20 flex flex-col items-center justify-center space-y-8 shadow-soft animate-pulse">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-[2.5rem] animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-secondary" />
              </div>
              <div className="text-center space-y-3">
                <p className="font-bold text-3xl text-foreground tracking-tight">AI is crafting your plan...</p>
                <p className="text-secondary/60 font-bold text-[10px] uppercase tracking-widest max-w-xs mx-auto">Optimizing for metabolic health and current bazaar prices.</p>
              </div>
            </div>
          ) : viewMode === 'saved' ? (
            <div className="space-y-6">
              {savedPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="bg-white border border-border/40 rounded-[2.5rem] p-10 hover:shadow-2xl hover:border-secondary/30 transition-all duration-500 group relative overflow-hidden shadow-soft">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/20 transition-all"></div>
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-foreground tracking-tight">Weekly Plan: {new Date(plan.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-4">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border/40">
                              {Array.isArray(plan.meals) ? plan.meals.length : 0} Personalized Meals
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text_secondary bg-primary/20 px-4 py-2 rounded-xl border border-primary/20">
                              ৳{plan.budget} Smart Budget
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setMealPlan({
                              isMealPlan: true,
                              summary: "Saved Plan",
                              meals: plan.meals,
                              totalEstimatedCost: plan.totalCost
                            });
                            setViewMode('current');
                          }}
                          className="w-full md:w-auto px-10 py-5 bg-secondary text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95"
                        >
                          Restore Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[4rem] border border-dashed border-primary/30 p-24 text-center shadow-soft">
                   <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20">
                     <Calendar className="w-10 h-10 text-secondary/40" />
                   </div>
                   <h3 className="text-3xl font-bold text-foreground tracking-tight">No Saved Protocols</h3>
                   <p className="text-muted-foreground font-medium max-w-xs mx-auto mt-4 leading-relaxed">Your generated nutritional strategies will appear here for historical tracking.</p>
                </div>
              )}
            </div>
          ) : mealPlan ? (
             <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="relative z-10 flex-1">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-4 tracking-tight">
                    <Brain className="w-8 h-8 text-secondary" />
                    NutriAI Insights
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                     {displayPlanSummary}
                  </p>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="bg-secondary text-white px-10 py-6 rounded-[2rem] shadow-lg shadow-secondary/20 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Estimated Cost</span>
                    <span className="text-4xl font-bold">৳{mealPlan.totalEstimatedCost}</span>
                  </div>
                  <button
                     onClick={() => savePlan(mealPlan)}
                     className="flex items-center gap-3 px-8 py-4 bg-white border border-primary/20 text-secondary rounded-2xl hover:bg-primary/10 transition-all font-bold text-[10px] uppercase tracking-widest shadow-soft active:scale-95"
                   >
                     <ShoppingBag className="w-4 h-4" />
                     Save Plan
                   </button>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {mealPlan.meals.map((meal, idx) => (
                   <div key={idx} className="bg-white rounded-[2.5rem] border border-border/40 overflow-hidden shadow-soft hover:shadow-xl transition-all group">
                     <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                           {meal.type.toLowerCase().includes('breakfast') ? <Sunrise className="w-4 h-4 text-orange-400" /> : 
                            meal.type.toLowerCase().includes('lunch') ? <Sun className="w-4 h-4 text-primary" /> : 
                            <Moon className="w-4 h-4 text-indigo-400" />}
                           <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-100">{meal.type}</span>
                         </div>
                         <h4 className="text-2xl font-bold text-black leading-tight">
                           <span 
                             className="cursor-pointer hover:text-primary transition-colors" 
                             onClick={() => handleMealClick(meal.name, [], meal.nutrition, meal.type)}
                           >
                             {meal.name}
                           </span>
                         </h4>
                       </div>
                     </div>
                     
                     <div className="p-8 space-y-6">
                       <div className="flex flex-wrap gap-3">
                         <div className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                           {meal.nutrition.calories} <span className="text-muted-foreground/60 ml-1">kcal</span>
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                            {meal.nutrition.protein} <span className="text-muted-foreground/60 ml-1">Protein</span>
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                            {meal.nutrition.carbs} <span className="text-muted-foreground/60 ml-1">Carbs</span>
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                            {meal.nutrition.fat} <span className="text-muted-foreground/60 ml-1">Fats</span>
                         </div>
                       </div>

                       <div className="space-y-4 pt-2">
                         {meal.option1 && meal.option1.items && meal.option1.items.length > 0 ? (
                           <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 relative overflow-hidden group/opt hover:bg-primary/10 transition-colors">
                             <div className="absolute top-0 right-0 bg-black text-[8px] text-white px-4 py-1.5 rounded-bl-2xl font-bold uppercase tracking-[0.2em]">
                               STOCK CONFIRMED
                             </div>
                             <div className="flex justify-between items-center mb-3">
                               <span className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-primary" />
                                 Inventory Option
                               </span>
                               <span className="text-sm font-bold text-black tracking-tight">৳{meal.option1.cost}</span>
                             </div>
                             <p className="text-lg font-bold text-black mb-1">
                               <span 
                                 className="cursor-pointer hover:text-primary hover:underline transition-colors" 
                                 onClick={() => handleMealClick(meal.option1?.name || '', meal.option1?.items || [], meal.nutrition, meal.type)}
                               >
                                 {meal.option1?.name}
                               </span>
                             </p>
                             <p className="text-xs text-muted-foreground font-medium mb-5 line-clamp-1">
                               Uses: {meal.option1.items.join(', ')}
                             </p>
                             <button
                               onClick={() => consumeMeal(idx, 'option1')}
                               disabled={consuming === `${idx}-option1` || consumedMeals.has(`${idx}-option1`)}
                               className="w-full py-4 bg-black text-white text-[10px] font-bold rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-xl active:scale-95"
                             >
                               {consuming === `${idx}-option1` ? (
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                               ) : consumedMeals.has(`${idx}-option1`) ? (
                                 <>
                                   <CheckCircle2 className="w-4 h-4" />
                                   Marked as Consumed
                                 </>
                               ) : (
                                 <>
                                   <Utensils className="w-4 h-4" />
                                   Mark as Consumed
                                 </>
                               )}
                             </button>
                           </div>
                         ) : (
                           <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                             <p className="text-xs text-amber-700 font-bold flex items-center gap-3">
                               <AlertCircle className="w-4 h-4" />
                               No direct inventory match found
                             </p>
                           </div>
                         )}

                          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group/opt hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Market Option
                              </span>
                              <span className="text-sm font-bold text-black tracking-tight">৳{meal.option2.cost}</span>
                            </div>
                            <p className="text-lg font-bold text-black mb-1">
                              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleMealClick(meal.option2.name, meal.option2.items, meal.nutrition, meal.type)}>
                                {meal.option2.name}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground font-medium mb-5 line-clamp-1">
                              Buy: {meal.option2.items.join(', ')}
                            </p>
                            <button
                              onClick={() => consumeMeal(idx, 'option2')}
                              disabled={consuming === `${idx}-option2` || consumedMeals.has(`${idx}-option2`)}
                              className="w-full py-4 bg-white border border-gray-200 text-black text-[10px] font-bold rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-sm active:scale-95"
                            >
                              {consuming === `${idx}-option2` ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              ) : consumedMeals.has(`${idx}-option2`) ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Purchased and Consumed
                                </>
                              ) : (
                                <>
                                  <Utensils className="w-4 h-4" />
                                  Purchase & Consume
                                </>
                              )}
                            </button>
                          </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Shopping List Card */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-50/50 flex items-center justify-between group cursor-pointer hover:border-black transition-all">
                 <div className="flex items-center gap-6">
                   <div className="bg-primary/10 text-primary p-5 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                     <ShoppingBasket className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-black tracking-tight">Generate Shopping List</h3>
                     <p className="text-muted-foreground font-medium mt-1">Export ingredients needed for the entire week.</p>
                   </div>
                 </div>
                 <button className="bg-gray-50 text-black w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:bg-black group-hover:text-white group-hover:translate-x-2">
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </div>
             </div>
          ) : rawResponse ? (
            <div className="bg-white rounded-[3rem] border border-border/40 p-10 prose prose-slate max-w-none shadow-soft whitespace-pre-wrap font-bold text-foreground/80 leading-relaxed">
              {rawResponse}
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] border border-dashed border-primary/30 p-20 flex flex-col items-center justify-center text-center space-y-10 shadow-soft animate-in fade-in duration-700">
              <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-primary/20">
                <Utensils className="w-16 h-16 text-secondary/40" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">No Active Meal Plan</h2>
                <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg leading-relaxed">
                  Get a personalized, price-smart meal plan optimized for your metabolism and local bazaar prices.
                </p>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-12 py-5 bg-secondary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95 flex items-center gap-4"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Now
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Mini Dashboard (Right Column) */}
        
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] border border-primary/20 p-10 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-primary/20 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-primary/20">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Plan Setup</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Personalize your AI generation</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary ml-2 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Total Budget (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-secondary text-lg">৳</span>
                  <input
                    type="number"
                    value={config.budget}
                    onChange={(e) => setConfig({ ...config, budget: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-border/40 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:bg-white focus:border-transparent outline-none transition-all font-bold text-xl text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary ml-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Time Period
                </label>
                <select
                  value={config.timePeriod}
                  onChange={(e) => setConfig({ ...config, timePeriod: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border border-border/40 rounded-2xl outline-none font-bold text-foreground focus:ring-4 focus:ring-primary/20 focus:bg-white focus:border-transparent appearance-none cursor-pointer transition-all"
                >
                  <optgroup label="Single Meals">
                    <option value="breakfast">Breakfast Only</option>
                    <option value="lunch">Lunch Only</option>
                    <option value="dinner">Dinner Only</option>
                  </optgroup>
                  <optgroup label="Full Plans">
                    <option value="one_day">Full Day (5 Meals)</option>
                    <option value="one_week">Full Week (35 Meals)</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary ml-2 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Notes / Focus
                </label>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  placeholder="e.g. High protein, low carb, or avoiding nuts..."
                  className="w-full px-6 py-5 bg-gray-50 border border-border/40 rounded-2xl outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white focus:border-transparent h-32 resize-none text-sm font-bold text-foreground transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 py-5 bg-white text-muted-foreground border border-border/40 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50 hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePlan}
                  className="flex-1 py-5 bg-secondary text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      {activeMeal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col border border-primary/20">
            {/* Modal Header */}
            <div className="p-10 pb-6 flex justify-between items-start bg-background/30 border-b border-border/20">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl border border-primary/20 shadow-sm">
                    {activeMeal.type}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-foreground tracking-tight leading-tight">{activeMeal.name}</h2>
              </div>
              <button 
                onClick={() => setActiveMeal(null)}
                className="w-12 h-12 bg-white flex items-center justify-center text-muted-foreground hover:text-secondary hover:bg-primary/20 rounded-2xl transition-all active:scale-90 shadow-soft border border-border/40"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 p-1.5 mx-10 rounded-[1.5rem] mb-10 border border-border/40 shadow-inner">
              <button
                onClick={() => setModalTab('nutrition')}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${
                  modalTab === 'nutrition' ? 'bg-white text-secondary shadow-lg border border-primary/20' : 'text-muted-foreground hover:text-secondary'
                }`}
              >
                <Brain className="w-4 h-4" /> Nutrition
              </button>
              <button
                onClick={() => setModalTab('recipe')}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${
                  modalTab === 'recipe' ? 'bg-white text-secondary shadow-lg border border-primary/20' : 'text-muted-foreground hover:text-secondary'
                }`}
              >
                <ChefHat className="w-4 h-4" /> Cooking Guide
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-hide">
              {modalTab === 'nutrition' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100/50 text-center shadow-soft">
                      <p className="text-[9px] font-bold text-orange-800 uppercase tracking-widest mb-3 opacity-60">Calories</p>
                      <p className="text-3xl font-bold text-foreground">{activeMeal.nutrition.calories}</p>
                    </div>
                    <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 text-center shadow-soft">
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3 opacity-60">Protein</p>
                      <p className="text-3xl font-bold text-foreground">{activeMeal.nutrition.protein}g</p>
                    </div>
                    <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100/50 text-center shadow-soft">
                      <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest mb-3 opacity-60">Carbs</p>
                      <p className="text-3xl font-bold text-foreground">{activeMeal.nutrition.carbs}g</p>
                    </div>
                    <div className="p-8 bg-yellow-50/50 rounded-[2.5rem] border border-yellow-100/50 text-center shadow-soft">
                      <p className="text-[9px] font-bold text-yellow-800 uppercase tracking-widest mb-3 opacity-60">Fat</p>
                      <p className="text-3xl font-bold text-foreground">{activeMeal.nutrition.fat}g</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-4 tracking-tight">
                       <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                         <ShoppingBag className="w-5 h-5 text-secondary" />
                       </div>
                       Included Ingredients
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {activeMeal?.items && activeMeal.items.length > 0 ? (
                        activeMeal.items.map((item, i) => (
                          <span key={i} className="px-8 py-4 bg-white rounded-2xl border border-border/40 shadow-soft text-sm font-bold tracking-tight hover:border-secondary transition-all cursor-default">
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground font-medium italic bg-background/30 p-8 rounded-[2rem] border border-border/40 w-full text-center">Standard healthy ingredients suitable for {activeMeal?.type}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                  {selectedRecipe ? (
                    <div className="space-y-12">
                      <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 shadow-inner">
                        <p className="text-2xl font-medium text-foreground leading-relaxed italic opacity-80 font-operetta">
                          "{selectedRecipe.description}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <h3 className="text-2xl font-bold text-foreground flex items-center gap-4 tracking-tight">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                              <ShoppingBag className="w-5 h-5 text-secondary" />
                            </div>
                            Detailed Ingredients
                          </h3>
                          <div className="space-y-4">
                            {selectedRecipe.ingredients.map((ing: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-5 bg-background rounded-2xl border border-border/40 group hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                                <span className="font-bold text-foreground">{ing.item}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-primary/20 px-4 py-1.5 rounded-xl border border-primary/20">{ing.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-8">
                          <h3 className="text-2xl font-bold text-foreground flex items-center gap-4 tracking-tight">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                              <ListChecks className="w-5 h-5 text-secondary" />
                            </div>
                            Step-by-Step Guide
                          </h3>
                          <div className="space-y-8">
                            {selectedRecipe.instructions.map((step: string, i: number) => (
                              <div key={i} className="flex gap-8 group">
                                <span className="flex-shrink-0 w-10 h-10 bg-secondary text-white text-[10px] font-bold rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-secondary transition-all duration-500 shadow-lg shadow-secondary/10">
                                  {i + 1}
                                </span>
                                <p className="text-base leading-relaxed text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-secondary text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="relative z-10">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 opacity-80">Chef's Secret Intelligence</h4>
                           <p className="text-lg font-medium leading-relaxed italic text-white/90">{selectedRecipe.chefTips}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-12">
                      <div className="w-32 h-32 bg-background rounded-[2.5rem] shadow-inner relative group border border-border/40 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <Utensils className="w-16 h-16 text-secondary/30 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="max-w-xs">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight mb-4">Ready to Cook?</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed">
                          NutriAI will generate a custom culinary guide tailored to your selected items.
                        </p>
                      </div>
                      <button
                        onClick={() => activeMeal && fetchRecipe(activeMeal.name, activeMeal.items)}
                        disabled={isRecipeLoading}
                        className="px-12 py-5 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center gap-4 active:scale-95 uppercase tracking-widest text-[10px] group"
                      >
                        {isRecipeLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        Generate Cooking Protocol
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Loading Overlay */}
      {isRecipeLoading && !selectedRecipe && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-foreground/60 backdrop-blur-md">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-[2.5rem] animate-spin" />
            <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
          </div>
          <p className="mt-10 text-white font-bold tracking-[0.4em] uppercase text-[10px] animate-pulse">Consulting NutriAI Chef...</p>
        </div>
      )}
      </div>
    </main>
  );
}
