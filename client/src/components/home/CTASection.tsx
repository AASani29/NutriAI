
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
        <div className="relative bg-gray-900 rounded-3xl p-12 md:p-20 text-center text-white overflow-hidden shadow-2xl shadow-gray-900/20">

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary rounded-full blur-[100px] -mr-20 -mt-20 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] -ml-10 -mb-10 opacity-20"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              {isSignedIn ? 'Ready for a smarter kitchen?' : 'Stop Managing Your Kitchen Manually'}
            </h2>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              {isSignedIn
                ? 'Check your dashboard for today’s inventory insights and meal recommendations.'
                : 'Experience the only platform that combines inventory tracking, nutrition analysis, and waste reduction in one seamless app.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isSignedIn ? '/dashboard' : '/sign-in'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-lg shadow-lg shadow-primary/25"
              >
                {isSignedIn ? 'Open Dashboard' : 'Create Free Account'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isSignedIn && (
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg backdrop-blur-sm"
                >
                  Explore Features
                </a>
              )}
            </div>

            {!isSignedIn && (
              <p className="mt-6 text-sm text-gray-400">
                No credit card required · Free 14-day trial for premium features
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
