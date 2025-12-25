const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Set up your household or community profile with dietary preferences and goals.',
    },
    {
      number: '02',
      title: 'Log Your Food',
      description: 'Easily add items to your inventory as you shop or consume food.',
    },
    {
      number: '03',
      title: 'Track & Reduce',
      description: 'Monitor consumption patterns and get insights to reduce waste.',
    },
    {
      number: '04',
      title: 'Make Impact',
      description: 'Achieve your goals and contribute to a more sustainable future.',
    },
  ]
  
  export default function HowItWorksSection() {
    return (
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance mb-4">
              How It Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Get started in four simple steps and begin your journey to sustainable food management.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{step.number}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute left-20 top-7 w-[calc(100%+1rem)] h-0.5 bg-border" />
                    )}
                  </div>
  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }