import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className=" border-t border-border pt-16 pb-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center group">
              <div className="h-12 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <img src="/colored-logo.png" alt="NutriAI Logo" className="h-full w-auto object-contain" />
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium">
              The intelligent operating system for your kitchen. Manage inventory, optimize nutrition, and minimize waste—all in one place.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-primary-dark hover:bg-primary/20 hover:border-primary/30 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-primary-dark hover:bg-primary/20 hover:border-primary/30 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-primary-dark hover:bg-primary/20 hover:border-primary/30 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-8">Product</h3>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/features" className="hover:text-secondary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-secondary transition-colors">Pricing</Link></li>
              <li><Link to="/integrations" className="hover:text-secondary transition-colors">Integrations</Link></li>
              <li><Link to="/enterprise" className="hover:text-secondary transition-colors">Enterprise</Link></li>
              <li><Link to="/roadmap" className="hover:text-secondary transition-colors">Product Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-8">Resources</h3>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/blog" className="hover:text-secondary transition-colors">Blog</Link></li>
              <li><Link to="/recipes" className="hover:text-secondary transition-colors">Recipe Database</Link></li>
              <li><Link to="/nutrition-guides" className="hover:text-secondary transition-colors">Nutrition Guides</Link></li>
              <li><Link to="/community" className="hover:text-secondary transition-colors">Community Hub</Link></li>
              <li><Link to="/help" className="hover:text-secondary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-8">Contact</h3>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>House 45, Road 18<br />Uttara, Dhaka 1230</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@nutriai.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {currentYear} NutriAI. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-secondary transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}