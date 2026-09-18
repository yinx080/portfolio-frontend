import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

useEffect(() => {
    fetch('http:backend-port-production-d14a.up.railway.app')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects from backend:", err);
        setLoading(false);
      });
  }, []);

  return (
    // FIX 1: Removed 'overflow-hidden' so scrolling actually works
    <div className="min-h-screen bg-black text-white relative">
      
      {/* FIX 2: Changed 'absolute' to 'fixed' so the video stays glued to the background while you scroll */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bgvid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>

      {/* THE MAIN CONTENT */}
      <div className="relative z-10 px-6 md:px-16 pt-32 pb-20">
        
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Selected Work
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            A collection of automotive and cinematic projects produced across Spain.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20 font-mono uppercase tracking-widest">
            Loading portfolio archive...
          </div>
        ) : (
          /* Video Grid */
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div 
                key={project.id} 
                layoutId={`project-container-${project.id}`}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-neutral-900 rounded-lg overflow-hidden shadow-xl cursor-pointer outline-none"
              >
                {/* Thumbnail Video */}
                <div className="relative aspect-video w-full overflow-hidden bg-black outline-none">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 outline-none"
                  >
                    <source src={project.video_url} type="video/mp4" />
                  </video>
                </div>

                {/* Project Info */}
                <div className="p-6 outline-none bg-neutral-900/90 backdrop-blur-md">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {project.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* THE ANIMATED MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div 
                layoutId={`project-container-${selectedProject.id}`}
                className="relative w-auto h-auto max-w-[95vw] max-h-[90vh] bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden pointer-events-auto outline-none flex justify-center items-center"
              >
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-6 text-white/70 hover:text-white transition-colors text-4xl font-light z-50 outline-none drop-shadow-md"
                >
                  &times;
                </button>
                <video 
                  src={selectedProject.video_url}
                  controls 
                  autoPlay
                  className="max-w-full max-h-[90vh] object-contain outline-none rounded-xl"
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}