import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileName(null);
        return;
      }

      try {
        console.log('Fetching profile for user:', user.id);
        const result = await (supabase as unknown as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                single: () => Promise<{ data: { full_name: string | null } | null; error: unknown }>
              }
            }
          }
        })
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        const { data } = result;
        console.log('Profile fetch result:', data);
        if (data?.full_name) {
          setProfileName(data.full_name);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
    };

    fetchUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ full_name: string }>;
      if (customEvent.detail?.full_name) {
        setProfileName(customEvent.detail.full_name);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const displayName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const navLinks = [
    { label: "Home", href: "/", isRoute: true },
    { label: "Explore", href: "#explore", isRoute: false },
    { label: "My Trip", href: "/my-trips", isRoute: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-coral-light/90 to-peach/90 backdrop-blur-xl border-b border-white/30 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img 
                src="/logo.png" 
                alt="VOYARA" 
                className="relative h-9 sm:h-11 w-auto object-contain rounded-xl border-2 border-white/80 shadow-md group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-xl transition-all duration-300 bg-white/60 p-1"
              />
            </div>
            <span className="font-display text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
              VOYARA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-white/40 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-inner">
            {navLinks.map((link) => {
              const isActive = link.isRoute && location.pathname === link.href;
              return link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-4 lg:px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                      : "text-slate-700 hover:bg-white/80 hover:shadow-md hover:scale-105"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 blur-lg opacity-50"></span>
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 lg:px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 text-slate-700 hover:bg-white/80 hover:shadow-md hover:scale-105"
                >
                  {link.label}
                </a>
              );
            })}
            {user && (
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 lg:px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  location.pathname === "/profile"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                    : "text-slate-700 hover:bg-white/80 hover:shadow-md hover:scale-105"
                }`}
              >
                {location.pathname === "/profile" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 blur-lg opacity-50"></span>
                )}
                <User className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Profile</span>
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-white/30 animate-pulse rounded-full" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md border border-white/50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-slate-800 truncate max-w-[100px] lg:max-w-[150px]">
                    {displayName}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-xs lg:text-sm font-semibold gap-2 hover:bg-white/60 text-slate-700 rounded-full px-3 lg:px-4 transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    className="text-sm font-semibold text-slate-700 hover:bg-white/60 px-4 lg:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full px-4 lg:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold text-sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={22} className="text-slate-800" />
            ) : (
              <Menu size={22} className="text-slate-800" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-4 border-t border-white/30 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.isRoute && location.pathname === link.href;
                return link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-[1.02]"
                        : "text-slate-700 hover:bg-white/70 backdrop-blur-sm active:scale-95"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 blur-md opacity-50"></span>
                    )}
                    <span className="relative flex items-center gap-2">
                      {link.label}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    </span>
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 text-slate-700 hover:bg-white/70 backdrop-blur-sm active:scale-95"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              
              <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-2"></div>
              
              <div className="flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-white/50">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate flex-1">
                        {displayName}
                      </span>
                    </div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start gap-3 rounded-2xl py-6 transition-all duration-300 ${
                          location.pathname === "/profile"
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                            : "text-slate-700 hover:bg-white/70 backdrop-blur-sm active:scale-95"
                        }`}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-semibold">Profile</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 text-slate-700 hover:bg-white/70 backdrop-blur-sm rounded-2xl py-6 active:scale-95 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-semibold">Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-center text-slate-700 hover:bg-white/70 backdrop-blur-sm rounded-2xl py-6 font-semibold transition-all duration-300 active:scale-95">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl py-6 font-semibold transition-all duration-300 active:scale-95">
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
