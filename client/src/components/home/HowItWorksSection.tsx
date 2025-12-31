import { ScanBarcode, Utensils, Share2, BarChart } from 'lucide-react';

const steps = [
  {
    icon: ScanBarcode,
    title: '1. Scan & Digitize',
    description: 'Instantly add groceries to your digital pantry using our barcode scanner or receipt upload.',
    color: 'bg-gray-50 border-gray-100 text-black shadow-sm'
  },
  {
    icon: Utensils,
    title: '2. Cook Smart',
    description: 'Get AI recipe suggestions based on what you have and what expires soon.',
    color: 'bg-primary/20 border-primary/30 text-black shadow-lg shadow-primary/10'
  },
  {
    icon: Share2,
    title: '3. Share Surplus',
    description: 'Don\'t throw it away! Share excess ingredients with your local community.',
    color: 'bg-gray-50 border-gray-100 text-black shadow-sm'
  },
  {
    icon: BarChart,
    title: '4. Track Impact',
    description: 'Visualize your waste reduction and nutrition improvements over time.',
    color: 'bg-primary/20 border-primary/30 text-black shadow-lg shadow-primary/10'
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight uppercase">A Complete Food Lifecycle</h2>
            <p className="text-muted-foreground font-medium">Stop managing specific parts of your kitchen in isolation. Connect them all.</p>
          </div>
          {/* Timeline Line */}
          <div className="hidden md:block h-2 w-full bg-gray-50 flex-1 mx-8 rounded-full border border-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col gap-6 p-8 rounded-3xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500 group relative">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center border shadow-sm transform group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-foreground mb-3 flex items-center gap-2 text-xl tracking-tight uppercase">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}