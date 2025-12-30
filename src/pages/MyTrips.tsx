import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MapPin, Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
  status: string;
  created_at: string;
}

const MyTrips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/auth');
        return;
      }

      // Fetch user's trips
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTrips(data || []);
    } catch (error) {
      console.error('Fetch trips error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trips"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Trip deleted successfully"
      });

      // Refresh trips list
      fetchTrips();
    } catch (error) {
      console.error('Delete trip error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete trip"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-yellow-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">My Trips</h1>
          <Button onClick={() => navigate('/create-trip')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
              <Button onClick={() => navigate('/create-trip')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                  {trip.cover_image_url ? (
                    <img
                      src={trip.cover_image_url}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                  <Badge className={`absolute top-4 right-4 ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">{trip.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {trip.description || 'No description'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{trip.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="bg-destructive"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTrips;
