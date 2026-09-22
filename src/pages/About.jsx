import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ABOUT PAGE
 *
 * This file is the LAYOUT only. Every word on the page comes from the
 * backend (portfolio-backend/about.py -> /api/about), so to change the text,
 * the photo, the facts, the gear list or the links you edit about.py and
 * never touch this file.
 *
 * Sections render only when they have data: empty a list in about.py and the
 * section disappears without leaving a gap.
 */

// Small staggered fade-up used for each block, same easing family as Work.jsx
const RISE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.1, 1] },
};

/** Section heading: small uppercase label with a hairline rule, like the cards on Work. */
function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-white/10 pb-3 mb-6">
      {children}
    </h2>
  );
}

/** The 4:5 photo frame. Shows a labelled placeholder until the file exists. */
function Portrait({ src, alt }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-900 border border-white/10 shadow-2xl">
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded border border-dashed border-white/15 text-center px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Portrait
          </span>
          <span className="text-xs text-neutral-600 font-mono">
            uploads/about/portrait.jpg
          </span>
        </div>
      )}
    </div>
  );
}

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // Same convention as Work.jsx
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Works with relative paths from the API today, and with full URLs
  // (e.g. a CDN / R2 bucket) if the media moves later.
  const asset = (url) => {
    if (!url) return undefined;
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/about`)
      .then((res) => res.json())
      .then((data) => {
        setAbout(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching about content from backend:', err);
        setFailed(true);
        setLoading(false);
      });
  }, [apiUrl]);

  // Safe accessors so a missing key in about.py can never crash the page
  const list = (value) => (Array.isArray(value) ? value : []);
  const bio = list(about?.bio);
  const facts = list(about?.facts);
  const services = list(about?.services);
  const gear = list(about?.gear);
  const socials = list(about?.socials);
  const cta = about?.cta || null;

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed background video, glued in place while the page scrolls */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/bgvid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 px-6 md:px-16 pt-32 pb-20">
        {loading ? (
          <div className="text-center text-gray-500 py-20 font-mono uppercase tracking-widest">
            Loading...
          </div>
        ) : failed ? (
          <div className="max-w-7xl mx-auto py-20">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              About
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Couldn&apos;t reach the server. Try again in a moment.
            </p>
          </div>
        ) : (
          <>
            {/* Page header */}
            <motion.div {...RISE} className="max-w-7xl mx-auto mb-16">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                {about?.name || 'About'}
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                {[about?.role, about?.location].filter(Boolean).join(' — ')}
              </p>
            </motion.div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              {/* LEFT COLUMN: photo + quick facts */}
              <motion.aside
                {...RISE}
                transition={{ ...RISE.transition, delay: 0.05 }}
                className="lg:col-span-5"
              >
                <div className="lg:sticky lg:top-32">
                  <Portrait src={asset(about?.portrait_url)} alt={about?.portrait_alt} />

                  {facts.length > 0 && (
                    <dl className="mt-8">
                      {facts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-baseline justify-between gap-6 border-b border-white/10 py-3"
                        >
                          <dt className="text-xs font-bold uppercase tracking-widest text-neutral-400 shrink-0">
                            {fact.label}
                          </dt>
                          <dd className="text-sm text-white text-right">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {socials.length > 0 && (
                    <ul className="mt-8 flex flex-wrap gap-3">
                      {socials.map((social) => (
                        <li key={social.label}>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-300 bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded hover:text-white hover:border-white/30 transition-colors"
                          >
                            {social.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.aside>

              {/* RIGHT COLUMN: bio, services, gear */}
              <div className="lg:col-span-7 flex flex-col gap-16">
                {bio.length > 0 && (
                  <motion.section {...RISE} transition={{ ...RISE.transition, delay: 0.1 }}>
                    <SectionTitle>Profile</SectionTitle>
                    <div className="flex flex-col gap-5">
                      {bio.map((paragraph, i) => (
                        <p
                          key={i}
                          className={
                            i === 0
                              ? 'text-lg md:text-xl text-gray-200 leading-relaxed'
                              : 'text-base text-gray-400 leading-relaxed'
                          }
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.section>
                )}

                {services.length > 0 && (
                  <motion.section {...RISE} transition={{ ...RISE.transition, delay: 0.15 }}>
                    <SectionTitle>What I shoot</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div
                          key={service.title}
                          className="p-6 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-white/10 hover:border-white/25 transition-colors"
                        >
                          <h3 className="text-lg font-bold text-white">{service.title}</h3>
                          {service.description && (
                            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {gear.length > 0 && (
                  <motion.section {...RISE} transition={{ ...RISE.transition, delay: 0.2 }}>
                    <SectionTitle>Kit</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                      {gear.map((group) => (
                        <div key={group.category}>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                            {group.category}
                          </h3>
                          <ul className="flex flex-col gap-1">
                            {list(group.items).map((item) => (
                              <li key={item} className="text-sm text-gray-300">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            </div>

            {/* CALL TO ACTION */}
            {cta && (
              <motion.section
                {...RISE}
                transition={{ ...RISE.transition, delay: 0.25 }}
                className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/10 text-center"
              >
                {cta.heading && (
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                    {cta.heading}
                  </h2>
                )}
                {cta.text && (
                  <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">{cta.text}</p>
                )}
                {cta.label &&
                  cta.href &&
                  (cta.href.startsWith('/') ? (
                    <Link
                      to={cta.href}
                      className="inline-block px-10 py-4 bg-white/90 backdrop-blur-sm text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-2xl hover:scale-105"
                    >
                      {cta.label}
                    </Link>
                  ) : (
                    <a
                      href={cta.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-10 py-4 bg-white/90 backdrop-blur-sm text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-2xl hover:scale-105"
                    >
                      {cta.label}
                    </a>
                  ))}
              </motion.section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
