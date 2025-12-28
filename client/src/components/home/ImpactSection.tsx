import { TrendingDown, Users, Globe2, Leaf } from 'lucide-react';

export default function ImpactSection() {
  const stats = [
    {
      icon: TrendingDown,
      number: '450K kg',
      label: 'Food Saved',
      description: 'Prevented from entering landfills this year.'
    },
    {
      icon: Users,
      number: '12,000+',
      label: 'Active Users',
      description: 'Households managing better kitchens.'
    },
    {
      icon: Globe2,
      number: '145',
      label: 'Communities',
      description: 'Sharing food locally across regions.'
    },
    {
      icon: Leaf,
      number: '2M+',
      label: 'SDG Points',
      description: 'Collective contribution to Goal 12.'
    },
  ]

  return (
    <section id="impact" className="relative py-24 bg-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')]"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-green-500 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-green-400 font-bold tracking-wide uppercase text-sm mb-3">Our Collective Impact</h2>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Small actions, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">measurable change.</span>
            </h2>
          </div>
          <p className="text-gray-400 max-w-md text-lg">
            Join a growing movement of conscious consumers making a real difference for the planet, one meal at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="font-semibold text-gray-200 mb-2">{stat.label}</div>
                <p className="text-sm text-gray-400">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}