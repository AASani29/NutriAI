import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Utensils, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">NutriAI</span>
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm">
              The intelligent operating system for your kitchen. Manage inventory, optimize nutrition, and minimize waste—all in one place.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Product</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link to="/enterprise" className="hover:text-primary transition-colors">Enterprise</Link></li>
              <li><Link to="/roadmap" className="hover:text-primary transition-colors">Product Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Resources</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/recipes" className="hover:text-primary transition-colors">Recipe Database</Link></li>
              <li><Link to="/nutrition-guides" className="hover:text-primary transition-colors">Nutrition Guides</Link></li>
              <li><Link to="/community" className="hover:text-primary transition-colors">Community Hub</Link></li>
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>123 Innovation Drive<br />Tech City, TC 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@locanutrismart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} NutriAI Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-gray-900">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}