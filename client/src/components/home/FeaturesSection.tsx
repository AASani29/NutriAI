import { ScanBarcode, ChefHat, Recycle, Bell, Share2, BarChart } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
            Three powerful modules, <br />
            <span className="text-primary-dark">One seamless platform.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
            NutriAI bridges the gap between what you buy, what you eat, and how you impact the planet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Inventory (Manage) */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 transition-colors group-hover:bg-primary/20">
                  <ScanBarcode className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Smart Inventory</h3>
                <p className="text-muted-foreground mb-8 font-medium">Scan barcodes or receipts to digitize your pantry in seconds.</p>

                <div className="space-y-4 text-left bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-black mt-0.5" />
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Expiry Alerts:</strong> Get notified before food goes bad.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="w-5 h-5 text-black mt-0.5" />
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Usage Trends:</strong> See what you actually consume.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Nutrition (Nourish) - Highlighted */}
          <div className="space-y-6">
            <div className="bg-black p-8 rounded-3xl shadow-2xl shadow-black/20 transform md:-translate-y-6 hover:translate-y-[-24px] transition-all duration-500 relative overflow-hidden h-full border border-white/5">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(210,232,35,0.15),transparent_70%)]" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-12 -mb-12 blur-3xl" />

              <div className="relative z-10 text-center text-white">
                <div className="w-16 h-16 mx-auto bg-primary text-black rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Intelligent Cooking</h3>
                <p className="text-gray-300 mb-8 font-medium">Turn your inventory into personalized meals tailored to your diet.</p>

                <div className="space-y-4 text-left bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center mt-0.5 border border-primary/40">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-gray-200"><strong>Recipe Match:</strong> Suggestions based on what you have *right now*.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5 border border-white/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-sm text-gray-200"><strong>Macro Tracking:</strong> Log calories automatically as you cook.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Sustainability (Sustain) */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden group h-full">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gray-50 rounded-full -ml-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 transition-colors group-hover:bg-primary/20">
                  <Recycle className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Zero-Waste Impact</h3>
                <p className="text-muted-foreground mb-8 font-medium">Close the loop by sharing surplus and tracking your eco-footprint.</p>

                <div className="space-y-4 text-left bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <Share2 className="w-5 h-5 text-black mt-0.5" />
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Community Share:</strong> Donate excess food to neighbors.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                       <span className="material-icons-outlined text-black text-xl">emoji_events</span>
                    </div>
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Gamification:</strong> Earn badges for sustainable choices.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}