import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Users, DollarSign, Sparkles, Check, ChevronsUpDown, Search, ChevronDown, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VegaAI from "@/components/VegaAI";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Countries data with flags and cities
const countriesData = [
  { 
    name: "France", 
    code: "FR", 
    flag: "🇫🇷",
    cities: ["Paris", "Lyon", "Marseille", "Nice", "Toulouse", "Bordeaux", "Strasbourg", "Cannes"]
  },
  { 
    name: "United States", 
    code: "US", 
    flag: "🇺🇸",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Miami", "Las Vegas"]
  },
  { 
    name: "Italy", 
    code: "IT", 
    flag: "🇮🇹",
    cities: ["Rome", "Milan", "Venice", "Florence", "Naples", "Turin", "Bologna", "Verona"]
  },
  { 
    name: "Spain", 
    code: "ES", 
    flag: "🇪🇸",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Malaga", "Granada", "Ibiza"]
  },
  { 
    name: "United Kingdom", 
    code: "GB", 
    flag: "🇬🇧",
    cities: ["London", "Manchester", "Edinburgh", "Birmingham", "Liverpool", "Bristol", "Oxford", "Cambridge"]
  },
  { 
    name: "Germany", 
    code: "DE", 
    flag: "🇩🇪",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dresden", "Heidelberg"]
  },
  { 
    name: "Japan", 
    code: "JP", 
    flag: "🇯🇵",
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Hiroshima", "Nagoya", "Sapporo", "Fukuoka"]
  },
  { 
    name: "Greece", 
    code: "GR", 
    flag: "🇬🇷",
    cities: ["Athens", "Santorini", "Mykonos", "Thessaloniki", "Crete", "Rhodes", "Corfu", "Delphi"]
  },
  { 
    name: "Thailand", 
    code: "TH", 
    flag: "🇹🇭",
    cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Krabi", "Koh Samui", "Ayutthaya", "Hua Hin"]
  },
  { 
    name: "Australia", 
    code: "AU", 
    flag: "🇦🇺",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Cairns", "Darwin"]
  },
  { 
    name: "Canada", 
    code: "CA", 
    flag: "🇨🇦",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Quebec City", "Winnipeg", "Victoria"]
  },
  { 
    name: "India", 
    code: "IN", 
    flag: "🇮🇳",
    cities: ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Jaipur", "Goa", "Agra"]
  },
  { 
    name: "Netherlands", 
    code: "NL", 
    flag: "🇳🇱",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Leiden", "Delft"]
  },
  { 
    name: "Switzerland", 
    code: "CH", 
    flag: "🇨🇭",
    cities: ["Zurich", "Geneva", "Bern", "Lucerne", "Interlaken", "Zermatt", "Lausanne", "Basel"]
  },
  { 
    name: "Portugal", 
    code: "PT", 
    flag: "🇵🇹",
    cities: ["Lisbon", "Porto", "Faro", "Coimbra", "Sintra", "Algarve", "Madeira", "Azores"]
  }
];

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  destination?: string | null;
  adults?: number | null;
  kids?: number | null;
  budget?: number | null;
  preferences?: string[] | null;
}

const DayPlanner = () => {
  const { tripId, dayNumber } = useParams<{ tripId: string; dayNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("Afternoon");
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  const [budget, setBudget] = useState(0);
  const [totalBudget, setTotalBudget] = useState(15000);
  const [preferences, setPreferences] = useState<string[]>(["Food", "Walking"]);
  const [showVega, setShowVega] = useState(false);
  const [newPreference, setNewPreference] = useState("");
  const [isVegaChatExpanded, setIsVegaChatExpanded] = useState(true);
  const [showAddPreference, setShowAddPreference] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [vegaActivities, setVegaActivities] = useState<any[]>([]);
  const [vegaLoading, setVegaLoading] = useState(false);
  const [vegaError, setVegaError] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [customCountryMode, setCustomCountryMode] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [addedActivities, setAddedActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single() as { data: Trip | null; error: Error | null };

        if (error) throw error;
        
        if (data) {
          setTrip(data);
          
          // Extract city and country from destination if available
          if (data.destination) {
            const parts = data.destination.split(',');
            setSelectedCity(parts[0]?.trim() || '');
            setSelectedCountry(parts[1]?.trim() || '');
          }
          
          setAdults(data.adults || 0);
          setKids(data.kids || 0);
          setTotalBudget(data.budget || 15000);
          
          // Load preferences if available
          if ((data as any).preferences && Array.isArray((data as any).preferences)) {
            setPreferences((data as any).preferences);
          }
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load trip details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, toast]);

  // Update available cities when country changes
  useEffect(() => {
    const country = countriesData.find(c => c.name === selectedCountry);
    if (country) {
      setAvailableCities(country.cities);
      setCustomCountryMode(false);
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry]);

  // Auto-save trip updates
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (trip && tripId) {
        saveTripUpdates();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [selectedCity, selectedCountry, adults, kids, totalBudget]);

  const saveTripUpdates = async () => {
    if (!tripId || isSaving) return;

    try {
      setIsSaving(true);

      const updateData = {
        destination: `${selectedCity}, ${selectedCountry}`.trim(),
        budget: totalBudget,
        updated_at: new Date().toISOString()
      };

      const { error } = await (supabase as any)
        .from('trips')
        .update(updateData)
        .eq('id', tripId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving trip updates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDays = () => {
    if (!trip) return 0;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const togglePreference = async (pref: string) => {
    const newPrefs = preferences.includes(pref) 
      ? preferences.filter(p => p !== pref)
      : [...preferences, pref];
    
    setPreferences(newPrefs);
    await savePreferences(newPrefs);
  };

  const addCustomPreference = async () => {
    if (!newPreference.trim()) return;
    
    const newPrefs = [...preferences, newPreference.trim()];
    setPreferences(newPrefs);
    await savePreferences(newPrefs);
    setNewPreference("");
    setShowAddPreference(false);
  };

  const savePreferences = async (prefs: string[]) => {
    if (!tripId) return;

    try {
      const { error } = await (supabase as any)
        .from('trips')
        .update({ 
          preferences: prefs,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const addActivityToPlan = (activity: any) => {
    // Check if already added
    const alreadyAdded = addedActivities.some(
      (a) => (a.title || a.name) === (activity.title || activity.name)
    );

    if (alreadyAdded) {
      toast({
        title: "Already Added",
        description: "This activity is already in your plan.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total price based on adults and children
    const adultPrice = activity.estimated_price_adult || 0;
    const childPrice = activity.estimated_price_child || 0;
    const totalPrice = (adults * adultPrice) + (kids * childPrice);
    
    // Add calculated price to activity object
    const activityWithPrice = {
      ...activity,
      calculatedTotalPrice: totalPrice,
    };

    setAddedActivities([...addedActivities, activityWithPrice]);
    
    // Update budget
    setBudget(budget + totalPrice);
    
    toast({
      title: "Added to Plan!",
      description: `${activity.title || activity.name} added to your trip plan.`,
    });
  };

  const removeActivityFromPlan = (index: number) => {
    const removedActivity = addedActivities[index];
    const activityPrice = removedActivity.calculatedTotalPrice || 0;
    
    setAddedActivities(addedActivities.filter((_, i) => i !== index));
    setBudget(Math.max(0, budget - activityPrice));
    
    toast({
      title: "Removed",
      description: "Activity removed from your plan.",
    });
  };

  const fetchVegaSuggestions = async () => {
    if (!tripId || !selectedCity || !selectedCountry) {
      toast({
        title: "Missing Information",
        description: "Please select a city and country first.",
        variant: "destructive",
      });
      return;
    }

    console.log('🤖 Fetching Vega AI suggestions...');
    setVegaLoading(true);
    setVegaError(null);

    const requestBody = {
      trip_id: tripId,
      city: selectedCity,
      country: selectedCountry,
      day: parseInt(dayNumber || '1'),
      time_slot: selectedTimeOfDay,
      total_budget: totalBudget,
      remaining_budget: totalBudget - budget,
      preferences: preferences,
      adults: adults,
      children: kids,
    };

    console.log('📤 Request body:', requestBody);

    try {
      const response = await fetch('https://vegaai-auhl.onrender.com/api/ai/vega/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Vega AI response:', JSON.stringify(data, null, 2));
      console.log('📋 Response type:', typeof data);
      console.log('📋 Is Array?:', Array.isArray(data));
      console.log('📋 Response keys:', Object.keys(data));
      
      // Handle different response formats
      let activities = [];
      
      // Check if response is directly an array
      if (Array.isArray(data)) {
        activities = data;
        console.log('📋 Response is array, using directly');
      } else if (data.activities) {
        activities = data.activities;
        console.log('📋 Found activities in data.activities');
      } else if (data.suggestions) {
        activities = data.suggestions;
        console.log('📋 Found activities in data.suggestions');
      } else if (data.data) {
        activities = data.data;
        console.log('📋 Found activities in data.data');
      } else if (data.results) {
        activities = data.results;
        console.log('📋 Found activities in data.results');
      } else {
        console.warn('⚠️ No activities found in standard keys. Full response:', data);
      }
      
      console.log('📋 Extracted activities:', activities);
      console.log('📋 Activities length:', activities.length);
      
      setVegaActivities(activities);
      
      if (activities.length > 0) {
        toast({
          title: "Success!",
          description: `Vega found ${activities.length} activities for you.`,
        });
      } else {
        // Check if API responded successfully but with no suggestions
        if (data.success && data.message) {
          console.warn('⚠️ API responded successfully but returned no suggestions');
          setVegaError(`${data.message}. Try different preferences or location.`);
          toast({
            title: "No Activities Found",
            description: data.message || "Vega couldn't find activities matching your criteria.",
          });
        } else {
          console.error('❌ API returned empty data. Expected format: { "activities": [...] } or { "suggestions": [...] }');
          console.error('❌ Actual response:', data);
          setVegaError('API returned no activities. Check backend logs.');
          toast({
            title: "No Activities Found",
            description: "The AI didn't return any activities. Please check your backend API.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Vega AI error:', error);
      setVegaError(error.message || 'Failed to get suggestions. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to get suggestions from Vega AI.",
        variant: "destructive",
      });
    } finally {
      setVegaLoading(false);
      console.log('🏁 Vega AI request completed');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <Button onClick={() => navigate('/my-trips')}>Back to My Trips</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalDays = calculateDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layered gradient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-100/40 via-transparent to-transparent"></div>
        
        {/* Main floating orbs with glow effect */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/25 to-pink-400/25 rounded-full blur-3xl animate-float shadow-[0_0_100px_rgba(168,85,247,0.4)]" style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float shadow-[0_0_80px_rgba(139,92,246,0.3)]" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-cyan-400/25 to-teal-400/25 rounded-full blur-3xl animate-float shadow-[0_0_90px_rgba(34,211,238,0.4)]" style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
        <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-gradient-to-br from-rose-400/20 to-orange-400/20 rounded-full blur-3xl animate-float shadow-[0_0_70px_rgba(251,113,133,0.3)]" style={{ animationDelay: '1s', animationDuration: '9s' }}></div>
        
        {/* Secondary smaller orbs for depth */}
        <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-gradient-to-br from-fuchsia-300/15 to-purple-300/15 rounded-full blur-2xl animate-float-reverse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute top-2/3 right-1/2 w-56 h-56 bg-gradient-to-br from-sky-300/15 to-cyan-300/15 rounded-full blur-2xl animate-float-reverse" style={{ animationDelay: '3s', animationDuration: '13s' }}></div>
        
        {/* Particle-like dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-pink-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-violet-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Grid pattern with enhanced visibility */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf625_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf625_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
        
        {/* Animated wave lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent animate-wave"></div>
        <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent animate-wave" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/30 to-transparent animate-wave" style={{ animationDelay: '4s' }}></div>
        
        {/* Geometric shapes with multiple animations */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 border-2 border-purple-300/40 rounded-lg rotate-45 animate-spin-slow shadow-[0_0_30px_rgba(168,85,247,0.2)]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border-2 border-pink-300/40 rounded-full animate-pulse-glow"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 border-2 border-cyan-300/30 rounded-lg animate-rotate-reverse" style={{ animationDuration: '25s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 border-2 border-violet-300/30 rounded-full animate-scale-pulse"></div>
        
        {/* Light rays effect */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-purple-200/20 via-purple-300/30 to-transparent animate-shimmer"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-pink-200/20 via-pink-300/30 to-transparent animate-shimmer" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Enhanced custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) scale(1.05) rotate(5deg);
          }
          50% {
            transform: translate(-15px, 15px) scale(0.95) rotate(-5deg);
          }
          75% {
            transform: translate(15px, 10px) scale(1.02) rotate(3deg);
          }
        }
        
        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-25px, 20px) scale(0.95);
          }
          50% {
            transform: translate(20px, -15px) scale(1.05);
          }
          75% {
            transform: translate(-10px, -20px) scale(0.98);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.5);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }
        
        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.7;
          }
        }
        
        @keyframes wave {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 15s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-rotate-reverse {
          animation: rotate-reverse 25s linear infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-scale-pulse {
          animation: scale-pulse 5s ease-in-out infinite;
        }
        
        .animate-wave {
          animation: wave 8s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 6s ease-in-out infinite;
        }
      `}</style>

      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Side - Plan Your Trip */}
          <Card className="bg-white shadow-xl border-0 h-fit sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Plan your trip</h2>
              
              {/* City Selection */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Destination</Label>
                
                {/* Country Selector */}
                <div className="mb-3">
                  <Label className="text-xs text-slate-600 mb-1 block">Country</Label>
                  {!customCountryMode ? (
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between border-slate-300 hover:border-indigo-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {selectedCountry ? (
                              <>
                                <img 
                                  src={`https://flagcdn.com/w20/${countriesData.find(c => c.name === selectedCountry)?.code.toLowerCase()}.png`}
                                  alt={selectedCountry}
                                  className="w-5 h-4 object-cover rounded-sm border border-slate-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span>{selectedCountry}</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-500">Select country...</span>
                              </>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search country..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>
                              <div className="py-6 text-center text-sm">
                                <p className="text-slate-500 mb-2">No country found</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setCustomCountryMode(true);
                                    setCountryOpen(false);
                                  }}
                                  className="text-indigo-600"
                                >
                                  Enter manually
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {countriesData.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  value={country.name}
                                  onSelect={(currentValue) => {
                                    setSelectedCountry(currentValue);
                                    setSelectedCity(""); // Reset city when country changes
                                    setCountryOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <img 
                                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                                    alt={country.name}
                                    className="w-5 h-4 object-cover rounded-sm mr-2 border border-slate-200"
                                  />
                                  {country.name}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      selectedCountry === country.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs text-slate-600"
                                onClick={() => {
                                  setCustomCountryMode(true);
                                  setCountryOpen(false);
                                }}
                              >
                                <Search className="w-3 h-3 mr-2" />
                                Enter country manually
                              </Button>
                            </div>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        placeholder="Enter country name"
                        className="flex-1 border-slate-300"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCustomCountryMode(false)}
                        className="shrink-0"
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* City Selector */}
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">City</Label>
                  {!customCityMode && availableCities.length > 0 ? (
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className="w-full justify-between border-slate-300 hover:border-indigo-400 transition-colors"
                          disabled={!selectedCountry}
                        >
                          <div className="flex items-center gap-2">
                            {selectedCity ? (
                              <>
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span>{selectedCity}</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-500">Select city...</span>
                              </>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search city..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>
                              <div className="py-6 text-center text-sm">
                                <p className="text-slate-500 mb-2">No city found</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setCustomCityMode(true);
                                    setCityOpen(false);
                                  }}
                                  className="text-indigo-600"
                                >
                                  Enter manually
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {availableCities.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={(currentValue) => {
                                    setSelectedCity(currentValue);
                                    setCityOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                                  {city}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      selectedCity === city ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs text-slate-600"
                                onClick={() => {
                                  setCustomCityMode(true);
                                  setCityOpen(false);
                                }}
                              >
                                <Search className="w-3 h-3 mr-2" />
                                Enter city manually
                              </Button>
                            </div>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        placeholder="Enter city name"
                        className="flex-1 border-slate-300"
                      />
                      {availableCities.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCustomCityMode(false)}
                          className="shrink-0"
                        >
                          <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {isSaving && (
                  <p className="text-xs text-green-600 mt-2">Saving...</p>
                )}
              </div>

              {/* Day Selection */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Day</Label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={dayNumber || '1'}
                  onChange={(e) => navigate(`/trip/${tripId}/day/${e.target.value}`)}
                >
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Day {day}</option>
                  ))}
                </select>
              </div>

              {/* Time of Day */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Time of day</Label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={selectedTimeOfDay}
                  onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              {/* Travelers */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Travelers *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Adults (Required)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                      className="border-slate-300"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Kids (Optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={kids}
                      onChange={(e) => setKids(parseInt(e.target.value) || 0)}
                      className="border-slate-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Preferences</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Food', 'Walking', 'Shopping', 'Museums', 'Adventure', 'Nightlife'].map(pref => (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        preferences.includes(pref)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
                {!showAddPreference ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                    onClick={() => setShowAddPreference(true)}
                  >
                    + Add preference
                  </Button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newPreference}
                      onChange={(e) => setNewPreference(e.target.value)}
                      placeholder="Enter preference"
                      className="flex-1 text-xs h-8"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomPreference()}
                    />
                    <Button 
                      size="sm" 
                      onClick={addCustomPreference}
                      className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setShowAddPreference(false);
                        setNewPreference("");
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Budget Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-semibold text-slate-700">Day Budget</Label>
                  <span className="text-xs text-slate-500">Total: €{totalBudget.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={totalBudget}
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${(budget / totalBudget) * 100}%, #e2e8f0 ${(budget / totalBudget) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-green-600 font-medium">€{budget} allocated</span>
                  <span className="text-xs text-slate-500">€{(totalBudget - budget).toLocaleString()} remaining</span>
                </div>
              </div>

              {/* Trip Info Card - Bottom */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 mb-4 border border-indigo-100">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm">Trip Summary</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium">{trip.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Total Days: {totalDays}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{adults > 0 || kids > 0 ? `${adults} Adults, ${kids} Kids` : 'No travelers set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Total Budget: €{totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Added Activities Section */}
              {addedActivities.length > 0 && (
                <div className="mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Added to Plan ({addedActivities.length})
                    </h3>
                    <div className="space-y-2">
                      {addedActivities.map((activity, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-xs font-semibold text-slate-800 mb-1">
                                {activity.title || activity.name}
                              </h4>
                              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                {activity.description || activity.details}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-green-700">
                                  {(() => {
                                    const price = activity.calculatedTotalPrice || 0;
                                    if (price === 0) return 'Free';
                                    
                                    const currency = activity.currency || 'EUR';
                                    const symbols: Record<string, string> = {
                                      'EUR': '€',
                                      'USD': '$',
                                      'GBP': '£',
                                      'INR': '₹',
                                      'JPY': '¥',
                                      'AUD': 'A$',
                                      'CAD': 'C$',
                                    };
                                    const symbol = symbols[currency] || currency;
                                    return `${symbol}${price}`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeActivityFromPlan(index)}
                              className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Total Cost:</span>
                        <span className="font-bold text-green-700">
                          {(() => {
                            const total = addedActivities.reduce((sum, a) => sum + (a.calculatedTotalPrice || 0), 0);
                            if (total === 0) return 'Free';
                            
                            // Use currency from first activity or default to EUR
                            const currency = addedActivities[0]?.currency || 'EUR';
                            const symbols: Record<string, string> = {
                              'EUR': '€',
                              'USD': '$',
                              'GBP': '£',
                              'INR': '₹',
                              'JPY': '¥',
                              'AUD': 'A$',
                              'CAD': 'C$',
                            };
                            const symbol = symbols[currency] || currency;
                            return `${symbol}${total}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ask Vega Button */}
              <Button 
                onClick={() => {
                  if (!showVega) {
                    setShowVega(true);
                    fetchVegaSuggestions();
                  } else {
                    setShowVega(false);
                  }
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={vegaLoading}
              >
                <Star className="w-4 h-4 mr-2 fill-white" />
                {vegaLoading ? 'Loading...' : 'Ask Vega'}
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">Ask for activity suggestions</p>

              {/* Vega AI Section */}
              {showVega && (
                <div className="mt-4 border-t pt-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                      <h4 className="font-bold text-slate-800">Vega</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => setShowVega(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 mb-3">
                      {vegaLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-xs text-slate-600">Vega is thinking...</span>
                        </div>
                      ) : vegaError ? (
                        <div className="text-center py-2">
                          <p className="text-xs text-red-600 mb-2">{vegaError}</p>
                          <Button 
                            size="sm" 
                            onClick={fetchVegaSuggestions}
                            className="h-7 text-xs bg-teal-500 hover:bg-teal-600"
                            disabled={vegaLoading}
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : vegaActivities.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-slate-600">
                              Here are some activity ideas for you today (Day {dayNumber || '1'}):
                            </p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={fetchVegaSuggestions}
                              className="h-6 text-xs"
                              disabled={vegaLoading}
                            >
                              🔄
                            </Button>
                          </div>
                          <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                            {vegaActivities.map((activity, index) => (
                              <li key={index}>{activity.title || activity.name || activity}</li>
                            ))}
                          </ol>
                        </>
                      ) : (
                        <p className="text-xs text-slate-600">
                          Click "Ask Vega" to get personalized activity suggestions!
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Input 
                        placeholder="Ask me anything about your trip..."
                        className="text-xs h-9 border-slate-300 bg-white"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !vegaLoading) {
                            fetchVegaSuggestions();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 h-8 text-xs"
                          onClick={fetchVegaSuggestions}
                          disabled={vegaLoading}
                        >
                          {vegaLoading ? 'Sending...' : 'Send'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          disabled
                        >
                          🎤
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          disabled
                        >
                          📎
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-2">
                        Powered by <span className="font-semibold text-teal-600">PHI-4 Ollama</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Activity Suggestions */}
          <div id="vega-section" className="lg:sticky lg:top-24 h-fit">
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
                      <img src="/logo.png" alt="Vega" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Voyara Vega</h3>
                      <p className="text-teal-100 text-xs">AI Travel Assistant</p>
                    </div>
                  </div>
                </div>

                {/* Vega is complete message */}
                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-b border-teal-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-teal-900 mb-1">Vega is complete!</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsVegaChatExpanded(!isVegaChatExpanded)}
                          className="h-6 w-6 p-0 hover:bg-teal-100"
                        >
                          <ChevronDown className={cn(
                            "w-4 h-4 text-teal-700 transition-transform duration-200",
                            isVegaChatExpanded ? "rotate-180" : ""
                          )} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {isVegaChatExpanded && (
                <>
                {/* Top free activities section */}
                <div className="p-4 bg-white">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">
                    {vegaLoading ? 'Loading suggestions...' : vegaActivities.length > 0 ? `Suggested activities in ${selectedCity || 'Paris'}` : 'Top activities'} <span className="text-xs font-normal text-slate-500">(Day {dayNumber || '3'} | {selectedTimeOfDay}):</span>
                  </h4>

                  {vegaLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : vegaError ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600 mb-2">{vegaError}</p>
                      <Button size="sm" onClick={fetchVegaSuggestions} className="bg-teal-500 hover:bg-teal-600">
                        Try Again
                      </Button>
                    </div>
                  ) : vegaActivities.length > 0 ? (
                    <div className="space-y-3">
                      {vegaActivities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-slate-800 text-sm flex-1">
                                {index + 1}. {activity.title || activity.name || 'Activity'}
                              </h5>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">
                              {activity.description || activity.details || 'Enjoy this amazing activity!'}
                            </p>
                            {activity.reason && (
                              <p className="text-xs text-slate-500 italic mb-3 pl-2 border-l-2 border-teal-200">
                                {activity.reason}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-teal-700">
                                  {(() => {
                                    const adultPrice = activity.estimated_price_adult || 0;
                                    const childPrice = activity.estimated_price_child || 0;
                                    const totalPrice = (adults * adultPrice) + (kids * childPrice);
                                    const currency = activity.currency || 'EUR';
                                    
                                    // Currency symbol mapping
                                    const getCurrencySymbol = (curr: string) => {
                                      const symbols: Record<string, string> = {
                                        'EUR': '€',
                                        'USD': '$',
                                        'GBP': '£',
                                        'INR': '₹',
                                        'JPY': '¥',
                                        'AUD': 'A$',
                                        'CAD': 'C$',
                                      };
                                      return symbols[curr] || curr;
                                    };
                                    
                                    if (totalPrice === 0) return 'Free';
                                    
                                    const symbol = getCurrencySymbol(currency);
                                    
                                    return (
                                      <span className="flex flex-col gap-0.5">
                                        <span>{symbol}{totalPrice}</span>
                                        <span className="text-xs text-slate-500 font-normal">
                                          ({symbol}{adultPrice}/adult{childPrice > 0 ? `, ${symbol}${childPrice}/child` : ''})
                                        </span>
                                      </span>
                                    );
                                  })()}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white h-8 text-xs"
                                onClick={() => addActivityToPlan(activity)}
                              >
                                + Add to Plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-600 mb-3">No activities yet.</p>
                      <Button 
                        size="sm" 
                        onClick={fetchVegaSuggestions}
                        className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                      >
                        Get Suggestions from Vega
                      </Button>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                  <div className="flex gap-2 mb-2">
                    <Input 
                      placeholder="Type anything about your trip..."
                      className="flex-1 border-slate-300 bg-white text-sm"
                    />
                    <Button 
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Powered by <span className="font-semibold text-teal-600">PHI-4 Ollama</span>
                  </p>
                </div>
                </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DayPlanner;
