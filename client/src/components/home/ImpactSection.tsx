
import { TrendingDown, Wallet, Users, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
export default function ImpactSection() {
  const stats = [
    {
      icon: TrendingDown,
      number: '30%',
      label: 'Less Food Waste',
      description: 'Average reduction per household',
      xpos: -60,
      delay: 0,
    },
    {
      icon: Wallet,
      number: '$1,200',
      label: 'Annual Savings',
      description: 'Saved on grocery bills/year',
      xpos: -60,
      delay: 0.4,
    },
    {
      icon: LayoutDashboard,
      number: '150+',
      label: 'Recipes & Items',
      description: 'Managed effortlessly per user',
      xpos: -60,
      delay: 0.7,
    },
    {
      icon: Users,
      number: '50k+',
      label: 'Requests Shared',
      description: 'Community food listings claimed',
      xpos: -60,
      delay: 1,
    },
  ]

  return (
    <section id="impact" className="relative py-24 bg-black text-white overflow-hidden">
      {/* Abstract Tech Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[140px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-dark rounded-full blur-[120px] -ml-20 -mb-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            <motion.span transition={{duration:0.6, ease:'easeIn',}} whileInView={{opacity:1, x:0}} initial={{x:-20, opacity:0}}  viewport={{once:true}} className='block'>
              Good for your wallet. <br />
            </motion.span>
            <motion.span transition={{duration:0.6, ease:'easeIn'}} whileInView={{opacity:1, x:0}} initial={{x:20, opacity:0}}  viewport={{once:true}} className="block ml-16 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Better for the planet.
            </motion.span>
          </h2>
          <motion.p transition={{duration:0.6, ease:'easeIn'}} whileInView={{opacity:1, y:0}} initial={{y:20, opacity:0}}  viewport={{once:true}} className="block text-gray-400 text-lg">
            Join a platform where smart nutrition management translates into tangible results for you and your community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            // Update currency in display
            const displayValue = stat.label === 'Annual Savings' ? '৳12,000' : stat.number;
            
            return (
              <motion.div transition={{ duration: 0.5, ease: 'easeIn', delay: stat.delay }} whileInView={{ opacity: 1, x: 0 }} initial={{ x: stat.xpos, opacity: 0 }} viewport={{ once: true }} key={index} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="font-semibold text-primary mb-3">{stat.label}</div>
                <p className="text-sm text-gray-400">{stat.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
