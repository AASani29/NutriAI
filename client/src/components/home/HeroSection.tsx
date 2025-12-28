import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, Leaf, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="flex flex-col gap-8 relative z-10">
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                AI-Powered Sustainability
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Eat Smart. <br />
              <span className="text-primary">
                Waste Less.
              </span> <br />
              Live Better.
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              LocaNutri-Smart transforms how you manage food. Track inventory, get regional recipe recommendations, and hit your sustainability goals—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to={isSignedIn ? '/dashboard' : '/sign-in'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all duration-300 font-semibold text-lg shadow-lg shadow-primary/20"
              >
                {isSignedIn ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium text-lg"
              >
                How it Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-8 opacity-80 mix-blend-multiply">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">100%</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Data Privacy</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">SDG 12</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Responsible Consumption</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">AI</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Smart Insights</span>
              </div>
            </div>
          </div>

          {/* Right Visuals (Mock UI) */}
          <div className="relative w-full h-[600px] hidden lg:block perspective-1000">
            {/* Main Dashboard Card */}
            <div className="absolute top-10 right-0 w-[500px] h-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700 p-6 z-10">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Daily Dashboard</div>
                    <div className="text-xs text-gray-500">Today, Dec 28</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">On Track</div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Expiring Soon</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3 Items</div>
                  <div className="text-xs text-gray-500 mt-1">Use within 2 days</div>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Waste Saved</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">2.4 kg</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
              </div>

              {/* Mock Insight */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm font-medium text-gray-900 mb-2">💡 AI Insight</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You have <strong>Spinach</strong> expiring soon. Use it in a <strong>Bengali Saag Bhaji</strong> tonigh to transform waste into a delicious meal!
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/3 -left-12 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-100 z-20">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-xl">🍅</div>
              <div>
                <div className="text-xs font-bold text-gray-900">Tomatoes</div>
                <div className="text-[10px] text-red-500 font-medium">Expiring in 1 day</div>
              </div>
            </div>

            <div className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float delay-300 z-20">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🌿</div>
              <div>
                <div className="text-xs font-bold text-gray-900">Sustainability Score</div>
                <div className="text-[10px] text-primary font-medium">+15 points earned</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
