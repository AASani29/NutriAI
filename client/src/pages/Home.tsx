import Navbar from '../components/home/Navbar'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import ImpactSection from '../components/home/ImpactSection'
import CTASection from '../components/home/CTASection'
import Footer from '../components/home/Footer'

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </main>
  )
}