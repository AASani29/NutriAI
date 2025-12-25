export default function ImpactSection() {
    const stats = [
      {
        number: '2M+',
        label: 'Meals Tracked',
        unit: 'across our community',
      },
      {
        number: '450K',
        label: 'Food Waste Prevented',
        unit: 'kilos this year',
      },
      {
        number: '75K',
        label: 'Active Users',
        unit: 'making a difference',
      },
      {
        number: '12K',
        label: 'Communities',
        unit: 'working together',
      },
    ]
  
    return (
      <section id="impact" className="relative py-20 md:py-32 bg-gradient-to-r from-primary/10 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
  
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance mb-4">
              Real Impact, Real Numbers
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              See the collective power of mindful consumption and sustainable practices.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-foreground/60">
                  {stat.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }