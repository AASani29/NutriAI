import { ScanBarcode, ChefHat, Recycle, Bell, Share2, BarChart } from 'lucide-react'
import { motion } from 'framer-motion'
export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Three powerful modules, <br />
            <span className="text-primary">One seamless platform.</span>
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed">
            NutriAI bridges the gap between what you buy, what you eat, and how you impact the planet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Inventory (Manage) */}
          <motion.div transition={{duration:0.5, ease:'easeIn',delay:0.2}} whileInView={{opacity:1, y:0}} initial={{y:20, opacity:0}}  viewport={{once:true}} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-lg hover:translate-y-[-10px] transition-all duration-300 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-8 -mt-8 opacity-50" />
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <ScanBarcode className="w-7 h-7 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Inventory</h3>
                <p className="text-gray-500 mb-6">Scan barcodes or receipts to digitize your pantry in seconds.</p>

                <div className="space-y-3 text-left bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-orange-500 mt-1" />
                    <span className="text-sm text-gray-600"><strong>Expiry Alerts:</strong> Get notified before food goes bad.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="w-4 h-4 text-blue-500 mt-1" />
                    <span className="text-sm text-gray-600"><strong>Usage Trends:</strong> See what you actually consume.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Nutrition (Nourish) - Highlighted */}
          <motion.div transition={{duration:0.5, ease:'easeIn',delay:0.2}} whileInView={{opacity:1, y:0}} initial={{y:-20, opacity:0}}  viewport={{once:true}} className="space-y-6">
            <div className="bg-primary p-8 rounded-3xl shadow-xl shadow-primary/20 transform md:-translate-y-4 hover:translate-y-[-20px] transition-all duration-300 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-8 -mb-8" />

              <div className="relative z-10 text-center text-white">
                <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Intelligent Cooking</h3>
                <p className="text-white/80 mb-6">Turn your inventory into personalized meals tailored to your diet.</p>

                <div className="space-y-3 text-left bg-white/10 p-4 rounded-xl border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-orange-400 mt-1" />
                    <span className="text-sm text-white/90"><strong>Recipe Match:</strong> Suggestions based on what you have *right now*.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-300 mt-1" />
                    <span className="text-sm text-white/90"><strong>Macro Tracking:</strong> Log calories automatically as you cook.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Sustainability (Sustain) */}
          <motion.div transition={{duration:0.5, ease:'easeIn', delay:0.2}} whileInView={{opacity:1, y:0}} initial={{y:20, opacity:0}}  viewport={{once:true}} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm  hover:translate-y-[-10px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group h-full">
              <div className="absolute top-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-8 -mt-8 opacity-50" />
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <Recycle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Zero-Waste Impact</h3>
                <p className="text-gray-500 mb-6">Close the loop by sharing surplus and tracking your eco-footprint.</p>

                <div className="space-y-3 text-left bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Share2 className="w-4 h-4 text-purple-500 mt-1" />
                    <span className="text-sm text-gray-600"><strong>Community Share:</strong> Donate excess food to neighbors.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 text-xs font-bold text-center leading-4 bg-yellow-400 rounded-sm mt-0.5">★</div>
                    <span className="text-sm text-gray-600"><strong>Gamification:</strong> Earn badges for sustainable choices.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}