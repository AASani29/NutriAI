import { Leaf, Box, Brain, MapPin, Trophy, ShoppingCart } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Core Capabilities</h2>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Everything you need for a <span className="text-primary font-serif italic">sustainable</span> kitchen.
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed">
            From smart inventory tracking to AI-driven recipe suggestions, LocaNutri-Smart gives you the tools to reduce waste and eat better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px]">
          {/* Feature 1: Smart Inventory (Large) */}
          <div className="md:col-span-2 row-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="p-3 bg-primary/10 w-fit rounded-xl mb-4">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Inventory Management</h3>
                <p className="text-gray-600 max-w-md">Real-time tracking of pantry items with automatic expiration alerts. Never let food go to waste again.</p>
              </div>
            </div>
          </div>

          {/* Feature 2: AI Insights */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-8 -mb-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 bg-secondary/20 w-fit rounded-xl mb-6">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-gray-600 text-sm">Personalized recipe ideas based on what you have and what you like.</p>
            </div>
          </div>

          {/* Feature 3: Regional Discovery */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full -ml-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 bg-accent/20 w-fit rounded-xl mb-6">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Regional Cuisine</h3>
              <p className="text-gray-600 text-sm">Discover local recipes (e.g., Bangladeshi, Indian) tailored to your location.</p>
            </div>
          </div>

          {/* Feature 4: SDG Goals (Large) */}
          <div className="md:col-span-2 row-span-1 bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800/50 rounded-full -mr-20 -mt-20 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between text-white">
              <div className="p-3 bg-white/10 w-fit rounded-xl mb-4 backdrop-blur-sm">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">SDG Impact Gamification</h3>
                  <p className="text-gray-400 max-w-sm">Earn badges and score points by reducing waste and choosing sustainable options. Contribute to UNSDG 12 directly.</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-mono text-yellow-400 font-bold">Lvl 5</span> <span className="text-sm text-gray-300">Eco-Warrior</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}