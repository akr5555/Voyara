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
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-8 text-foreground">Create New Trip</h1>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Trip Details
              </CardTitle>
              <CardDescription>Plan your next adventure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Europe Tour"
                  value={tripData.name}
                  onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your trip plans..."
                  value={tripData.description}
                  onChange={(e) => setTripData({ ...tripData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tripData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripData.start_date ? format(tripData.start_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tripData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripData.end_date ? format(tripData.end_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  placeholder="https://example.com/image.jpg"
                  value={tripData.cover_image_url}
                  onChange={(e) => setTripData({ ...tripData, cover_image_url: e.target.value })}
                />
                {tripData.cover_image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={tripData.cover_image_url}
                      alt="Cover preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-trips')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTrip}
                  disabled={creating}
                  className="flex-1"
                  size="lg"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
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
