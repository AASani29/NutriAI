
import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, ChefHat, ScanLine, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'
export default function HeroSection() {
   const { isSignedIn } = useAuth();

   return (
      <section id="hero" className=" relative w-full pt-16 pb-10 md:pt-31 bg-[url('/diet.jpg')] bg-cover bg-center bg-opacity-10 md:pb-10 overflow-hidden bg-background">
         {/* Balanced Background: Tech + Nature */}
         <div className="absolute inset-0 bg-black/40"></div>
         {/* <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
         </div> */}

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

               {/* Left Content */}
               <div className="flex flex-col gap-8 relative z-10">


                  <h1 >
                     <motion.span transition={{ duration: 0.7, ease: 'easeIn' }} whileInView={{ opacity: 1, x: 0 }} initial={{ x: -80, opacity: 0 }} viewport={{ once: true }} className="block ml-4 text-5xl md:text-6xl lg:text-6xl  tracking-tight text-white leading-[1.1]">
                        Manage Food
                     </motion.span><br />
                     <motion.span transition={{ duration: 0.7, ease: 'easeIn', delay: 0.5 }} whileInView={{ opacity: 1, x: 10 }} initial={{ x: -80, opacity: 0 }} viewport={{ once: true }} className="block ml-8 text-5xl md:text-6xl  lg:text-6xl  tracking-tight text-white leading-[1.1]">
                        Master Nutrition
                     </motion.span> <br />
                     <motion.span transition={{ duration: 0.9, ease: 'easeIn', delay: 0.7 }} whileInView={{ opacity: 1, x: 20 }} initial={{ x: -80, opacity: 0 }} viewport={{ once: true }} className="block ml-12 text-5xl  md:text-6xl lg:text-6xl tracking-tight text-white leading-[1.1]">
                        Minimize Waste
                     </motion.span>
                  </h1>

                  <motion.p transition={{ duration: 0.7, ease: 'easeIn', delay: 0.7 }} whileInView={{ opacity: 1, y: 0 }} initial={{ y: 80, opacity: 0 }} viewport={{ once: true }} className="text-xl  font-bold text-white leading-relaxed max-w-lg pt-10">
                     NutriAI connects your pantry inventory with personalized nutrition goals and sustainability tracking. Buying, cooking, and saving—simplified.
                  </motion.p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                     <Link
                        to={isSignedIn ? '/dashboard' : '/sign-in'}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark hover:scale-[1.02] transition-all duration-300 font-bold text-lg shadow-xl shadow-primary/10"
                     >
                        {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
                        <ArrowRight className="w-5 h-5" />
                     </Link>
                     <a
                        href="#how-it-works"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-soft"
                     >
                        See How It Works
                     </a>
                  </div>
               </div>

               {/* Right Visuals (Unified Dashboard) */}
               <motion.div transition={{ duration: 1, ease: 'easeIn' }} whileInView={{ opacity: 1, x: 0 }} initial={{ x: 80, opacity: 0 }} viewport={{ once: true }} className="relative w-full h-[600px] hidden lg:block perspective-1000">
                  {/* Main Interface Card */}
                  <div className="absolute top-10 right-0 w-[500px] h-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700 p-6 z-10">
                     {/* Header */}
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <ScanLine className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <div className="font-bold text-foreground">Kitchen Overview</div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Inventory Status</div>
                           </div>
                        </div>
                        <div className="px-3 py-1 bg-primary/10 text-primary-dark text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-widest">Score: 92/100</div>
                     </div>

                     {/* Stats Row */}
                     <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <div className="text-2xl font-bold text-foreground mb-1">3</div>
                           <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Expires Soon</div>
                           <div className="text-[10px] text-foreground font-medium">Tomatoes, Milk, Bread</div>
                        </div>
                        <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <div className="text-2xl font-bold text-foreground mb-1">1,850</div>
                           <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Kcal Today</div>
                           <div className="text-[10px] text-foreground font-medium">On Target</div>
                        </div>
                     </div>

                     {/* AI Recommendation */}
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft border border-gray-100">🥘</div>
                        <div>
                           <div className="text-[10px] font-bold text-primary-dark mb-0.5 uppercase tracking-wider">Recommended Dinner</div>
                           <div className="font-bold text-foreground text-sm">Roasted Tomato Soup</div>
                           <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Uses expiring tomatoes • Low Calorie</div>
                        </div>
                     </div>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute top-1/2 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-100 z-20">
                     <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                        <Leaf className="w-6 h-6 text-black" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-foreground uppercase tracking-tight">Waste Prevented</div>
                        <div className="text-[10px] font-bold text-primary-dark">1.2kg saved this week</div>
                     </div>
                  </div>

                  <div className="absolute bottom-1/4 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-300 z-20">
                     <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <ChefHat className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-foreground uppercase tracking-tight">New Recipe Unlocked</div>
                        <div className="text-[10px] font-bold text-primary-dark">Based on your pantry</div>
                     </div>
                  </div>

               </motion.div>
            </div>
         </div>
      </section>
   );
}
