import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
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
  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

useEffect(() => {
  const handleScroll = () => {
    const sections = ['hero', 'features', 'how-it-works', 'impact'];
    const navbarHeight = 80;
    
    // Find which section is currently at the top
    for (const id of sections) {
      const element = document.getElementById(id);
      if (!element) {
        console.log(`Section ${id} not found`);
        continue;
      }
      
      const rect = element.getBoundingClientRect();
      
      console.log(`${id}: top=${rect.top}, bottom=${rect.bottom}`);
      
      // Check if this section is at or past the navbar
      if (rect.top <= navbarHeight && rect.bottom > navbarHeight) {
        const newTheme = id === 'features' ? 'dark' : 'light';
        console.log(`Setting theme to ${newTheme} for section ${id}`);
        setNavTheme(newTheme);
        break;
      }
    }
  };

  handleScroll(); // Initial check
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  return (
    <main className="w-full">

      <Navbar theme={navTheme} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImpactSection />
      {/* <CTASection /> */}
      <Footer />
    </main>
  );
}
