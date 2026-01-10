import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  
  // Use coral/peach theme for landing page, blue theme for other pages
  const isLandingPage = location.pathname === '/';
  const footerBgClass = isLandingPage
    ? "bg-gradient-to-r from-coral-light/95 to-peach/95"
    : "bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50";

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Destinations", href: "#destinations" },
    { label: "Trips", href: "#trips" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const destinations = [
    "Bali, Indonesia",
    "Paris, France",
    "Tokyo, Japan",
    "Santorini, Greece",
    "New York, USA",
  ];

  return (
    <footer id="about" className={`relative overflow-hidden pt-12 sm:pt-16 pb-6 sm:pb-8 ${footerBgClass} backdrop-blur-sm`}>

      {/* Diagonal geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(to bottom right, rgba(232, 165, 135, 0.5) 0%, rgba(244, 196, 180, 0.2) 50%, transparent 70%)',
            clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)',
          }}
        />
        <div className="absolute bottom-0 right-0 w-full h-full"
          style={{
            background: 'linear-gradient(to top left, rgba(205, 180, 160, 0.4) 0%, rgba(220, 200, 180, 0.2) 50%, transparent 70%)',
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">VOYARA</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your Personal AI Assistant for unforgettable travel experiences.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 text-gray-800"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 text-gray-800"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 text-gray-800"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-gray-700 hover:text-gray-900 hover:underline transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">Top Destinations</h4>
            <ul className="space-y-2 sm:space-y-3">
              {destinations.map((dest) => (
                <li key={dest}>
                  <a 
                    href="#destinations"
                    className="text-gray-700 hover:text-gray-900 hover:underline transition-colors duration-200 text-sm"
                  >
                    {dest}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">Stay Updated</h4>
            <p className="text-gray-700 text-sm">
              Subscribe for exclusive deals and travel inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-full text-sm"
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 shadow-md text-sm">
                Join
              </Button>
            </div>
            <div className="space-y-2 pt-2 sm:pt-4">
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Mail className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <span className="truncate">hello@voyara.travel</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Phone className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <MapPin className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/20 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-gray-700 text-xs sm:text-sm text-center md:text-left">
            © 2025 VOYARA. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-700 text-xs sm:text-sm">
            <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
