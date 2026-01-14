import { useState } from 'react';
import {
  Calendar,
  Utensils,
  Sparkles,
  DollarSign,
  Brain,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  ShoppingBasket,
  ChefHat,
  X,
  ListChecks,
  MessageSquare,
  Search,
  Dumbbell,
  ChevronRight,
  Plus,
  Info,
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useApi } from '../hooks/useApi';
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
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(() => {
    const saved = localStorage.getItem('current_meal_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'saved'>('current');
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [consuming, setConsuming] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [activeMeal, setActiveMeal] = useState<{ name: string; items: string[]; nutrition: any; type: string } | null>(null);
  const [modalTab, setModalTab] = useState<'nutrition' | 'recipe'>('nutrition');
  
  const [config, setConfig] = useState({
    budget: 200,
    timePeriod: 'one_day',
    notes: '',
  });

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
      console.log('Generating meal plan with config:', config);
      const response = await api.getOptimizedMealPlan({
        budget: config.budget,
        timePeriod: config.timePeriod,
        notes: config.notes,
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
      await api.consumeMeal(meal.name, items);
      alert(`Consumed ${meal.name}! Inventory updated.`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Complete Your Health Profile</h1>
        <p className="text-muted-foreground">
          To generate a "Price-Smart Meal Plan" tailored to your metabolism and health goals, we need your height, weight, and preferences.
        </p>
        <Link
          to="/profile/edit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold shadow-lg"
        >
          Setup My Profile
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Weekly Meal Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan your nutrition for a healthier week, {profile?.profile?.fullName || 'User'}!</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-white text-foreground shadow-soft focus:ring-2 focus:ring-primary/50 placeholder-gray-400 transition-all text-sm font-medium" 
              placeholder="Search for recipes or ingredients" 
              type="text"
            />
          </div>
          <button 
            onClick={() => setShowConfig(true)}
            className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all whitespace-nowrap active:scale-95"
          >
            <Sparkles className="text-primary w-4 h-4" />
            <span>Generate Plan</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-soft flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Oct 20</span>
                </div>
                <h2 className="text-4xl font-black max-w-md leading-[1.1] mb-2 tracking-tight">Focus on protein-rich meals this week!</h2>
                <p className="text-white/80 font-medium max-w-sm">Optimized based on your goals and local market prices.</p>
              </div>
              
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-xl">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 text-center">Weekly Goal</div>
                  <div className="text-3xl font-black text-center">85%</div>
                  <div className="w-24 h-2 bg-black/20 rounded-full mt-3 overflow-hidden p-0.5">
                    <div className="bg-white w-[85%] h-full rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between mt-auto pt-8">
              
              <button 
                onClick={() => setViewMode(viewMode === 'current' ? 'saved' : 'current')}
                className="bg-black text-white px-8 py-4 rounded-full font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl active:scale-95 text-xs uppercase tracking-widest"
              >
                <span>{viewMode === 'current' ? 'View Saved Plans' : 'View Current Plan'}</span>
                <div className="bg-white rounded-full p-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </div>
              </button>
            </div>
          </div>

          {/* Meal Section Content (Loading/Saved/Current) */}
          {loading ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 flex flex-col items-center justify-center space-y-6 shadow-soft">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-black text-2xl mb-2 text-black tracking-tight">AI is crafting your plan...</p>
                <p className="text-muted-foreground font-medium max-w-xs">Optimizing for metabolic health and current market prices.</p>
              </div>
            </div>
          ) : viewMode === 'saved' ? (
            <div className="space-y-6">
              {savedPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <h3 className="text-xl font-black text-black">Meal Plan from {new Date(plan.createdAt).toLocaleDateString()}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                              {Array.isArray(plan.meals) ? plan.meals.length : 0} meals
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                              ৳{plan.budget} budget
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
                          className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg active:scale-95"
                        >
                          Load Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-20 text-center">
                   <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                   <h3 className="text-xl font-black text-black">No saved plans yet</h3>
                   <p className="text-muted-foreground font-medium max-w-xs mx-auto mt-2">Generate and save a plan to see it archived here for future reference.</p>
                </div>
              )}
            </div>
          ) : mealPlan ? (
             <div className="space-y-8">
               <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                 <div className="relative z-10 flex-1">
                   <h3 className="text-2xl font-black text-black flex items-center gap-3 mb-4">
                     <Info className="w-6 h-6 text-primary" />
                     NutriAI Insights
                   </h3>
                   <p className="text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                     "{mealPlan.summary}"
                   </p>
                 </div>
                 <div className="relative z-10 flex flex-col items-center gap-4">
                   <div className="bg-black text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex flex-col items-center">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Estimated Cost</span>
                     <span className="text-3xl font-black">৳{mealPlan.totalEstimatedCost}</span>
                   </div>
                   <button
                      onClick={() => savePlan(mealPlan)}
                      className="flex items-center gap-3 px-8 py-3 bg-gray-50 border border-gray-100 text-black rounded-full hover:bg-black hover:text-white transition-all font-black text-xs uppercase tracking-widest shadow-sm active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Save Plan
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {mealPlan.meals.map((meal, idx) => (
                   <div key={idx} className="bg-white rounded-[2.5rem] border border-gray-50/50 overflow-hidden shadow-soft hover:shadow-xl transition-all group">
                     <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                           {meal.type.toLowerCase().includes('breakfast') ? <Sunrise className="w-4 h-4 text-orange-400" /> : 
                            meal.type.toLowerCase().includes('lunch') ? <Sun className="w-4 h-4 text-primary" /> : 
                            <Moon className="w-4 h-4 text-indigo-400" />}
                           <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-100">{meal.type}</span>
                         </div>
                         <h4 className="text-2xl font-black text-black leading-tight">
                           <span 
                             className="cursor-pointer hover:text-primary transition-colors" 
                             onClick={() => handleMealClick(meal.name, [], meal.nutrition, meal.type)}
                           >
                             {meal.name}
                           </span>
                         </h4>
                       </div>
                       <div className="bg-white p-3 rounded-2xl shadow-sm">
                         <ChefHat className="w-6 h-6 text-gray-200" />
                       </div>
                     </div>
                     
                     <div className="p-8 space-y-6">
                       <div className="flex flex-wrap gap-3">
                         <div className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                           {meal.nutrition.calories} <span className="text-muted-foreground/60 ml-1">kcal</span>
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                            {meal.nutrition.protein} <span className="text-muted-foreground/60 ml-1">Protein</span>
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-4 py-2 rounded-full border border-gray-100">
                            {meal.nutrition.carbs} <span className="text-muted-foreground/60 ml-1">Carbs</span>
                         </div>
                       </div>

                       <div className="space-y-4 pt-2">
                         {meal.option1 ? (
                           <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 relative overflow-hidden group/opt hover:bg-primary/10 transition-colors">
                             <div className="absolute top-0 right-0 bg-black text-[8px] text-white px-4 py-1.5 rounded-bl-2xl font-black uppercase tracking-[0.2em]">
                               STOCK CONFIRMED
                             </div>
                             <div className="flex justify-between items-center mb-3">
                               <span className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-primary" />
                                 Inventory Option
                               </span>
                               <span className="text-sm font-black text-black tracking-tight">৳{meal.option1.cost}</span>
                             </div>
                             <p className="text-lg font-black text-black mb-1">
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
                               disabled={consuming === `${idx}-option1`}
                               className="w-full py-4 bg-black text-white text-[10px] font-black rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest shadow-xl active:scale-95"
                             >
                               {consuming === `${idx}-option1` ? (
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                               ) : (
                                 <Utensils className="w-4 h-4" />
                               )}
                               Mark as Consumed
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
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Market Option
                              </span>
                              <span className="text-sm font-black text-black tracking-tight">৳{meal.option2.cost}</span>
                            </div>
                            <p className="text-lg font-black text-black mb-1">
                              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleMealClick(meal.option2.name, meal.option2.items, meal.nutrition, meal.type)}>
                                {meal.option2.name}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground font-medium mb-5 line-clamp-1">
                              Buy: {meal.option2.items.join(', ')}
                            </p>
                            <button
                              onClick={() => consumeMeal(idx, 'option2')}
                              disabled={consuming === `${idx}-option2`}
                              className="w-full py-4 bg-white border border-gray-200 text-black text-[10px] font-black rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest shadow-sm active:scale-95"
                            >
                              {consuming === `${idx}-option2` ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Utensils className="w-4 h-4" />
                              )}
                              Purchase & Consume
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
                     <h3 className="text-2xl font-black text-black tracking-tight">Generate Shopping List</h3>
                     <p className="text-muted-foreground font-medium mt-1">Export ingredients needed for the entire week.</p>
                   </div>
                 </div>
                 <button className="bg-gray-50 text-black w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:bg-black group-hover:text-white group-hover:translate-x-2">
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </div>
             </div>
          ) : rawResponse ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-50 p-10 prose prose-slate max-w-none shadow-soft whitespace-pre-wrap font-medium text-black/80 leading-relaxed">
              {rawResponse}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center space-y-8">
              <div className="p-8 bg-gray-50 rounded-full shadow-inner">
                <Utensils className="w-20 h-20 text-gray-200" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black tracking-tight mb-4">No Active Meal Plan</h2>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                  Get a personalized, price-smart meal plan optimized for your metabolism and local bazaar prices.
                </p>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-12 py-5 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Now
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Mini Dashboard (Right Column) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Daily Nutrition Card */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-black tracking-tight">Daily Nutrition</h3>
              <span className="text-[10px] font-black bg-primary/20 text-black px-4 py-1.5 rounded-full uppercase tracking-widest">Today</span>
            </div>
            <div className="flex flex-col items-center mb-12 relative">
              <div className="w-56 h-56 rounded-full flex items-center justify-center relative bg-gray-50">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-gray-100" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeWidth="10"></circle>
                  <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeDasharray="276" strokeDashoffset="75" strokeLinecap="round" strokeWidth="10"></circle>
                </svg>
                <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black text-black tracking-tighter">1,450</div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Kcal Left</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end text-xs mb-2">
                  <span className="font-black text-black uppercase tracking-widest">Carbs</span>
                  <span className="font-black text-black tracking-tighter">120g <span className="text-muted-foreground/60 font-medium">/ 250g</span></span>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <div className="h-full bg-orange-400 w-1/2 rounded-full shadow-sm"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end text-xs mb-2">
                  <span className="font-black text-black uppercase tracking-widest">Protein</span>
                  <span className="font-black text-black tracking-tighter">85g <span className="text-muted-foreground/60 font-medium">/ 140g</span></span>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <div className="h-full bg-black w-2/3 rounded-full shadow-sm"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end text-xs mb-2">
                  <span className="font-black text-black uppercase tracking-widest">Fat</span>
                  <span className="font-black text-black tracking-tighter">30g <span className="text-muted-foreground/60 font-medium">/ 65g</span></span>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <div className="h-full bg-primary w-1/3 rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hydration Card */}
          <div className="bg-blue-50 rounded-[2.5rem] p-10 shadow-soft border border-blue-100/50 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-blue-900 tracking-tight">Hydration</h3>
              <p className="text-xs text-blue-700/70 font-black uppercase tracking-widest mt-1 mb-6">Metabolic Fuel</p>
              
              <div className="flex gap-3 flex-wrap mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className={`w-10 h-14 rounded-2xl flex items-end justify-center pb-1 overflow-hidden shadow-sm transition-all border-2 ${i <= 4 ? 'bg-white border-blue-200' : 'bg-blue-100/50 border-transparent opacity-50'}`}>
                    {i <= 4 && <div className="w-full bg-blue-500 rounded-xl" style={{ height: i === 4 ? '60%' : '100%' }}></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-4xl font-black text-blue-900 tracking-tighter">1.2<span className="text-xl opacity-60">L</span></span>
                <span className="text-sm text-blue-700/60 font-bold ml-1">/ 2.5L</span>
              </div>
              <button className="bg-white text-blue-600 w-14 h-14 rounded-[1.5rem] shadow-xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center border border-blue-100">
                <Plus className="w-8 h-8 font-black" />
              </button>
            </div>
          </div>

          {/* Weight Card */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-4 rounded-[1.5rem] text-purple-600 shadow-sm">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black tracking-tight">Weight</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Progress Goal</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-black tracking-tighter">72</span>
                <span className="text-xs text-muted-foreground font-black uppercase tracking-widest ml-1">kg</span>
              </div>
            </div>
            
            <div className="h-24 w-full bg-gray-50/50 rounded-3xl p-4 border border-gray-50">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path className="stroke-purple-400" d="M0,25 Q10,20 20,25 T40,20 T60,25 T80,15 T100,20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle className="fill-white stroke-purple-500" cx="80" cy="15" r="4" strokeWidth="2"></circle>
              </svg>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-6">
              <span className="text-red-500 flex items-center gap-1">
                 <TrendingDown className="w-3 h-3" />
                 -1.2 kg
              </span>
              <span className="text-muted-foreground">This week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl animate-in zoom-in-95 duration-200 bg-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-black tracking-tight">Plan Setup</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Total Budget (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-black text-lg">৳</span>
                  <input
                    type="number"
                    value={config.budget}
                    onChange={(e) => setConfig({ ...config, budget: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-black text-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Time Period
                </label>
                <select
                  value={config.timePeriod}
                  onChange={(e) => setConfig({ ...config, timePeriod: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none font-black text-black focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
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

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Notes / Focus
                </label>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  placeholder="e.g. High protein, low carb, or avoiding nuts..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary h-32 resize-none text-sm font-medium text-black"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 py-4 bg-gray-100 text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePlan}
                  className="flex-1 py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary hover:text-black shadow-xl transition-all active:scale-95"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      {activeMeal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="p-10 pb-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {activeMeal.type}
                  </span>
                </div>
                <h2 className="text-4xl font-black text-black tracking-tight leading-tight">{activeMeal.name}</h2>
              </div>
              <button 
                onClick={() => setActiveMeal(null)}
                className="w-12 h-12 bg-gray-50 flex items-center justify-center text-muted-foreground hover:bg-black hover:text-white rounded-full transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 p-1.5 mx-10 rounded-2xl mb-8">
              <button
                onClick={() => setModalTab('nutrition')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1rem] transition-all flex items-center justify-center gap-2 ${
                  modalTab === 'nutrition' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-muted-foreground hover:text-black'
                }`}
              >
                <Brain className="w-4 h-4" /> Nutrition
              </button>
              <button
                onClick={() => setModalTab('recipe')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1rem] transition-all flex items-center justify-center gap-2 ${
                  modalTab === 'recipe' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-muted-foreground hover:text-black'
                }`}
              >
                <ChefHat className="w-4 h-4" /> Cooking Guide
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10">
              {modalTab === 'nutrition' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Calories</p>
                      <p className="text-2xl font-black text-black">{activeMeal.nutrition.calories}</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Protein</p>
                      <p className="text-2xl font-black text-black">{activeMeal.nutrition.protein}</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Carbs</p>
                      <p className="text-2xl font-black text-black">{activeMeal.nutrition.carbs}</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Fat</p>
                      <p className="text-2xl font-black text-black">{activeMeal.nutrition.fat}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3">
                       <ShoppingBag className="w-6 h-6 text-primary" />
                       Included Ingredients
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {activeMeal?.items && activeMeal.items.length > 0 ? (
                        activeMeal.items.map((item, i) => (
                          <span key={i} className="px-6 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm text-sm font-black tracking-tight hover:border-black transition-colors">
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground font-medium italic bg-gray-50 p-6 rounded-2xl border border-gray-100 w-full text-center">Standard healthy ingredients suitable for {activeMeal?.type}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {selectedRecipe ? (
                    <div className="space-y-12">
                      <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20">
                        <p className="text-xl font-medium text-black leading-relaxed italic">
                          "{selectedRecipe.description}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <h3 className="text-xl font-black flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            Ingredients
                          </h3>
                          <div className="space-y-3">
                            {selectedRecipe.ingredients.map((ing: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                                <span className="font-black text-black">{ing.item}</span>
                                <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{ing.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xl font-black flex items-center gap-3">
                            <ListChecks className="w-6 h-6 text-primary" />
                            Step-by-Step
                          </h3>
                          <div className="space-y-6">
                            {selectedRecipe.instructions.map((step: string, i: number) => (
                              <div key={i} className="flex gap-6 group">
                                <span className="flex-shrink-0 w-8 h-8 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-lg">
                                  {i + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-muted-foreground font-medium group-hover:text-black transition-colors">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Chef's Secret Tips</h4>
                        <p className="text-sm font-medium leading-relaxed text-gray-300">{selectedRecipe.chefTips}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                      <div className="p-10 bg-gray-50 rounded-full shadow-inner relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Utensils className="w-20 h-20 text-gray-200 relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-black tracking-tight mb-3">Ready to Cook?</h3>
                        <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                          NutriAI will generate a custom culinary guide tailored to your selected items.
                        </p>
                      </div>
                      <button
                        onClick={() => activeMeal && fetchRecipe(activeMeal.name, activeMeal.items)}
                        disabled={isRecipeLoading}
                        className="px-12 py-5 bg-black text-white font-black rounded-full hover:bg-primary hover:text-black transition-all shadow-xl flex items-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
                      >
                        {isRecipeLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 shadow-sm" />}
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
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="mt-8 text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Consulting NutriAI Chef...</p>
        </div>
      )}
      </div>
    </main>
  );
}
