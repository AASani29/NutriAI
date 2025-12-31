import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/home/Footer';
import HeroSection from '../components/home/HeroSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import ImpactSection from '../components/home/ImpactSection';
import Navbar from '../components/home/Navbar';

export default function Home() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <main className="w-full font-operetta font-bold">

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImpactSection />
      {/* <CTASection /> */}
      <Footer />
    </main>
  );
}
