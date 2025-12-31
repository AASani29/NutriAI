import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,232,35,0.1),transparent_50%)]"></div>
      <div className="absolute top-6 left-6 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src='/gajor.png' width={50} height={25} className='rounded-xl shadow-soft'/>
          <span className="font-bold text-lg text-foreground hidden sm:inline">NutriAI</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your sustainable journey</p>
        </div>
        
        <SignIn 
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white shadow-soft rounded-2xl border border-gray-100",
              headerTitle: "text-foreground font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-white border border-gray-100 text-foreground hover:bg-gray-50 transition-all",
              socialButtonsBlockButtonText: "text-foreground font-bold",
              formButtonPrimary: "bg-black hover:bg-gray-900 text-white font-bold transition-all shadow-lg",
              formFieldInput: "bg-gray-50 border-gray-100 text-foreground focus:border-primary focus:ring-primary transition-all rounded-xl",
              formFieldLabel: "text-foreground font-bold px-1",
              footerActionLink: "text-black hover:underline font-bold",
              identityPreviewText: "text-foreground font-medium",
              identityPreviewEditButtonIcon: "text-muted-foreground",
              formHeaderTitle: "text-foreground font-bold",
              formHeaderSubtitle: "text-muted-foreground",
              otpCodeFieldInput: "border-gray-100 text-foreground",
              formResendCodeLink: "text-black hover:underline font-bold",
              footer: "hidden", // Hide default footer
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
            variables: {
              colorPrimary: "#000000",
              colorBackground: "#ffffff",
              colorInputBackground: "#f9fafb",
              colorInputText: "#000000",
              borderRadius: "0.75rem",
            }
          }}
        />
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-black hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}