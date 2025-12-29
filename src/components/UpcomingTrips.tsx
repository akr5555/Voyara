import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trips = [
  {
    id: 1,
    title: "European Adventure",
    date: "Jul 15 - Jul 30, 2025",
    subtitle: "Explore historic cities, iconic landmarks, and unforgettable cultures across Europe.",
    description: "The European adventure is a multi-city trip designed to explore famous destinations, cultural attractions, and local experiences. The journey includes planned activities, travel itineraries, and cost breakdowns for easy and stress-free travel.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    imagePosition: "right",
  },
  {
    id: 2,
    title: "Tokyo Explorer",
    date: "Sep 10 - Sep 20, 2025",
    subtitle: "Explore Tokyo's perfect blend of tradition, technology, and vibrant city life.",
    description: "A cultural and modern exploration of Tokyo's ancient temples, cutting-edge technology, cuisine, and iconic neighborhoods. The plan includes scheduled activities, travel details, and estimated costs for a smooth and organized exploration.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    imagePosition: "left",
  },
];

const UpcomingTrips = () => {
  return (
    <section id="trips" className="relative py-12 lg:py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8A587 0%, #F4C4B4 50%, #E8A587 100%)',
      }}
    >
      <div className="relative z-10">
        {/* Section Header */}
        <div className="mb-8 animate-fade-in px-4 md:px-8 lg:px-16">
          <h2 className="text-2xl md:text-3xl font-display italic text-gray-900">
            UPCOMING TRIPS
          </h2>
        </div>

        {/* Trips List - Alternating layout with outer border */}
        <div className="space-y-16">
          {trips.map((trip, index) => (
            <div key={trip.id} className="relative">
              {/* Outer Border Frame - BEHIND the card, offset - RECTANGULAR, CLOSER on sides, OFFSET vertically */}
              <div className={`absolute border-[3px] border-gray-800/60 rounded-none pointer-events-none z-0 ${
                index === 0 
                  ? "top-4 bottom-[-1.5rem] left-0 right-2 md:right-4 lg:right-6" 
                  : "-top-6 bottom-4 right-0 left-2 md:left-4 lg:left-6"
              }`}></div>
              
              {/* Main Card - ABOVE the border, TOUCHING EDGES - MORE TRANSPARENT */}
              <div className={`relative z-10 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden max-w-5xl ${
                index === 0 ? "ml-auto" : "mr-auto"
              }`}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${
                  trip.imagePosition === "right" ? "" : "md:grid-flow-dense"
                }`}>
                  {/* Content Section */}
                  <div className={`p-6 md:p-8 flex flex-col ${
                    trip.imagePosition === "right" ? "md:col-start-1" : "md:col-start-2"
                  }`}>
                    {/* Title Section */}
                    <div className="mb-4">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-1">
                        {trip.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {trip.date}
                      </p>
                      <p className="text-gray-700 text-sm font-medium leading-relaxed">
                        {trip.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="flex-1 mb-5">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {trip.description}
                      </p>
                    </div>

                    {/* Button Section */}
                    <div>
                      <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className={`relative h-64 md:h-auto ${
                    trip.imagePosition === "right" ? "md:col-start-2" : "md:col-start-1"
                  }`}>
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;
