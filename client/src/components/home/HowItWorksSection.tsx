import { ScanBarcode, Utensils, Share2, BarChart } from 'lucide-react';
import {motion} from 'framer-motion'
const steps = [
  {
    icon: ScanBarcode,
    title: '1. Scan & Digitize',
    description: 'Instantly add groceries to your digital pantry using our barcode scanner or receipt upload.',
    color: 'bg-gray-100 text-gray-900',
    hoverIconcolor:'group-hover:bg-purple-100 group-hover:text-red-500'
  },
  {
    icon: Utensils,
    title: '2. Cook Smart',
    description: 'Get AI recipe suggestions based on what you have and what expires soon.',
    color: 'bg-primary/10 text-primary',
    hoverIconcolor:'group-hover:bg-purple-100 group-hover:text-red-500'
  },
  {
    icon: Share2,
    title: '3. Share Surplus',
    description: 'Don\'t throw it away! Share excess ingredients with your local community.',
    color: 'bg-orange-50 text-orange-600', 
    hoverIconcolor:'group-hover:bg-purple-100 group-hover:text-red-500'
  },
  {
    icon: BarChart,
    title: '4. Track Impact',
    description: 'Visualize your waste reduction and nutrition improvements over time.',
    color: 'bg-blue-50 text-blue-600',
    hoverIconcolor:'group-hover:bg-purple-100 group-hover:text-red-500'
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">A Complete Food Lifecycle</h2>
            <p className="text-gray-500">Stop managing specific parts of your kitchen in isolation. Connect them all.</p>
          </div>
          {/* Timeline Line */}
          <div className="hidden md:block h-1 w-full bg-gray-100 flex-1 mx-8 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="group flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100
                 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl
          ${step.color}
          ${step.hoverIconcolor}
          flex items-center justify-center
          transition-all duration-300
          group-hover:scale-110`}
                >
                  {/* Icon Motion */}
                  <motion.div
                    variants={{
                      rest: { x: 0, opacity: 1 },
                      hover: { x: 4, opacity: 1 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}