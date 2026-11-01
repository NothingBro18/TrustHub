import { Link } from 'react-router-dom';
import { Shield, MapPin, Mail, Phone, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">TrustHub</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Find trusted, verified local service providers in your neighborhood. 
              Safe, accountable, and transparent digital trust records for peace of mind.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Belagavi, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>support@trusthub.local</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services?category=Home+Services" className="hover:text-blue-400 transition-colors">
                  Home Cleaning & Repairs
                </Link>
              </li>
              <li>
                <Link to="/services?category=Tech+Services" className="hover:text-blue-400 transition-colors">
                  Laptop & Mobile Repair
                </Link>
              </li>
              <li>
                <Link to="/services?category=Vehicle+Services" className="hover:text-blue-400 transition-colors">
                  Vehicle Servicing
                </Link>
              </li>
              <li>
                <Link to="/services?category=Student+Services" className="hover:text-blue-400 transition-colors">
                  Tuition & Student Care
                </Link>
              </li>
              <li>
                <Link to="/services?category=Creative+Services" className="hover:text-blue-400 transition-colors">
                  Creative & Freelance
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-400 transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <a href="#trust-score" className="hover:text-blue-400 transition-colors">
                  Trust Score System
                </a>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Verified Providers
                </Link>
              </li>
              <li>
                <a href="#security" className="hover:text-blue-400 transition-colors">
                  Safety Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Trust & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Identity Verification
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Community Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Report Activity
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TrustHub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for safer local communities with{' '}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> SUJAL CHOUGALE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
