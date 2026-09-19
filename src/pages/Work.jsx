import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Grid cells are always 16:9 and the video fills them (cropped, no black bars).
// Each video's real aspect ratio comes from the backend automatically.
const CELL_ASPECT = 16 / 9;

// Same timing for the shared-element move and the crop reveal so they stay in sync.
// (These are Framer Motion's default layout timings, made explicit.)
const MORPH = { duration: 0.45, ease: [0.4, 0, 0.1, 1] };

const FULL_CLIP = 'inset(0% 0% 0% 0%)';

const aspectOf = (project) =>
  Number.isFinite(project.aspect) && project.aspect > 0 ? project.aspect : CELL_ASPECT;

/**
 * Card state: the video box has its REAL ratio and is scaled so it covers the
 * 16:9 cell (like object-cover). The cell clips the overflow.
 * Because the box keeps the video's true ratio, it can scale up into the
 * modal without any stretching.
 */
const coverBoxStyle = (aspect) => ({
  aspectRatio: `${aspect}`,
  width: `${Math.max(1, aspect / CELL_ASPECT) * 100}%`,
});

/**
 * The part of the full video box that is visible inside the 16:9 cell.
 * The modal starts (and ends, when closing) clipped to this, then reveals
 * the rest as it grows, so the picture never distorts.
 */
const cropInset = (aspect) => {
  if (aspect < CELL_ASPECT) {
    const v = ((1 - aspect / CELL_ASPECT) / 2) * 100;
    return `inset(${v}% 0% ${v}% 0%)`;
  }
  const h = ((1 - CELL_ASPECT / aspect) / 2) * 100;
  return `inset(0% ${h}% 0% ${h}%)`;
};

/**
 * Grid preview: shows the poster instantly, downloads the small muted
 * thumbnail only when the card is near the viewport, and pauses it when
 * it scrolls away.
 */
function PreviewVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.getAttribute('src') !== src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 outline-none"
    />
  );
}

/**
 * Modal player: the poster is shown immediately (so the open animation
 * always has something to scale), and the full video fades in on top once
 * its first frame is ready. The box never changes size.
 */
function ModalVideo({ src, poster }) {
  const [ready, setReady] = useState(false);

  return (
    <>
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      <video
        src={src}
        controls
        autoPlay
        playsInline
        onLoadedData={() => setReady(true)}
        onError={() => setReady(true)}
        className={`absolute inset-0 w-full h-full object-contain bg-black outline-none transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  // Centralized API URL for both fetching and media sources
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Works with relative paths from the API today, and with full URLs
  // (e.g. a CDN / R2 bucket) if you move the media later.
  const asset = (url) => {
    if (!url) return undefined;
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects from backend:", err);
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-black text-white relative">

      {/* Fixed so the video stays glued to the background while you scroll */}
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
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-neutral-900 rounded-lg overflow-hidden shadow-xl cursor-pointer outline-none"
              >
                {/* Uniform 16:9 cell: clips the video so it fills the card */}
                <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                  {/*
                    Shared element: the video at its real ratio, covering the cell.
                    Whatever sticks out of the cell is clipped by the cell itself.
                  */}
                  <motion.div
                    layoutId={`project-container-${project.id}`}
                    transition={MORPH}
                    style={{ borderRadius: 0, ...coverBoxStyle(aspectOf(project)) }}
                    className="relative flex-none overflow-hidden bg-black outline-none"
                  >
                    <PreviewVideo
                      src={asset(project.thumb_url || project.video_url)}
                      poster={asset(project.poster_url)}
                    />
                  </motion.div>
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
              </div>
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
              {/*
                Box sized from the video's real ratio: as large as possible within
                92vw x 85vh. It starts clipped to exactly what the card showed and
                reveals the full frame as it grows (and re-crops when closing).
              */}
              <motion.div
                layoutId={`project-container-${selectedProject.id}`}
                initial={{ clipPath: cropInset(aspectOf(selectedProject)) }}
                animate={{ clipPath: FULL_CLIP }}
                exit={{ clipPath: cropInset(aspectOf(selectedProject)) }}
                transition={MORPH}
                style={{
                  borderRadius: 12,
                  aspectRatio: `${aspectOf(selectedProject)}`,
                  width: `min(92vw, calc(85vh * ${aspectOf(selectedProject)}))`,
                }}
                className="relative bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto outline-none"
              >
                <ModalVideo
                  src={asset(selectedProject.video_url)}
                  poster={asset(selectedProject.poster_url)}
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-6 text-white/70 hover:text-white transition-colors text-4xl font-light z-50 outline-none drop-shadow-md"
                >
                  &times;
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}