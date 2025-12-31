import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 20);

    // Hide loading screen after 1 second
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* Animated 3D background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(232, 121, 80, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 121, 80, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(1000px) rotateX(60deg) translateZ(-100px)',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Floating orbs with 3D effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-orange-400/30 via-coral-500/15 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-radial from-rose-400/30 via-pink-500/15 to-transparent rounded-full blur-3xl animate-float-slow-reverse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-radial from-amber-400/30 via-yellow-500/15 to-transparent rounded-full blur-3xl animate-float-medium"></div>
      </div>

      {/* Main content with 3D perspective */}
      <div className="relative z-10 flex flex-col items-center gap-8" style={{ perspective: '1000px' }}>
        {/* 3D rotating logo container */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 rounded-full blur-3xl opacity-40 animate-pulse-glow"></div>
          
          {/* Logo with 3D transform */}
          <div className="relative animate-3d-rotate">
            <img
              src="/loading.png"
              alt="Loading..."
              className="w-64 sm:w-80 md:w-96 h-auto object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(232, 121, 80, 0.5))',
                animation: 'floatAndRotate 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Orbital rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-orange-400/30 rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-2 border-rose-400/20 rounded-full animate-spin-slow-reverse"></div>
        </div>
        
        {/* Modern loading text with gradient */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600 bg-clip-text text-transparent animate-gradient-x mb-2">
            Loading Experience
          </h2>
          <p className="text-orange-800/70 text-sm sm:text-base animate-pulse">
            Preparing your journey...
          </p>
        </div>

        {/* 3D Progress bar */}
        <div className="w-64 sm:w-80 relative">
          <div className="h-2 bg-orange-100/50 rounded-full overflow-hidden backdrop-blur-sm border border-orange-200/50 shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(232, 121, 80, 0.6)'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-center mt-2 text-orange-700/80 text-xs font-medium">
            {progress}%
          </div>
        </div>

        {/* Animated particles */}
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/50 animate-particle-1"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full shadow-lg shadow-rose-500/50 animate-particle-2"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg shadow-amber-500/50 animate-particle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
