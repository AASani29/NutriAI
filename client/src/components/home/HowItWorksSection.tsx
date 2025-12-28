import { Scan, ClipboardList, ChefHat, HeartHandshake } from 'lucide-react';

const steps = [
  {
    icon: Scan,
    title: 'Scan & Log',
    description: 'Snap a receipt or scan a barcode. Our AI instantly catalogues your groceries.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: ClipboardList,
    title: 'Track Inventory',
    description: 'Get notified before food expires. Visualized pantry management made easy.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: ChefHat,
    title: 'Cook Smart',
    description: 'Discover regional recipes based on what you already have in your kitchen.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: HeartHandshake,
    title: 'Share & Impact',
    description: 'Share surplus food with neighbors and track your waste reduction score.',
    color: 'bg-purple-100 text-purple-600'
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Simple Workflow. Big Impact.</h2>
            <p className="text-gray-500">From grocery bag to dinner table, we streamline every step.</p>
          </div>
          <div className="hidden md:block h-px w-full bg-gray-100 flex-1 mx-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-400">0{index + 1}</span> {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
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