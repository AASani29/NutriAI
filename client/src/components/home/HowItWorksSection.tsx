import { ScanBarcode, Utensils, Share2, BarChart } from 'lucide-react';
import { motion } from 'framer-motion'
const steps = [
  {
    icon: ScanBarcode,
    title: '1. Scan & Digitize',
    description: 'Instantly add groceries to your digital pantry using our barcode scanner or receipt upload.',
    color: 'bg-background text-foreground',
    hoverIconcolor: 'group-hover:bg-primary/20 group-hover:text-primary-dark',
    ypos: 10,
    delay: 0,
  },
  {
    icon: Utensils,
    title: '2. Cook Smart',
    description: 'Get AI recipe suggestions based on what you have and what expires soon.',
    color: 'bg-primary/10 text-primary-dark',
    hoverIconcolor: 'group-hover:bg-primary/20 group-hover:text-primary-dark',
    ypos: 10,
    delay: 0.4,
  },
  {
    icon: Share2,
    title: '3. Share Surplus',
    description: 'Don\'t throw it away! Share excess ingredients with your local community.',
    color: 'bg-secondary/10 text-secondary',
    hoverIconcolor: 'group-hover:bg-secondary/20 group-hover:text-secondary-dark',
    ypos: 10,
    delay: 0.7,
  },
  {
    icon: BarChart,
    title: '4. Track Impact',
    description: 'Visualize your waste reduction and nutrition improvements over time.',
    color: 'bg-muted text-muted-foreground',
    hoverIconcolor: 'group-hover:bg-primary/10 group-hover:text-primary',
    ypos: 10,
    delay: 1,
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-40 bg-[url('/hehe.jpeg')] bg-cover bg-fixed">
      {/* Overlay to ensure text readability and theme tint */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 mix-blend-overlay"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-display font-bold text-white mb-2">A Complete Food Lifecycle</h2>
            <p className="text-gray-100 font-medium">Stop managing specific parts of your kitchen in isolation. Connect them all.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                initial={{ y: step.ypos, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut', delay: step.delay }}
                viewport={{ once: true }}
                className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl duration-300"
              >

                {/* Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl
          ${step.color}
          ${step.hoverIconcolor}
          flex items-center justify-center duration-300
          group-hover:scale-110`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-sm">
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