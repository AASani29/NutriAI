
import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, ChefHat, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
   const { isSignedIn } = useAuth();

   return (
      <section className="relative w-full pt-16 pb-10 md:pt-31 md:pb-10 overflow-hidden bg-background">
         {/* Balanced Background: Tech + Nature */}
         <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

               {/* Left Content */}
               <div className="flex flex-col gap-8 relative z-10">


                  <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                     Manage Food.<br />
                     <span>
                        Master Nutrition.
                     </span> <br />
                     Minimize Waste.
                  </h1>

                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                     NutriAI connects your pantry inventory with personalized nutrition goals and sustainability tracking. Buying, cooking, and saving—simplified.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                     <Link
                        to={isSignedIn ? '/dashboard' : '/sign-in'}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black hover:scale-[1.02] transition-all duration-300 font-bold text-lg shadow-xl shadow-gray-900/10"
                     >
                        {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
                        <ArrowRight className="w-5 h-5" />
                     </Link>
                     <a
                        href="#how-it-works"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium text-lg"
                     >
                        See How It Works
                     </a>
                  </div>
               </div>

               {/* Right Visuals (Unified Dashboard) */}
               <div className="relative w-full h-[600px] hidden lg:block perspective-1000">
                  {/* Main Interface Card */}
                  <div className="absolute top-10 right-0 w-[500px] h-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700 p-6 z-10">
                     {/* Header */}
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <ScanLine className="w-5 h-5 text-gray-700" />
                           </div>
                           <div>
                              <div className="font-bold text-gray-900">Kitchen Overview</div>
                              <div className="text-xs text-gray-500">Live Inventory Status</div>
                           </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Score: 92/100</div>
                     </div>

                     {/* Stats Row */}
                     <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                           <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
                           <div className="text-xs text-orange-700 font-bold mb-1">Expires Soon</div>
                           <div className="text-[10px] text-gray-500">Tomatoes, Milk, Bread</div>
                        </div>
                        <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                           <div className="text-2xl font-bold text-gray-900 mb-1">1,850</div>
                           <div className="text-xs text-blue-700 font-bold mb-1">Kcal Today</div>
                           <div className="text-[10px] text-gray-500">On Target</div>
                        </div>
                     </div>

                     {/* AI Recommendation */}
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🥘</div>
                        <div>
                           <div className="text-xs font-bold text-primary mb-0.5">Recommended Dinner</div>
                           <div className="font-bold text-gray-900 text-sm">Roasted Tomato Soup</div>
                           <div className="text-xs text-gray-500 mt-1">Uses expiring tomatoes • Low Calorie</div>
                        </div>
                     </div>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute top-1/2 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-100 z-20">
                     <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <img className="w-5 h-5 text-green-700" src='/gajor.png'/>
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-900">Waste Prevented</div>
                        <div className="text-[10px] text-gray-500">1.2kg saved this week</div>
                     </div>
                  </div>

                  <div className="absolute bottom-1/4 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-300 z-20">
                     <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-orange-700" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-900">New Recipe Unlocked</div>
                        <div className="text-[10px] text-gray-500">Based on your pantry</div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </section>
   );
}
