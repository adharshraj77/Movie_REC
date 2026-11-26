import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  Star,
  Play,
  ArrowRight,
  Flame,
  Clock,
  Globe,
  Cpu,
  Layers,
  Clapperboard,
  Film,
  Languages,
} from 'lucide-react';
import MovieRow from '../components/MovieRow';
import ShowDetailModal from '../components/ShowDetailModal';
import ThreeHeroScene from '../components/ThreeHeroScene';
import GenreIcon from '../components/GenreIcon';
import { getUniqueGenres, getUniqueLanguages, countryName, formatVotes, formatRuntimeLabel } from '../utils/helpers';

gsap.registerPlugin(ScrollTrigger);

function ShimmerRows() {
  return (
    <div className="pt-28 px-4 sm:px-8 lg:px-12 space-y-8 max-w-[1700px] mx-auto">
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="shimmer-card h-6 w-48 rounded-lg mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }, (_, j) => (
              <div key={j} className="shimmer-card w-44 aspect-[2/3] rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home({ shows, loading }) {
  const [selectedShow, setSelectedShow] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const pageRef = useRef(null);
  const genreSectionRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollY } = useScroll();
  const bgParallaxY = useTransform(scrollY, [0, 800], [0, 180]);
  const bgScale = useTransform(scrollY, [0, 800], [1.05, 1.18]);
  const contentParallaxY = useTransform(scrollY, [0, 700], [0, 60]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { stiffness: 180, damping: 20 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 180, damping: 20 });

  // Showcase a diverse global hero carousel (Breaking Bad, top Telugu/Hindi/English/Spanish hits)
  const featuredShows = useMemo(() => {
    if (!shows.length) return [];
    const picks = [];
    const want = ['Breaking Bad', 'RRR', '3 Idiots', 'Parasite', 'Dark', 'Arcane'];
    for (const title of want) {
      const found = shows.find(s => s.title.toLowerCase() === title.toLowerCase());
      if (found) picks.push(found);
    }
    if (picks.length < 5) {
      for (const s of shows) {
        if (!picks.some(p => p.id === s.id)) picks.push(s);
        if (picks.length >= 5) break;
      }
    }
    return picks.slice(0, 6);
  }, [shows]);

  const hero = featuredShows[heroIndex] || shows[0] || null;

  useEffect(() => {
    if (featuredShows.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % featuredShows.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredShows.length]);

  useEffect(() => {
    if (loading || !shows.length) return;

    const ctx = gsap.context(() => {
      gsap.from('.telemetry-strip', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        delay: 0.15,
      });

      if (genreSectionRef.current) {
        gsap.from(genreSectionRef.current.querySelectorAll('.genre-chip'), {
          y: 20,
          scale: 0.92,
          opacity: 0,
          duration: 0.5,
          stagger: 0.035,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: genreSectionRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }

      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          y: 45,
          scale: 0.96,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading, shows.length]);

  const handleHeroMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    const nx = (clientX / width - 0.5) * 2;
    const ny = (clientY / height - 0.5) * 2;
    tiltY.set(nx * 9);
    tiltX.set(-ny * 9);
  };

  const handleHeroMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const trending = useMemo(
    () => [...shows].sort((a, b) => b.votes - a.votes).slice(0, 20),
    [shows]
  );

  const blockbusterMovies = useMemo(
    () => [...shows].filter(s => s.type === 'Movie').sort((a, b) => b.votes - a.votes).slice(0, 20),
    [shows]
  );

  const teluguCinema = useMemo(
    () => [...shows].filter(s => s.language === 'Telugu').sort((a, b) => b.votes - a.votes).slice(0, 20),
    [shows]
  );

  const hindiCinema = useMemo(
    () => [...shows].filter(s => s.language === 'Hindi').sort((a, b) => b.votes - a.votes).slice(0, 20),
    [shows]
  );

  const spanishAndGlobal = useMemo(
    () => [...shows].filter(s => ['Spanish', 'Korean', 'Japanese', 'French', 'German', 'Italian'].includes(s.language)).sort((a, b) => b.votes - a.votes).slice(0, 20),
    [shows]
  );

  const topRatedSeries = useMemo(
    () => [...shows].filter(s => s.type === 'Series').sort((a, b) => b.score - a.score).slice(0, 20),
    [shows]
  );

  const genres = useMemo(() => getUniqueGenres(shows), [shows]);
  const languages = useMemo(() => getUniqueLanguages(shows), [shows]);

  if (loading) return <ShimmerRows />;

  return (
    <div ref={pageRef} className="pb-8">
      {/* ════════ THREE.JS + PARALLAX 3D HERO SECTION ════════ */}
      {hero && (
        <section
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative min-h-[92vh] pt-24 flex items-end overflow-hidden"
        >
          <ThreeHeroScene />

          <AnimatePresence mode="wait">
            {hero.poster && (
              <motion.img
                key={hero.id}
                src={hero.poster}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{ y: bgParallaxY, scale: bgScale }}
                className="absolute inset-0 w-full h-full object-cover object-top filter blur-[3px] pointer-events-none"
              />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[#06060a] via-[#06060a]/70 to-[#06060a]/30 pointer-events-none z-[2]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06060a]/95 via-[#06060a]/45 to-transparent pointer-events-none z-[2]" />

          <motion.div
            style={{ y: contentParallaxY }}
            className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 pb-16 sm:pb-20 w-full"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 lg:gap-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hero.id}
                  className="flex-1"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e50914]/20 text-[#ff4b55] border border-[#e50914]/35 shadow-lg shadow-red-600/10">
                      <Star className="w-3.5 h-3.5 fill-[#ff4b55]" /> #{heroIndex + 1} FEATURED {hero.type?.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-purple-300 border border-purple-500/25">
                      <Languages className="w-3.5 h-3.5 text-purple-400" />
                      {hero.language} Cinema
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight max-w-2xl mb-5 drop-shadow-2xl">
                    {hero.title}
                  </h1>

                  <p className="text-sm sm:text-lg text-gray-300 max-w-xl leading-relaxed mb-4">
                    {hero.summary
                      ? hero.summary.slice(0, 190) + (hero.summary.length > 190 ? '...' : '')
                      : `A critically acclaimed ${hero.language} ${hero.genre} ${hero.type?.toLowerCase()} with a ${hero.score}/10 score from ${formatVotes(hero.votes)} viewers worldwide.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-8">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" /> {hero.score}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{hero.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="capitalize inline-flex items-center gap-1.5">
                      <GenreIcon genre={hero.genre} className="w-4 h-4 text-red-400" />
                      {hero.genre}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{formatRuntimeLabel(hero)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" />
                      {countryName(hero.country)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/recommend?title=${encodeURIComponent(hero.title)}`}
                      className="btn-netflix px-7 py-3 text-sm sm:text-base flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> AI Match This Title
                    </Link>
                    <Link
                      to="/explore"
                      className="btn-secondary-glass px-7 py-3 text-sm sm:text-base flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Explore Global Catalog
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Right: Interactive 3D Poster Showcase */}
              <div className="flex items-end gap-4 self-center lg:self-end" style={{ perspective: 1200 }}>
                <div className="hidden sm:flex flex-col gap-2.5">
                  {featuredShows.map((s, i) => (
                    <motion.button
                      key={s.id}
                      onClick={() => setHeroIndex(i)}
                      whileHover={{ scale: 1.08, x: -4 }}
                      className={`w-14 h-20 lg:w-16 lg:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        i === heroIndex
                          ? 'border-red-500 shadow-lg shadow-red-600/40 scale-105'
                          : 'border-white/15 opacity-55 hover:opacity-100'
                      }`}
                      title={s.title}
                    >
                      {s.posterMedium ? (
                        <img src={s.posterMedium} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-purple-900/50 flex items-center justify-center text-white text-[10px] font-bold p-1">
                          {s.title}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {hero.poster && (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, scale: 0.94, rotateY: 12 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.94, rotateY: -12 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        rotateX: smoothTiltX,
                        rotateY: smoothTiltY,
                        transformStyle: 'preserve-3d',
                      }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setSelectedShow(hero)}
                      className="w-52 sm:w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl shadow-red-900/40 cursor-pointer relative group"
                    >
                      <img src={hero.poster} alt={hero.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider inline-flex items-center gap-1">
                          View details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#06060a] to-transparent pointer-events-none z-[3]" />
        </section>
      )}

      {/* ════════ LIVE TELEMETRY STRIP ════════ */}
      <div className="telemetry-strip max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 -mt-4 mb-6 relative z-20">
        <div className="glass-panel px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-semibold text-white">{shows.length}</span> Global Movies &amp; Series
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Languages className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">{languages.length}</span> Languages Including Telugu, Hindi, Spanish &amp; Korean
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Cpu className="w-4 h-4 text-amber-400" />
            Cross-Language AI Matchmaker
          </div>
          <Link to="/recommend" className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 transition-colors">
            Launch AI Engine <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ════════ GLOBAL CONTENT ROWS ════════ */}
      <MovieRow title="Trending Worldwide" subtitle="Most voted movies & series across the globe" shows={trending} icon={Flame} onSelect={setSelectedShow} />
      <MovieRow title="Blockbuster Movies" subtitle="Top global feature films" shows={blockbusterMovies} icon={Film} onSelect={setSelectedShow} />
      <MovieRow title="Telugu Cinema" subtitle="Tollywood epics, dramas, action & classics" shows={teluguCinema} icon={Sparkles} onSelect={setSelectedShow} />
      <MovieRow title="Hindi Cinema & Series" subtitle="Bollywood favorites & acclaimed Indian series" shows={hindiCinema} icon={Clapperboard} onSelect={setSelectedShow} />
      <MovieRow title="Spanish, Korean & World Hits" subtitle="International cinema from Spain, Korea, Japan, France & beyond" shows={spanishAndGlobal} icon={Globe} onSelect={setSelectedShow} />
      <MovieRow title="Top Rated Series" subtitle="Highest-rated TV shows on IMDb" shows={topRatedSeries} icon={Star} onSelect={setSelectedShow} />

      {/* ════════ BROWSE BY LANGUAGE & GENRE ════════ */}
      <section ref={genreSectionRef} className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5 flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-600/15 border border-red-500/25 text-red-400">
              <Languages className="w-5 h-5" />
            </span>
            Explore by Language
          </h2>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => {
              const count = shows.filter(s => s.language === lang).length;
              return (
                <Link
                  key={lang}
                  to={`/explore?language=${encodeURIComponent(lang)}`}
                  className="genre-chip inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600/20 hover:border-purple-500/40 hover:-translate-y-0.5 transition-all text-sm text-gray-200 hover:text-white font-semibold group shadow-md"
                >
                  <Globe className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  <span>{lang}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300">({count})</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5 flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-purple-600/15 border border-purple-500/25 text-purple-400">
              <Layers className="w-5 h-5" />
            </span>
            Browse by Genre
          </h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((g) => {
              const count = shows.filter(s => s.genre === g).length;
              return (
                <Link
                  key={g}
                  to={`/explore?genre=${g}`}
                  className="genre-chip inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/40 hover:-translate-y-0.5 transition-all text-sm text-gray-200 hover:text-white font-medium group shadow-md"
                >
                  <GenreIcon genre={g} className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  <span className="capitalize">{g}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300">({count})</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ AI CTA BANNER ════════ */}
      <section className="px-4 sm:px-8 lg:px-12 py-16">
        <div
          ref={ctaRef}
          className="glass-panel-glow rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-purple-600/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/25 to-purple-600/25 border border-white/15 mb-5">
              <Sparkles className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Find Your Next <span className="netflix-gradient-text">Obsession</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Match any Telugu, Hindi, Spanish, Korean, Japanese, or Hollywood movie or TV series with our
              multi-factor AI recommendation engine.
            </p>
            <Link
              to="/recommend"
              className="btn-netflix inline-flex items-center gap-2 px-8 py-3.5 text-base sm:text-lg font-bold"
            >
              <Sparkles className="w-5 h-5" />
              Try AI Matchmaker
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <ShowDetailModal
        show={selectedShow}
        isOpen={!!selectedShow}
        onClose={() => setSelectedShow(null)}
      />
    </div>
  );
}
