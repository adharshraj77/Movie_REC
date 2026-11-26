import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Sparkles, Film } from 'lucide-react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore Catalog' },
  { to: '/recommend', label: 'AI Matchmaker', highlight: true },
];

export default function Navbar({ shows = [] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -28,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#08080c]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between h-20">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e50914] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                CINE<span className="text-[#e50914]">MATCH</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-purple-400 -mt-1">
                AI Recommendation System BY Adharsh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
            {NAV_ITEMS.map(({ to, label, highlight }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-white/10 shadow-inner'
                      : highlight
                      ? 'text-red-400 hover:text-white hover:bg-red-950/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {highlight && <Sparkles className="w-3.5 h-3.5 text-red-500" />}
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#e50914] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Search & AI CTA */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${shows.length || 'global'} movies & series...`}
              className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/15 text-white placeholder-gray-400 focus:outline-none focus:w-72 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300 backdrop-blur-md"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>

          <Link
            to="/recommend"
            className="btn-netflix px-4 py-2 text-xs sm:text-sm flex items-center gap-1.5 font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Matchmaker</span>
          </Link>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-200 font-semibold">{shows.length || '...'}</span>
            <span>Titles</span>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0c0c14]/95 border-b border-white/10 backdrop-blur-2xl px-6 py-4 flex flex-col gap-3"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all shows..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-500"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            <div className="flex flex-col gap-1 pt-2">
              {NAV_ITEMS.map(({ to, label, highlight }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    pathname === to
                      ? 'bg-red-600/20 text-white border border-red-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {highlight && <Sparkles className="w-4 h-4 text-red-500" />}
                    {label}
                  </span>
                  {pathname === to && <span className="w-2 h-2 rounded-full bg-red-500" />}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
