import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * INQUIRIES PAGE
 *
 * Layout only. The packages, the budget options and every line of copy come
 * from the backend (portfolio-backend/rates.py -> /api/rates), so changing
 * prices or adding a package never means touching this file.
 *
 * The form posts to POST /api/inquiries, which emails it to you.
 */

const RISE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.1, 1] },
};

const EMPTY_FORM = {
  name: '',
  email: '',
  package: '',
  budget: '',
  event_date: '',
  message: '',
  website: '', // honeypot - stays empty for real people
};

const fieldClass =
  'w-full bg-neutral-900/90 border border-white/10 rounded px-4 py-3 text-white ' +
  'placeholder:text-neutral-600 focus:border-white/40 focus:outline-none transition-colors ' +
  '[color-scheme:dark]';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2';

export default function Rates() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const formRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetch(`${apiUrl}/api/rates`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rates from backend:', err);
        setLoading(false);
      });
  }, [apiUrl]);

  const list = (value) => (Array.isArray(value) ? value : []);
  const packages = list(content?.packages);
  const budgets = list(content?.budgets);
  const custom = content?.custom || null;
  const fallbackEmail = content?.fallback_email;

  // Keep the cards a sensible width whether there are one, two or five of them.
  const gridWidth =
    packages.length === 1 ? 'max-w-md' : packages.length === 2 ? 'max-w-4xl' : 'max-w-7xl';
  const gridCols =
    packages.length === 1 ? '' : packages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  const update = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  /** Package button: remember the choice, then drop the visitor on the form. */
  const choose = (label) => {
    setForm((previous) => ({ ...previous, package: label }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch(`${apiUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus('error');
        return;
      }
      setForm(EMPTY_FORM);
      setStatus('sent');
    } catch (err) {
      console.error('Error sending inquiry:', err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed background video, same as the other pages */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/bgvid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 px-6 md:px-16 pt-32 pb-20">
        {loading ? (
          <div className="text-center text-gray-500 py-20 font-mono uppercase tracking-widest">
            Loading...
          </div>
        ) : (
          <>
            {/* Page header */}
            <motion.div {...RISE} className="max-w-7xl mx-auto mb-16">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                {content?.heading || 'Inquiries'}
              </h1>
              {content?.intro && (
                <p className="text-gray-400 text-lg max-w-xl">{content.intro}</p>
              )}
            </motion.div>

            {/* Packages */}
            {packages.length > 0 && (
              <motion.div
                {...RISE}
                transition={{ ...RISE.transition, delay: 0.05 }}
                className={`${gridWidth} mx-auto grid grid-cols-1 ${gridCols} gap-6`}
              >
                {packages.map((pack) => (
                  <div
                    key={pack.name}
                    className={`flex flex-col p-8 rounded-lg bg-neutral-900/90 backdrop-blur-md border transition-colors ${
                      pack.highlight
                        ? 'border-white/40 shadow-2xl'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                      {pack.name}
                    </h2>
                    <p className="mt-3 text-3xl font-black tracking-tighter">{pack.price}</p>
                    {pack.summary && (
                      <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                        {pack.summary}
                      </p>
                    )}

                    {list(pack.includes).length > 0 && (
                      <ul className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6">
                        {list(pack.includes).map((item) => (
                          <li key={item} className="text-sm text-gray-300 flex gap-3">
                            <span className="text-neutral-600 shrink-0">—</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="button"
                      onClick={() => choose(pack.name)}
                      className={`mt-8 w-full px-6 py-3 font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                        pack.highlight
                          ? 'bg-white/90 text-black hover:bg-white'
                          : 'border border-white/20 text-white hover:border-white/50'
                      }`}
                    >
                      Choose {pack.name}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Small print: travel, and anything else that moves the price */}
            {content?.price_note && (
              <motion.p
                {...RISE}
                transition={{ ...RISE.transition, delay: 0.08 }}
                className={`${gridWidth} mx-auto mt-6 text-sm text-neutral-500 leading-relaxed`}
              >
                {content.price_note}
              </motion.p>
            )}

            {/* Something else */}
            {custom && (
              <motion.div
                {...RISE}
                transition={{ ...RISE.transition, delay: 0.1 }}
                className={`${gridWidth} mx-auto mt-10 p-8 rounded-lg border border-dashed border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6`}
              >
                <div>
                  <h2 className="text-lg font-bold text-white">{custom.title}</h2>
                  {custom.text && (
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">{custom.text}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => choose(custom.label || 'Custom project')}
                  className="shrink-0 px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:border-white/50 transition-colors"
                >
                  Tell me about it
                </button>
              </motion.div>
            )}

            {/* Form */}
            <motion.section
              {...RISE}
              transition={{ ...RISE.transition, delay: 0.15 }}
              ref={formRef}
              className="max-w-2xl mx-auto mt-24 scroll-mt-32"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-10 text-center">
                Get in touch
              </h2>

              {status === 'sent' ? (
                <div className="p-10 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-white/10 text-center">
                  <p className="text-xl font-bold text-white">Message sent.</p>
                  {content?.response_time && (
                    <p className="mt-3 text-gray-400">{content.response_time}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-8 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-6">
                  {/* Honeypot: hidden from people, catnip for bots */}
                  <div className="hidden" aria-hidden="true">
                    <label>
                      Website
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={update('website')}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass} htmlFor="name">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        maxLength={120}
                        value={form.name}
                        onChange={update('name')}
                        className={fieldClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        maxLength={200}
                        value={form.email}
                        onChange={update('email')}
                        className={fieldClass}
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass} htmlFor="package">
                        Package
                      </label>
                      <select
                        id="package"
                        value={form.package}
                        onChange={update('package')}
                        className={fieldClass}
                      >
                        <option value="">Not sure yet</option>
                        {packages.map((pack) => (
                          <option key={pack.name} value={pack.name}>
                            {pack.name}
                          </option>
                        ))}
                        {custom && (
                          <option value={custom.label || 'Custom project'}>
                            {custom.label || 'Custom project'}
                          </option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="event_date">
                        Date (if you have one)
                      </label>
                      <input
                        id="event_date"
                        type="date"
                        value={form.event_date}
                        onChange={update('event_date')}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {budgets.length > 0 && (
                    <div>
                      <label className={labelClass} htmlFor="budget">
                        Budget
                      </label>
                      <select
                        id="budget"
                        value={form.budget}
                        onChange={update('budget')}
                        className={fieldClass}
                      >
                        <option value="">Rather not say</option>
                        {budgets.map((budget) => (
                          <option key={budget} value={budget}>
                            {budget}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass} htmlFor="message">
                      The idea
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      maxLength={5000}
                      value={form.message}
                      onChange={update('message')}
                      className={`${fieldClass} resize-y`}
                      placeholder="What are we shooting, where, and roughly when?"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-400">
                      That didn&apos;t send.{' '}
                      {fallbackEmail ? (
                        <>
                          Email me directly at{' '}
                          <a href={`mailto:${fallbackEmail}`} className="underline">
                            {fallbackEmail}
                          </a>
                          .
                        </>
                      ) : (
                        'Try again in a moment.'
                      )}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="mt-2 px-10 py-4 bg-white/90 backdrop-blur-sm text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send inquiry'}
                  </button>

                  {content?.response_time && (
                    <p className="text-center text-xs uppercase tracking-widest text-neutral-500">
                      {content.response_time}
                    </p>
                  )}
                </form>
              )}
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
}
