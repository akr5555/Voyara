import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Users, DollarSign, Sparkles, Check, ChevronsUpDown, Search, ChevronDown } from "lucide-react";
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
  const [customCountryMode, setCustomCountryMode] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

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
        adults,
        kids,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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

              {/* Ask Vega Button */}
              <Button 
                onClick={() => {
                  setShowVega(!showVega);
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                ✨ Ask Vega ✨
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">Ask for activity suggestions</p>

              {/* Vega AI Section */}
              {showVega && (
                <div className="mt-4 border-t pt-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow p-1">
                        <img src="/logo.png" alt="Vega" className="w-full h-full object-contain" />
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
                      <p className="text-xs text-slate-600 mb-3">
                        Here are some free activity ideas for you today (Day {dayNumber || '1'}):
                      </p>
                      <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                        <li>Stroll along the banks of the Seine</li>
                        <li>Discover Montmartre and the Sacré-Cœur Basilica</li>
                        <li>Explore Jardin des Tuileries</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <Input 
                        placeholder="Ask me anything about your trip..."
                        className="text-xs h-9 border-slate-300 bg-white"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 h-8 text-xs"
                        >
                          Send
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                        >
                          🎤
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
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
                    Top free activities in {selectedCity || 'Paris'} <span className="text-xs font-normal text-slate-500">(Day {dayNumber || '3'} | {selectedTimeOfDay}):</span>
                  </h4>

                  {/* Activity Cards */}
                  <div className="space-y-3">
                    {/* Activity 1 */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=200&fit=crop" 
                        alt="Activity"
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-slate-800 text-sm flex-1">
                            1. Stroll along the banks of the Seine
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          Enjoy a leisurely walk along the Seine River, take in the beautiful views of the city, and maybe have a picnic by the water.
                        </p>
                      </div>
                    </div>

                    {/* Activity 2 */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=200&fit=crop" 
                        alt="Activity"
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-slate-800 text-sm flex-1">
                            2. Discover Montmartre and the Sacré-Cœur Basilica
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          Visit the iconic Sacré-Cœur Basilica, and catch panoramic views of Paris.
                        </p>
                      </div>
                    </div>

                    {/* Activity 3 */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src="https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=400&h=200&fit=crop" 
                        alt="Activity"
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-slate-800 text-sm flex-1">
                            3. Explore Jardin des Tuileries
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          Spend some time in the Tuileries Garden, a lovely park near the Louvre, perfect for a relaxing walk.
                        </p>
                      </div>
                    </div>
                  </div>
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
