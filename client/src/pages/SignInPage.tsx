import { SignIn } from '@clerk/clerk-react'
import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">NutriTrack</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-foreground/70">Sign in to continue your sustainable journey</p>
        </div>
        
        <SignIn 
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card shadow-xl rounded-2xl border border-border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-foreground/70",
              socialButtonsBlockButton: "bg-card border border-border text-foreground hover:bg-secondary/10",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              formFieldInput: "bg-background border-border text-foreground focus:border-primary focus:ring-primary",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-foreground",
              identityPreviewEditButtonIcon: "text-foreground/70",
              formHeaderTitle: "text-foreground",
              formHeaderSubtitle: "text-foreground/70",
              otpCodeFieldInput: "border-border text-foreground",
              formResendCodeLink: "text-primary hover:text-primary/80",
              footer: "hidden", // Hide default footer
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
            variables: {
              colorPrimary: "#16803C",
              colorBackground: "#ffffff",
              colorInputBackground: "#fafafa",
              colorInputText: "#262626",
              borderRadius: "0.625rem",
            }
          }}
        />
        
        <p className="text-center mt-6 text-sm text-foreground/60">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary hover:text-primary/80 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}