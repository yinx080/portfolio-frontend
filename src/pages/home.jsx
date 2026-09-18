import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-black">
      
      {/* 1. Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 2. Overlay - Bumped to 20% opacity */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

      {/* 3. Hero Text & Call to Action */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          Camera Boy
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-200 font-medium mb-12 max-w-2xl drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
          Videography based in Málaga, Spain.
        </p>
        
        <Link 
          to="/work" 
          className="px-10 py-4 bg-white/90 backdrop-blur-sm text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-2xl hover:scale-105"
        >
          View Portfolio
        </Link>
      </div>

    </div>
  );
}