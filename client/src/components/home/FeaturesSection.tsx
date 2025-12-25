import { Apple, Leaf, BarChart3, Users, Zap, Target } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Smart Inventory',
    description: 'Track your food items in real-time with expiration alerts and usage history.',
    color: 'text-primary',
  },
  {
    icon: Apple,
    title: 'Health Insights',
    description: 'Monitor nutritional intake and build better eating habits for your household.',
    color: 'text-accent',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Visualize consumption patterns and identify opportunities to reduce waste.',
    color: 'text-primary',
  },
  {
    icon: Users,
    title: 'Community Sharing',
    description: 'Connect with others and share sustainable practices in your community.',
    color: 'text-accent',
  },
  {
    icon: Zap,
    title: 'Instant Logging',
    description: 'Quick and easy daily food logging with mobile-first interface.',
    color: 'text-primary',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and achieve waste reduction and nutrition goals with your team.',
    color: 'text-accent',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 bg-secondary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance mb-4">
            Powerful Features for Real Impact
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to track consumption, reduce waste, and build sustainable food habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-smooth hover:shadow-lg hover:shadow-primary/10"
              >
                <div className={`w-12 h-12 ${feature.color} mb-4 opacity-80`}>
                  <Icon className="w-full h-full" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}