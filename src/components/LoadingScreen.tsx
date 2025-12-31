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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900">
      {/* Animated 3D background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(1000px) rotateX(60deg) translateZ(-100px)',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Floating orbs with 3D effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/40 via-blue-600/20 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-radial from-purple-500/40 via-purple-600/20 to-transparent rounded-full blur-3xl animate-float-slow-reverse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-radial from-indigo-500/40 via-indigo-600/20 to-transparent rounded-full blur-3xl animate-float-medium"></div>
      </div>

      {/* Main content with 3D perspective */}
      <div className="relative z-10 flex flex-col items-center gap-8" style={{ perspective: '1000px' }}>
        {/* 3D rotating logo container */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-50 animate-pulse-glow"></div>
          
          {/* Logo with 3D transform */}
          <div className="relative animate-3d-rotate">
            <img
              src="/loading.png"
              alt="Loading..."
              className="w-64 sm:w-80 md:w-96 h-auto object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.6))',
                animation: 'floatAndRotate 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Orbital rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-blue-500/30 rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-2 border-purple-500/20 rounded-full animate-spin-slow-reverse"></div>
        </div>
        
        {/* Modern loading text with gradient */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x mb-2">
            Loading Experience
          </h2>
          <p className="text-blue-200/80 text-sm sm:text-base animate-pulse">
            Preparing your journey...
          </p>
        </div>

        {/* 3D Progress bar */}
        <div className="w-64 sm:w-80 relative">
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50 shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-center mt-2 text-blue-300/80 text-xs font-medium">
            {progress}%
          </div>
        </div>

        {/* Animated particles */}
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 animate-particle-1"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 animate-particle-2"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-lg shadow-pink-500/50 animate-particle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
