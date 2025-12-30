import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon, MapPin, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CreateTrip = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [tripData, setTripData] = useState({
    name: "",
    description: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    cover_image_url: ""
  });

  const handleCreateTrip = async () => {
    // Validation
    if (!tripData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a trip name"
      });
      return;
    }

    if (!tripData.start_date || !tripData.end_date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select start and end dates"
      });
      return;
    }

    if (tripData.end_date < tripData.start_date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "End date must be after start date"
      });
      return;
    }

    try {
      setCreating(true);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/auth');
        return;
      }

      // Create trip in database
      const tripInsertData = {
        user_id: user.id,
        name: tripData.name,
        description: tripData.description,
        start_date: format(tripData.start_date, 'yyyy-MM-dd'),
        end_date: format(tripData.end_date, 'yyyy-MM-dd'),
        cover_image_url: tripData.cover_image_url || null,
        status: 'planning'
      };

      const { data, error } = await (supabase as unknown as {
        from: (table: string) => {
          insert: (data: typeof tripInsertData[]) => {
            select: () => {
              single: () => Promise<{ data: unknown; error: Error | null }>
            }
          }
        }
      })
        .from('trips')
        .insert([tripInsertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your trip has been created."
      });

      // Navigate to My Trips page
      navigate('/my-trips');
    } catch (error: unknown) {
      console.error('Create trip error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/15 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-300"></div>
        
        {/* 3D Floating Boxes */}
        <div className="absolute top-28 left-[12%] w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-2xl transform rotate-12 animate-float"></div>
        <div className="absolute top-48 right-[18%] w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl transform -rotate-6 animate-float-delay-2"></div>
        <div className="absolute bottom-40 left-[15%] w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg transform rotate-45 animate-float-delay-1"></div>
        <div className="absolute bottom-56 right-[20%] w-28 h-28 bg-gradient-to-br from-indigo-300/15 to-blue-400/15 backdrop-blur-sm border border-white/25 rounded-xl shadow-xl transform -rotate-12 animate-float-delay-3"></div>
        <div className="absolute top-[55%] left-[8%] w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/30 rounded-md shadow-lg transform rotate-30 animate-float-delay-15"></div>
        <div className="absolute top-[32%] right-[14%] w-20 h-20 bg-gradient-to-br from-purple-400/15 to-blue-500/15 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl transform -rotate-20 animate-float-delay-25"></div>
        <div className="absolute top-[22%] left-[45%] w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-blue-400/10 backdrop-blur-sm border border-white/20 rounded-md shadow-md transform rotate-6 animate-float-delay-05"></div>
        <div className="absolute bottom-[25%] right-[12%] w-14 h-14 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/25 rounded-lg shadow-lg transform -rotate-15 animate-float-delay-35"></div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16 sm:mt-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
              Create New Trip
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium px-4">Plan your next unforgettable adventure</p>
          </div>

          <Card className="bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500"></div>
            <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-6 pb-6 sm:pb-8">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl text-slate-800">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                Trip Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-slate-600">Every journey begins with a single step... let's plan yours!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
              {/* Trip Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Trip Name <span className="text-indigo-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Europe Tour"
                  value={tripData.name}
                  onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-base sm:text-lg bg-white text-slate-900"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your trip plans..."
                  value={tripData.description}
                  onChange={(e) => setTripData({ ...tripData, description: e.target.value })}
                  rows={4}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white text-slate-900 text-sm sm:text-base resize-none"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Start Date <span className="text-indigo-600">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-slate-300 hover:border-indigo-400 text-slate-900 h-10 sm:h-11 text-sm sm:text-base",
                          !tripData.start_date && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tripData.start_date ? format(tripData.start_date, "PPP") : "Pick a date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tripData.start_date}
                        onSelect={(date) => setTripData({ ...tripData, start_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">End Date <span className="text-indigo-600">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-slate-300 hover:border-indigo-400 text-slate-900 h-10 sm:h-11 text-sm sm:text-base",
                          !tripData.end_date && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tripData.end_date ? format(tripData.end_date, "PPP") : "Pick a date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tripData.end_date}
                        onSelect={(date) => setTripData({ ...tripData, end_date: date })}
                        initialFocus
                        disabled={(date) => tripData.start_date ? date < tripData.start_date : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-2">
                <Label htmlFor="cover_image_url" className="text-sm font-semibold text-slate-700">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  placeholder="https://example.com/image.jpg"
                  value={tripData.cover_image_url}
                  onChange={(e) => setTripData({ ...tripData, cover_image_url: e.target.value })}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white text-slate-900 text-sm sm:text-base"
                />
                {tripData.cover_image_url && (
                  <div className="mt-4 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-xl sm:shadow-2xl ring-2 sm:ring-4 ring-blue-500/20">
                    <img
                      src={tripData.cover_image_url}
                      alt="Cover preview"
                      className="w-full h-48 sm:h-64 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-trips')}
                  className="w-full sm:flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all h-10 sm:h-11 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTrip}
                  disabled={creating}
                  className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 text-white font-semibold shadow-lg h-10 sm:h-11 text-sm sm:text-base"
                  size="lg"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Creating Your Adventure...</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Create Trip
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateTrip;
