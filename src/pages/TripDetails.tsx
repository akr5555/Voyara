import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, MapPin, Calendar, DollarSign, Plane, Hotel, Utensils, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VegaAI from "@/components/VegaAI";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo: string;
  budget: number;
  status: string;
  created_at: string;
}

interface Activity {
  id: string;
  day_number: number;
  time_of_day: string;
  activity_name: string;
  location: string;
  estimated_cost: number;
  notes: string;
}

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [transportationBooked, setTransportationBooked] = useState(false);
  const [accommodationBooked, setAccommodationBooked] = useState(false);

  const fetchTripDetails = useCallback(async () => {
    if (!id) return;

    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (tripError) throw tripError;
      setTrip(tripData);

      // Fetch activities for this trip
      const { data: activitiesData } = await supabase
        .from('trip_activities')
        .select('*')
        .eq('trip_id', id)
        .order('day_number', { ascending: true });

      if (activitiesData) {
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trip details",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const calculateDays = () => {
    if (!trip) return 0;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateTotalCost = () => {
    return activities.reduce((sum, activity) => sum + (activity.estimated_cost || 0), 0);
  };

  const exportToExcel = () => {
    if (!trip) return;

    // Prepare trip summary
    const summary = [
      ['Trip Name', trip.name],
      ['Description', trip.description],
      ['Start Date', new Date(trip.start_date).toLocaleDateString()],
      ['End Date', new Date(trip.end_date).toLocaleDateString()],
      ['Total Days', calculateDays()],
      ['Budget', `$${trip.budget}`],
      ['Total Estimated Cost', `$${calculateTotalCost()}`],
      ['Remaining Budget', `$${trip.budget - calculateTotalCost()}`],
      [],
    ];

    // Prepare activities data
    const activitiesHeader = ['Day', 'Time of Day', 'Activity', 'Location', 'Estimated Cost', 'Notes'];
    const activitiesData = activities.map(activity => [
      activity.day_number,
      activity.time_of_day,
      activity.activity_name,
      activity.location,
      `$${activity.estimated_cost}`,
      activity.notes || '',
    ]);

    // Combine all data
    const worksheetData = [...summary, activitiesHeader, ...activitiesData];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trip Details');

    // Generate file
    XLSX.writeFile(workbook, `${trip.name.replace(/\s+/g, '_')}_Trip_Plan.xlsx`);

    toast({
      title: "Success!",
      description: "Trip details exported to Excel",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <Button onClick={() => navigate('/my-trips')}>Back to My Trips</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const days = calculateDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-orange-100 relative overflow-hidden">
      <Header />
      
      {/* 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
        
        {/* Floating Particles */}
        <div className="absolute top-40 left-[30%] w-2 h-2 bg-indigo-400/40 rounded-full animate-particle-1"></div>
        <div className="absolute top-60 right-[35%] w-3 h-3 bg-purple-400/30 rounded-full animate-particle-2"></div>
        <div className="absolute bottom-40 left-[40%] w-2 h-2 bg-blue-400/40 rounded-full animate-particle-3"></div>
        <div className="absolute top-[45%] right-[15%] w-2 h-2 bg-pink-400/30 rounded-full animate-particle-1"></div>
        <div className="absolute bottom-[35%] left-[25%] w-3 h-3 bg-indigo-400/35 rounded-full animate-particle-2"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Header Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2">My Timeline</h1>
          <p className="text-gray-600 text-lg">{trip.name}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Timeline */}
          <div className="flex-1 relative">
            {/* SVG Curved Path */}
            <svg className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 pointer-events-none hidden md:block" style={{ width: '400px' }}>
              <path
                d="M 200 0 Q 280 120, 200 240 Q 120 360, 200 480 Q 280 600, 200 720 Q 120 840, 200 960"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timeline Items */}
            <div className="relative space-y-16 py-8">
              {/* Start: Transportation Booking */}
              <div className="flex flex-col items-center">
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-300 ${
                    transportationBooked 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-white'
                  }`}>
                    <Plane className={`w-10 h-10 ${transportationBooked ? 'text-white' : 'text-indigo-600'}`} />
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-indigo-200">
                  <h3 className="font-bold text-indigo-600 mb-1">Start: Transportation Booking</h3>
                  <p className="text-sm text-gray-600 mb-3">Click open model for flight details</p>
                  <Button
                    onClick={() => setTransportationBooked(!transportationBooked)}
                    size="sm"
                    className={`${
                      transportationBooked
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white rounded-full px-4 py-2 text-xs`}
                  >
                    {transportationBooked ? 'Booked ✓' : 'Book Now'}
                  </Button>
                </div>
              </div>

              {/* Day 1 */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => navigate(`/trip/${id}/day/1`)}
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white group-hover:border-orange-300 transition-all duration-300 group-hover:scale-110">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Day 1</p>
                      <Sunrise className="w-8 h-8 text-orange-500 mx-auto group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-orange-200 group-hover:border-orange-400 group-hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-bold text-orange-600 mb-1">Day 1</h3>
                  <p className="text-sm text-gray-600">Explore and enjoy your first day</p>
                  <p className="text-xs text-orange-600 mt-2 font-medium">Click to plan activities →</p>
                </div>
              </div>

              {/* Day 2 */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => navigate(`/trip/${id}/day/2`)}
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white group-hover:border-purple-300 transition-all duration-300 group-hover:scale-110">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Day 2</p>
                      <Utensils className="w-8 h-8 text-purple-500 mx-auto group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-purple-200 group-hover:border-purple-400 group-hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-bold text-purple-600 mb-1">Day 2</h3>
                  <p className="text-sm text-gray-600">Click on the activity planner for each day</p>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Click to plan activities →</p>
                </div>
              </div>

              {/* Day 3 */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => navigate(`/trip/${id}/day/3`)}
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white group-hover:border-pink-300 transition-all duration-300 group-hover:scale-110">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Day 3</p>
                      <Hotel className="w-8 h-8 text-pink-500 mx-auto group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-pink-200 group-hover:border-pink-400 group-hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-bold text-pink-600 mb-1">Day 3</h3>
                  <p className="text-sm text-gray-600">Plan your third day activities</p>
                  <p className="text-xs text-pink-600 mt-2 font-medium">Click to plan activities →</p>
                </div>
              </div>

              {/* Day 4 */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => navigate(`/trip/${id}/day/4`)}
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white group-hover:border-blue-300 transition-all duration-300 group-hover:scale-110">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Day 4</p>
                      <MapPin className="w-8 h-8 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-blue-200 group-hover:border-blue-400 group-hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-bold text-blue-600 mb-1">Day 4</h3>
                  <p className="text-sm text-gray-600">Click to view an activity planner for the day</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Click to plan activities →</p>
                </div>
              </div>

              {/* End: Return Journey */}
              <div className="flex flex-col items-center">
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-300 ${
                    accommodationBooked
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-white'
                  }`}>
                    <div className="text-center">
                      <Sunset className={`w-10 h-10 mx-auto ${accommodationBooked ? 'text-white' : 'text-rose-500'}`} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs text-center border-2 border-rose-200">
                  <h3 className="font-bold text-rose-600 mb-1">End: Return Journey</h3>
                  <p className="text-sm text-gray-600 mb-3">Safe trip back home</p>
                  <Button
                    onClick={() => setAccommodationBooked(!accommodationBooked)}
                    size="sm"
                    className={`${
                      accommodationBooked
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-rose-500 hover:bg-rose-600'
                    } text-white rounded-full px-4 py-2 text-xs`}
                  >
                    {accommodationBooked ? 'Confirmed ✓' : 'Confirm'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Download Button (positioned like in mockup) */}
            <div className="flex justify-center mt-12">
              <Button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Budget Excel - Total Est. ${calculateTotalCost()}
              </Button>
            </div>
          </div>

          {/* Right Side - Budget Cards (Hidden on mobile, shown on large screens) */}
          <div className="lg:w-80 space-y-6 hidden lg:block">
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-indigo-600">${trip.budget}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-orange-600">{days} Days</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">${trip.budget - calculateTotalCost()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Vega AI Assistant */}
      <VegaAI tripId={id} tripName={trip.name} />

      <Footer />
    </div>
  );
};

export default TripDetails;
