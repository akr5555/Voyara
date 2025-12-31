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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-coral-light/95 to-peach/95 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="VOYARA" 
              className="h-10 sm:h-12 w-auto object-contain rounded-xl border-2 border-white/80 shadow-md hover:scale-105 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 bg-white/50 p-1"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = link.isRoute && location.pathname === link.href;
              return link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 text-slate-700 hover:bg-white/50"
                >
                  {link.label}
                </a>
              );
            })}
            {user && (
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/profile"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-white/30 animate-pulse rounded-full" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-800 truncate max-w-[150px]">
                    {displayName}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm font-medium gap-2 hover:bg-white/50 text-slate-700"
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
                    className="text-sm font-medium text-slate-700 hover:bg-white/50 px-5 py-2 rounded-full"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full px-6 py-2 shadow-md">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-800"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = link.isRoute && location.pathname === link.href;
                return link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                        : "text-slate-700 hover:bg-white/50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors text-slate-700 hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-lg">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-800">
                        {displayName}
                      </span>
                    </div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start gap-2 ${
                          location.pathname === "/profile"
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
                            : "text-slate-700 hover:bg-white/50"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 text-slate-700 hover:bg-white/50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-white/50">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full">
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
