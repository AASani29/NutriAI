
import { TrendingDown, Wallet, Users, LayoutDashboard } from 'lucide-react';

export default function ImpactSection() {
  const stats = [
    {
      icon: TrendingDown,
      number: '30%',
      label: 'Less Food Waste',
      description: 'Average reduction per household'
    },
    {
      icon: Wallet,
      number: '$1,200',
      label: 'Annual Savings',
      description: 'Saved on grocery bills/year'
    },
    {
      icon: LayoutDashboard,
      number: '150+',
      label: 'Recipes & Items',
      description: 'Managed effortlessly per user'
    },
    {
      icon: Users,
      number: '50k+',
      label: 'Requests Shared',
      description: 'Community food listings claimed'
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
          <h2 className="text-primary font-black tracking-widest uppercase text-xs mb-4">Real World Impact</h2>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
            Good for your wallet. <br />
            <span className="text-primary">Better for the planet.</span>
          </h2>
          <p className="text-gray-400 text-xl font-medium">
            Join a platform where smart kitchen management translates into tangible results for you and your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            // Update currency in display
            const displayValue = stat.label === 'Annual Savings' ? '৳12,000' : stat.number;
            
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:translate-y-[-8px]">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 transition-colors hover:bg-primary/20 hover:border-primary/30">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-black mb-3 text-white tracking-tight">{displayValue}</div>
                <div className="font-bold text-primary mb-4 uppercase tracking-widest text-xs">{stat.label}</div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
