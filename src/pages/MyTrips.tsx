import { useState, useEffect, useCallback } from "react";
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

  const fetchTrips = useCallback(async () => {
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
  }, [navigate, toast]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'upcoming':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'ongoing':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'completed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* 3D Floating Boxes */}
        <div className="absolute top-32 left-[10%] w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-2xl transform rotate-12 animate-float"></div>
        <div className="absolute top-52 right-[16%] w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl transform -rotate-6 animate-float-delay-2"></div>
        <div className="absolute bottom-44 left-[20%] w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg transform rotate-45 animate-float-delay-1"></div>
        <div className="absolute bottom-60 right-[24%] w-28 h-28 bg-gradient-to-br from-indigo-300/15 to-blue-400/15 backdrop-blur-sm border border-white/25 rounded-xl shadow-xl transform -rotate-12 animate-float-delay-3"></div>
        <div className="absolute top-[50%] left-[7%] w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/30 rounded-md shadow-lg transform rotate-30 animate-float-delay-15"></div>
        <div className="absolute top-[35%] right-[11%] w-20 h-20 bg-gradient-to-br from-purple-400/15 to-blue-500/15 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl transform -rotate-20 animate-float-delay-25"></div>
        <div className="absolute top-[20%] left-[50%] w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-blue-400/10 backdrop-blur-sm border border-white/20 rounded-md shadow-md transform rotate-6 animate-float-delay-05"></div>
        <div className="absolute bottom-[28%] right-[9%] w-14 h-14 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/25 rounded-lg shadow-lg transform -rotate-15 animate-float-delay-35"></div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16 sm:mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              My Trips
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium">Your adventures await!</p>
          </div>
          <Button 
            onClick={() => navigate('/create-trip')} 
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-white font-semibold shadow-lg h-11 sm:h-12 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Create New Trip</span>
            <span className="sm:hidden">New Trip</span>
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card className="bg-white shadow-2xl border border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4 sm:mb-6">
                <MapPin className="w-12 h-12 sm:w-20 sm:h-20 text-indigo-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-slate-800 text-center">No trips yet</h3>
              <p className="text-slate-600 mb-6 sm:mb-8 text-base sm:text-lg text-center px-4">Start planning your next adventure!</p>
              <Button 
                onClick={() => navigate('/create-trip')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:shadow-xl transform hover:scale-105 transition-all text-white font-semibold shadow-lg h-11 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="group overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border border-slate-200 transform hover:scale-[1.02]">
                {/* Cover Image */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                  {trip.cover_image_url ? (
                    <img
                      src={trip.cover_image_url}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-indigo-100">
                      <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Badge className={`absolute top-3 right-3 sm:top-4 sm:right-4 ${getStatusColor(trip.status)} text-white border-0 shadow-lg px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm`}>
                    {trip.status}
                  </Badge>
                </div>

                <CardHeader className="bg-gradient-to-br from-white to-blue-50/50 border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="line-clamp-1 text-lg sm:text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">{trip.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm sm:text-base text-slate-600">
                    {trip.description || 'No description'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6 pb-3 sm:pb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-blue-50/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-100">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 bg-gradient-to-br from-slate-50 to-white border-t border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg sm:text-xl">Delete Trip</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm sm:text-base">
                          Are you sure you want to delete "{trip.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
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
