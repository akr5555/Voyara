import { useState, useEffect } from "react";
import { Plane, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
          });
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            variant: "destructive",
            title: "Password too short",
            description: "Password must be at least 6 characters.",
          });
          setIsLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;

        console.log('🔐 Attempting signup with:', { email: formData.email, redirectUrl });

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
            },
          },
        });

        console.log('📊 Signup response:', { data, error });

        if (error) {
          console.error('❌ Signup error:', error);
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          console.log('✅ Signup successful!', data);
          
          // Check if email confirmation is required
          if (data.user && !data.session) {
            toast({
              title: "Check your email!",
              description: "We sent you a confirmation link. Please check your email to activate your account.",
            });
          } else {
            toast({
              title: "Account created!",
              description: "Welcome to VOYARA! You are now logged in.",
            });
          }
        }
      }
    } catch (error) {
      console.error('🚨 Caught error during auth:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4 py-8 sm:py-12 relative">
      {/* Back to Home Button - Top Left */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 group z-50"
      >
        <Button 
          variant="outline" 
          className="flex items-center gap-1.5 sm:gap-2 bg-white/90 hover:bg-white border-2 border-slate-200 hover:border-indigo-400 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3 sm:px-6 py-1.5 sm:py-2 h-auto text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          <Home className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors hidden sm:inline">
            Back to Home
          </span>
          <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors sm:hidden">
            Home
          </span>
        </Button>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform duration-300">
              <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {isLogin ? "VOYARA" : "Create Account"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {isLogin ? "Plan your perfect journey" : "Join VOYARA today"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground font-medium text-sm">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-10 sm:h-12 bg-secondary/50 border-border/50 focus:border-primary text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="h-10 sm:h-12 bg-secondary/50 border-border/50 focus:border-primary text-sm sm:text-base"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="h-10 sm:h-12 bg-secondary/50 border-border/50 focus:border-primary text-sm sm:text-base"
                required
                disabled={isLoading}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-10 sm:h-12 bg-secondary/50 border-border/50 focus:border-primary text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Link to="/" className="w-full sm:flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="w-full h-10 sm:h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm sm:text-base transition-all"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 h-10 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
                disabled={isLoading}
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
