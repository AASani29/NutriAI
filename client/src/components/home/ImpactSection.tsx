
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
    <section id="impact" className="relative py-24 bg-gray-900 text-white overflow-hidden">
      {/* Abstract Tech Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] -ml-20 -mb-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-primary-foreground/80 font-bold tracking-wide uppercase text-sm mb-3">Real World Impact</h2>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Good for your wallet. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Better for the planet.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Join a platform where smart kitchen management translates into tangible results for you and your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="font-semibold text-primary mb-3">{stat.label}</div>
                <p className="text-sm text-gray-400">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
