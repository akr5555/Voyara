import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const destinations = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    price: "From $899",
    theme: "Beach",
    description: "Golden beaches, jungle temples, and vibrant night markets for a relaxed island escape.",
    highlights: ["Ubud rice terraces", "Uluwatu cliffs", "Traditional cuisine"],
  },
  {
    id: 2,
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    price: "From $749",
    theme: "City",
    description: "Gaudi architecture, seaside promenades, and tapas culture in a city made for strolls.",
    highlights: ["Sagrada Familia", "Gothic Quarter", "Beachfront cafes"],
  },
  {
    id: 3,
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    price: "From $699",
    theme: "Culture",
    description: "Timeless boulevards, art-filled afternoons, and evenings by the Seine.",
    highlights: ["Louvre museum", "Eiffel Tower views", "Cafe culture"],
  },
  {
    id: 4,
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    price: "From $999",
    theme: "Beach",
    description: "Whitewashed villages, caldera sunsets, and crystal-blue coves.",
    highlights: ["Oia sunsets", "Volcanic beaches", "Cliffside dining"],
  },
  {
    id: 5,
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
    price: "From $1,299",
    theme: "Luxury",
    description: "Overwater villas and turquoise lagoons for the ultimate slow-travel reset.",
    highlights: ["Reef snorkeling", "Private sandbanks", "Spa rituals"],
  },
  {
    id: 6,
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    price: "From $1,099",
    theme: "City",
    description: "Neon nights, serene shrines, and world-class cuisine across every district.",
    highlights: ["Shibuya crossing", "Sushi tastings", "Ancient temples"],
  },
  {
    id: 7,
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    price: "From $599",
    theme: "City",
    description: "Iconic skylines, Broadway nights, and neighborhoods that never slow down.",
    highlights: ["Central Park", "Broadway shows", "Soho galleries"],
  },
  {
    id: 8,
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    price: "From $849",
    theme: "Luxury",
    description: "Desert adventures, futuristic skylines, and world-class shopping.",
    highlights: ["Desert safari", "Marina skyline", "Sky-high dining"],
  },
];

const filters = ["All", "Beach", "City", "Culture", "Luxury"];

const PopularDestinations = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const selectedDestination = destinations.find((destination) => destination.id === selectedId) || null;

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem("voyara-favorites");
    if (!storedFavorites) return;

    try {
      setFavorites(JSON.parse(storedFavorites));
    } catch {
      window.localStorage.removeItem("voyara-favorites");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("voyara-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const matchesFilter = activeFilter === "All" || destination.theme === activeFilter;
      const searchText = `${destination.name} ${destination.country} ${destination.description}`.toLowerCase();
      const matchesQuery = searchText.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const visibleDestinations = showAll ? filteredDestinations : filteredDestinations.slice(0, 6);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handlePlanTrip = () => {
    if (!selectedDestination) return;

    navigate("/create-trip", {
      state: {
        prefill: {
          name: `${selectedDestination.name}, ${selectedDestination.country}`,
          description: selectedDestination.description,
          cover_image_url: selectedDestination.image,
        },
      },
    });
    setSelectedId(null);
  };

  return (
    <section
      id="destinations"
      className="relative overflow-hidden py-20 lg:py-32"
      style={{
        background: "linear-gradient(135deg, #E8A587 0%, #F4C4B4 50%, #E8A587 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-full h-full"
          style={{
            background: "linear-gradient(to bottom left, rgba(232, 165, 135, 0.6) 0%, rgba(244, 196, 180, 0.3) 50%, transparent 70%)",
            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 60% 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-full"
          style={{
            background: "linear-gradient(to top right, rgba(205, 180, 160, 0.4) 0%, rgba(220, 200, 180, 0.2) 50%, transparent 70%)",
            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 italic">
              POPULAR DESTINATION
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-gray-800/85">
            Browse curated places, save your favorites, and jump straight into planning with Voyara.
          </p>
        </div>

        <div className="mx-auto mb-10 flex max-w-6xl flex-col gap-4 rounded-[2rem] border border-white/40 bg-white/45 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-md md:flex-row md:items-center md:justify-between md:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search destinations, countries, or vibes"
              className="h-12 rounded-full border-white/60 bg-white/80 pl-11 text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white/70 text-gray-700 hover:bg-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-gray-800">
          <div className="flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-700" />
            <span>{filteredDestinations.length} destinations match your view</span>
          </div>
          <div className="rounded-full bg-white/55 px-4 py-2 backdrop-blur-sm">
            Saved favorites: <span className="font-semibold">{favorites.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-7 max-w-6xl mx-auto">
          {visibleDestinations.map((destination, index) => (
            <div
              key={destination.id}
              className="group relative min-h-[420px] cursor-pointer overflow-hidden rounded-[2rem] shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedId(destination.id)}
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(destination.id);
                }}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 transition-colors hover:bg-white"
                aria-pressed={favorites.includes(destination.id)}
                aria-label={favorites.includes(destination.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={favorites.includes(destination.id) ? "h-5 w-5 fill-rose-500 text-rose-500" : "h-5 w-5"} />
              </button>

              <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-7">
                <div>
                  <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-800">
                    {destination.theme}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                      {destination.name}
                    </h3>
                    <p className="text-sm md:text-base text-white/90">{destination.country}</p>
                  </div>
                  <p className="max-w-sm text-sm md:text-base leading-relaxed text-white/85">
                    {destination.description}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base md:text-lg font-semibold text-white">
                      {destination.price}
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-white/70">
                      Tap to preview
                    </span>
                  </div>
                </div>

                <div className="transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button
                    className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId(destination.id);
                    }}
                  >
                    View Place
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-white/40 bg-white/50 px-6 py-10 text-center shadow-lg backdrop-blur-sm">
            <p className="text-lg font-semibold text-gray-900">No destinations match that search yet.</p>
            <p className="mt-2 text-sm text-gray-700">
              Try another keyword or switch the destination vibe filter.
            </p>
          </div>
        )}

        {filteredDestinations.length > 6 && (
          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-gray-900/20 bg-white/75 px-6 py-6 text-sm font-semibold text-gray-900 hover:bg-white"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show fewer destinations" : "Show more destinations"}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={selectedId !== null} onOpenChange={(open) => setSelectedId(open ? selectedId : null)}>
        {selectedDestination && (
          <DialogContent className="max-w-2xl overflow-hidden p-0">
            <div className="grid md:grid-cols-[1.1fr_0.9fr]">
              <div className="relative h-64 md:h-full">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold">
                    {selectedDestination.name}, {selectedDestination.country}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600">
                    {selectedDestination.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Highlights</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {selectedDestination.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <DialogFooter className="mt-6">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{selectedDestination.price}</span>
                    <Button className="bg-gray-900 text-white hover:bg-gray-800" onClick={handlePlanTrip}>
                      Plan this trip
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};

export default PopularDestinations;
