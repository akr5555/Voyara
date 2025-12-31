import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    alt: "Mountain peaks at sunset",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
    alt: "Mountain lake adventure",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    alt: "Misty mountain landscape",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80",
    alt: "Tropical beach paradise",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    alt: "Desert landscape",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleManualNavigation = (direction: "next" | "prev") => {
    setIsAutoPlaying(false);
    if (direction === "next") nextSlide();
    else prevSlide();
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Drag/Swipe handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartPos(clientX);
    setDragStartTime(Date.now());
    setIsAutoPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const currentPosition = clientX;
    const diff = currentPosition - startPos;
    setCurrentTranslate(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dragEndTime = Date.now();
    const dragDuration = dragEndTime - dragStartTime;
    const velocity = Math.abs(currentTranslate) / dragDuration;
    
    // Lower threshold for mobile (30px) and consider velocity for faster swipes
    const threshold = 30;
    const velocityThreshold = 0.3; // pixels per millisecond
    
    if (currentTranslate > threshold || (velocity > velocityThreshold && currentTranslate > 0)) {
      prevSlide();
    } else if (currentTranslate < -threshold || (velocity > velocityThreshold && currentTranslate < 0)) {
      nextSlide();
    }
    
    setCurrentTranslate(0);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleDragEnd();
  };

  // Get indices for the layered effect
  const getSlideIndex = (offset: number) => {
    return (currentSlide + offset + slides.length) % slides.length;
  };

  return (
    <section id="home" className="relative min-h-[70vh] flex items-center justify-center pt-20 pb-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8A587 0%, #F4C4B4 50%, #E8A587 100%)',
      }}
    >
      {/* Orange Triangle Shapes - Exact match from Figma */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left orange triangle */}
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(135deg, rgba(232, 121, 80, 0.35) 0%, rgba(232, 121, 80, 0.15) 50%, transparent 70%)',
            clipPath: 'polygon(0 0, 35% 0, 0 65%)',
          }}
        />
        {/* Top center blended triangle */}
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(to bottom, rgba(232, 121, 80, 0.25) 0%, transparent 40%)',
            clipPath: 'polygon(20% 0, 80% 0, 50% 35%)',
          }}
        />
        {/* Right orange triangle */}
        <div className="absolute top-0 right-0 w-full h-full"
          style={{
            background: 'linear-gradient(225deg, rgba(205, 150, 130, 0.3) 0%, rgba(205, 150, 130, 0.12) 50%, transparent 70%)',
            clipPath: 'polygon(65% 0, 100% 0, 100% 65%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Title Section - matching Figma */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-2 tracking-tight">
            EXPLORE
          </h1>
          <p className="text-base md:text-lg text-gray-800 max-w-md mx-auto font-medium">
            Experience the world your way.
          </p>
        </div>

        {/* Layered Carousel Container - Fixed glitches */}
        <div className="relative max-w-7xl mx-auto h-[280px] md:h-[360px] flex items-center justify-center touch-pan-y">
          <div 
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none" 
            style={{ 
              perspective: '2500px',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'pan-y pinch-zoom'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background layers - Left side cards - HIDDEN behind center */}
            <div 
              className="absolute left-[2%] md:left-[5%] top-1/2 w-[180px] md:w-[320px] h-[200px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-[1]"
              style={{
                transform: 'translate3d(0, -50%, -80px) rotateY(18deg) scale(0.82)',
                transformOrigin: 'center center',
                opacity: 0.35,
                filter: 'blur(2.5px)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={slides[getSlideIndex(-2)].image}
                alt={slides[getSlideIndex(-2)].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>

            <div 
              className="absolute left-[12%] md:left-[18%] top-1/2 w-[220px] md:w-[380px] h-[220px] md:h-[300px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-[5]"
              style={{
                transform: 'translate3d(0, -50%, -40px) rotateY(10deg) scale(0.90)',
                transformOrigin: 'center center',
                opacity: 0.6,
                filter: 'blur(1px)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={slides[getSlideIndex(-1)].image}
                alt={slides[getSlideIndex(-1)].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            </div>

            {/* Center - Main active slide - HIGHEST z-index - WIDER */}
            <div 
              className="absolute left-1/2 top-1/2 w-[260px] md:w-[480px] h-[240px] md:h-[320px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-[10]"
              style={{
                transform: 'translate3d(-50%, -50%, 0) rotateY(0deg) scale(1)',
                transformOrigin: 'center center',
                opacity: 1,
                filter: 'blur(0px)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
            </div>

            {/* Background layers - Right side cards - HIDDEN behind center */}
            <div 
              className="absolute right-[12%] md:right-[18%] top-1/2 w-[220px] md:w-[380px] h-[220px] md:h-[300px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-[5]"
              style={{
                transform: 'translate3d(0, -50%, -40px) rotateY(-10deg) scale(0.90)',
                transformOrigin: 'center center',
                opacity: 0.6,
                filter: 'blur(1px)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={slides[getSlideIndex(1)].image}
                alt={slides[getSlideIndex(1)].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
            </div>

            <div 
              className="absolute right-[2%] md:right-[5%] top-1/2 w-[180px] md:w-[320px] h-[200px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-[1]"
              style={{
                transform: 'translate3d(0, -50%, -80px) rotateY(-18deg) scale(0.82)',
                transformOrigin: 'center center',
                opacity: 0.35,
                filter: 'blur(2.5px)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={slides[getSlideIndex(2)].image}
                alt={slides[getSlideIndex(2)].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mt-8 md:mt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-blue-600 w-8"
                  : "bg-gray-400/60 w-2 hover:bg-gray-500/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
