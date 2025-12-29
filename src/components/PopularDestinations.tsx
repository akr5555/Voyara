import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    price: "From $899",
  },
  {
    id: 2,
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    price: "From $749",
  },
  {
    id: 3,
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    price: "From $699",
  },
  {
    id: 4,
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    price: "From $999",
  },
  {
    id: 5,
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
    price: "From $1,299",
  },
  {
    id: 6,
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    price: "From $1,099",
  },
  {
    id: 7,
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    price: "From $599",
  },
  {
    id: 8,
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    price: "From $849",
  },
];

const PopularDestinations = () => {
  return (
    <section id="destinations" className="relative py-20 lg:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8A587 0%, #F4C4B4 50%, #E8A587 100%)',
      }}
    >
      {/* Diagonal geometric shapes - matching Figma */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full"
          style={{
            background: 'linear-gradient(to bottom left, rgba(232, 165, 135, 0.6) 0%, rgba(244, 196, 180, 0.3) 50%, transparent 70%)',
            clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 60% 100%)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(to top right, rgba(205, 180, 160, 0.4) 0%, rgba(220, 200, 180, 0.2) 50%, transparent 70%)',
            clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 italic">
              POPULAR DESTINATION
            </h2>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {destinations.slice(0, 3).map((destination, index) => (
            <div
              key={destination.id}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-[3/4] cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Close button */}
              <button className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Content */}
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">
                    {destination.name}, {destination.country}
                  </h3>
                </div>

                {/* Hover Button */}
                <div className="mt-4 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium shadow-lg">
                    View Place
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
