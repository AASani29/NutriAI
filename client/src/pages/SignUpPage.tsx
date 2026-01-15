import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/foodaura2.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay to improve contrast */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Top-left brand link */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/gajor2.png" className="rounded-xl shadow-soft h-12" />
        </Link>
      </div>
      
      {/* Centered animated card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeIn' }}
        className="relative z-10 w-full max-w-xl p-4"
      >
        <SignUp 
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white shadow-lg rounded-xl p-6',
              headerTitle: 'text-foreground font-bold',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton:
                'bg-white border border-gray-100 text-foreground hover:bg-gray-50 transition-all',
              socialButtonsBlockButtonText: 'text-foreground font-bold',
              formButtonPrimary:
                'w-full h-9 bg-black hover:bg-gray-900 text-white font-bold transition-all shadow-lg rounded-md',
              formFieldInput:
                'w-full h-9 px-3 rounded-md bg-gray-50 border border-gray-100 text-foreground focus:ring-2 focus:ring-primary transition-all',
              formFieldLabel: 'text-foreground font-medium px-1',
              footerActionLink: 'text-black hover:underline font-bold',
              identityPreviewText: 'text-foreground font-medium',
              identityPreviewEditButtonIcon: 'text-muted-foreground',
              formHeaderTitle: 'text-foreground font-bold',
              formHeaderSubtitle: 'text-muted-foreground',
              otpCodeFieldInput: 'border-gray-100 text-foreground',
              formResendCodeLink: 'text-black hover:underline font-bold',
              footer: 'hidden',
            },
            layout: {
              socialButtonsPlacement: 'bottom',
              socialButtonsVariant: 'blockButton',
            },
            variables: {
              colorPrimary: '#000000',
              colorBackground: '#ffffff',
              colorInputBackground: '#f9fafb',
              colorInputText: '#000000',
              borderRadius: '0.75rem',
            }
          }}
        />
      </motion.div>
    </div>
  )
}