import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Explore", href: "#explore" },
    { label: "My Trip", href: "#trips" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-coral-light/95 to-peach/95 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">
              VOYARA
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  link.label === "Home"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-800 hover:bg-white/50"
                }`}
              >
                {link.label}
              </a>
            ))}
            {user && (
              <a
                href="#profile"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-800 hover:bg-white/50 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </a>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-white/30 animate-pulse rounded-full" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full">
                  <User className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm font-medium gap-2 hover:bg-white/50 text-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    className="text-sm font-medium text-gray-800 hover:bg-white/50 px-5 py-2 rounded-full"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 shadow-md">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-900"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    link.label === "Home"
                      ? "bg-white text-gray-900"
                      : "text-gray-800 hover:bg-white/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-lg">
                      <User className="w-4 h-4 text-gray-700" />
                      <span className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 text-gray-800 hover:bg-white/50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-800 hover:bg-white/50">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
