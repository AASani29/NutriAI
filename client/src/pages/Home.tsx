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


  let currentSections = new Map<string, number>();

  const observerOptions = {
  root: null,
  threshold: 0,
  rootMargin: '-80px 0px 0px 0px' // Trigger when section top passes the navbar
};

const handleIntersect = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    const sectionId = entry.target.id;
    
    if (entry.isIntersecting) {
      setNavTheme(sectionId === 'features' ? 'dark' : 'light');
    }
  });
};

  const observer = new IntersectionObserver(handleIntersect, observerOptions);

  const sections = ['hero', 'features', 'how-it-works', 'impact'];
  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  });

  return () => observer.disconnect();
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
