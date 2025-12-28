import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-primary rounded-3xl p-12 md:p-20 text-center text-white overflow-hidden shadow-2xl shadow-primary/20">

          {/* Background decoration - using simple opacities on white for 'light' effects over primary */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-[80px] -mr-20 -mt-20 opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent rounded-full blur-[60px] -ml-10 -mb-10 opacity-20"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white/90">Join 10,000+ Eco-Conscious Kitchens</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              {isSignedIn ? 'Your Dashboard Awaits' : 'Start Your Zero-Waste Journey'}
            </h2>

            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              {isSignedIn
                ? 'Continue tracking your impact and discovering delicious regional recipes.'
                : 'Free for households. Powerful tools to track food, save money, and help the planet.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isSignedIn ? '/dashboard' : '/sign-in'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-lg"
              >
                {isSignedIn ? 'Go to Dashboard' : 'Create Free Account'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isSignedIn && (
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary border border-white/30 text-white rounded-xl hover:bg-primary/90 transition-all font-semibold text-lg backdrop-blur-sm"
                >
                  See Features
                </a>
              )}
            </div>

            {!isSignedIn && (
              <p className="mt-6 text-sm text-white/70">
                No credit card required · Free forever plan available
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
