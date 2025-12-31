import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary.DEFAULT/0.1),transparent_50%)]"></div>
      
      <div className="absolute top-8 left-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src='/gajor.png' width={50} height={25} className='rounded-xl shadow-soft group-hover:scale-105 transition-transform'/>
          <span className="font-bold text-xl tracking-tighter text-foreground">NutriAI</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">Join NutriAI</h1>
          <p className="text-muted-foreground font-medium">Create your account and start your sustainable journey</p>
        </div>
        
        <SignUp 
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card shadow-soft rounded-2xl border border-border",
              headerTitle: "text-foreground font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-card border border-border text-foreground hover:bg-accent transition-all",
              socialButtonsBlockButtonText: "text-foreground font-bold",
              formButtonPrimary: "bg-primary hover:bg-primary-dark text-primary-foreground font-bold transition-all shadow-lg",
              formFieldInput: "bg-input border-border text-foreground focus:border-primary focus:ring-primary transition-all rounded-xl",
              formFieldLabel: "text-foreground font-bold px-1",
              footerActionLink: "text-primary hover:underline font-bold",
              identityPreviewText: "text-foreground font-medium",
              identityPreviewEditButtonIcon: "text-muted-foreground",
              formHeaderTitle: "text-foreground font-bold",
              formHeaderSubtitle: "text-muted-foreground",
              otpCodeFieldInput: "border-border text-foreground",
              formResendCodeLink: "text-primary hover:underline font-bold",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorInputBackground: "hsl(var(--input))",
              colorInputText: "hsl(var(--foreground))",
              borderRadius: "0.75rem",
            }
          }}
        />
        
        <p className="text-center mt-6 text-sm text-foreground/60 font-medium">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary hover:underline font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}