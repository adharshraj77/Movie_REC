import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  ArrowUpDown,
  RotateCcw,
  Film,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import ShowDetailModal from '../components/ShowDetailModal';
import { filterShows } from '../utils/recommend';
import { getUniqueGenres, getUniqueCountries, getUniqueLanguages, countryName } from '../utils/helpers';

const SORTS = [
  { value: 'votes-desc', label: 'Most Popular' },
  { value: 'rating-desc', label: 'Rating High–Low' },
  { value: 'rating-asc', label: 'Rating Low–High' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'A to Z' },
];

const TYPES = [
  { value: '', label: 'All Titles' },
  { value: 'Movie', label: 'Movies' },
  { value: 'Series', label: 'TV Series' },
];

function ShimmerGrid({ count = 18 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="shimmer-card w-full aspect-[2/3] rounded-xl" />
      ))}
    </div>
  );
}

export default function Explore({ shows, loading }) {
  const [params, setParams] = useSearchParams();
  const gridRef = useRef(null);

  const [search, setSearch] = useState(params.get('search') || '');
  const [genre, setGenre] = useState(params.get('genre') || '');
  const [language, setLanguage] = useState(params.get('language') || '');
  const [type, setType] = useState(params.get('type') || '');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('votes-desc');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(10);
  const [minYear, setMinYear] = useState(1960);
  const [maxYear, setMaxYear] = useState(2026);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedShow, setSelectedShow] = useState(null);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    const urlSearch = params.get('search');
    const urlGenre = params.get('genre');
    const urlLanguage = params.get('language');
    const urlType = params.get('type');
    if (urlSearch !== null) setSearch(urlSearch);
    if (urlGenre !== null) setGenre(urlGenre);
    if (urlLanguage !== null) setLanguage(urlLanguage);
    if (urlType !== null) setType(urlType);
  }, [params]);

  const genres = useMemo(() => getUniqueGenres(shows), [shows]);
  const countries = useMemo(() => getUniqueCountries(shows), [shows]);
  const languages = useMemo(() => getUniqueLanguages(shows), [shows]);

  const filtered = useMemo(
    () => filterShows(shows, { genre, country, language, type, minRating, maxRating, minYear, maxYear, search, sortBy }),
    [shows, genre, country, language, type, minRating, maxRating, minYear, maxYear, search, sortBy]
  );

  useEffect(() => {
    setVisibleCount(60);
  }, [genre, country, language, type, minRating, maxRating, minYear, maxYear, search, sortBy]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  useEffect(() => {
    if (loading || !gridRef.current || !visibleItems.length) return;
    const cards = gridRef.current.querySelectorAll('.movie-card-item');
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(cards).slice(0, 60),
        { y: 20, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.38,
          stagger: { amount: 0.3, from: 'start' },
          ease: 'power3.out',
          overwrite: true,
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [loading, genre, country, language, type, sortBy, search]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setGenre('');
    setLanguage('');
    setType('');
    setCountry('');
    setSortBy('votes-desc');
    setMinRating(0);
    setMaxRating(10);
    setMinYear(1960);
    setMaxYear(2026);
    setParams({});
  }, [setParams]);

  const hasFilters = search || genre || language || type || country || minRating > 0 || maxRating < 10 || minYear > 1960 || maxYear < 2026;

  if (loading) {
    return (
      <div className="pt-28 px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <ShimmerGrid />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-600/15 border border-red-500/25 text-red-500">
              <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
            Explore <span className="netflix-gradient-text">Global Catalog</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Browse movies and TV series across {languages.length} languages and {countries.length} countries ({shows.length} total titles)
          </p>
        </div>

        {/* Type Switcher Pills */}
        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start">
          {TYPES.map(t => (
            <button
              key={t.value || 'all'}
              onClick={() => setType(t.value)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                type === t.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search movies, series, languages (e.g. Telugu, Hindi, Spanish, Korean)..."
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-base placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all backdrop-blur-md"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Language Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setLanguage('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            language === ''
              ? 'bg-red-600/25 border-red-500/50 text-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          All Languages
        </button>
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang === language ? '' : lang)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              language === lang
                ? 'bg-purple-600/30 border-purple-400/50 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setFiltersOpen(o => !o)}
        className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {filtersOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
      </button>

      {/* Filters Panel */}
      {filtersOpen && (
        <motion.div
          className="glass-panel p-5 sm:p-6 mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wider">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wider">Genre</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wider">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{countryName(c)} ({c})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wider">
                Rating: <span className="text-white">{minRating.toFixed(1)}</span> – <span className="text-white">{maxRating.toFixed(1)}</span>
              </label>
              <div className="flex gap-3 items-center pt-2">
                <input type="range" min="0" max="10" step="0.1" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} className="flex-1 accent-[#e50914] h-1.5" />
                <input type="range" min="0" max="10" step="0.1" value={maxRating} onChange={e => setMaxRating(parseFloat(e.target.value))} className="flex-1 accent-[#8b5cf6] h-1.5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wider">
                Year: <span className="text-white">{minYear}</span> – <span className="text-white">{maxYear}</span>
              </label>
              <div className="flex gap-3 items-center pt-2">
                <input type="range" min="1960" max="2026" step="1" value={minYear} onChange={e => setMinYear(parseInt(e.target.value))} className="flex-1 accent-[#e50914] h-1.5" />
                <input type="range" min="1960" max="2026" step="1" value={maxYear} onChange={e => setMaxYear(parseInt(e.target.value))} className="flex-1 accent-[#8b5cf6] h-1.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-white/5">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === s.value
                    ? 'bg-red-600/20 border-red-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-red-400 hover:text-red-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Result Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-bold">{visibleItems.length}</span> of{' '}
          <span className="text-white font-bold">{filtered.length}</span> matching title{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No movies or series match your filters</p>
          <button onClick={clearFilters} className="btn-netflix mt-6 px-6 py-2.5 text-sm">
            Reset Filters
          </button>
        </motion.div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          >
            {visibleItems.map((s) => (
              <MovieCard key={s.id} show={s} onSelect={setSelectedShow} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setVisibleCount(c => c + 60)}
                className="btn-netflix px-7 py-3 text-sm font-bold"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
              <button
                onClick={() => setVisibleCount(filtered.length)}
                className="btn-secondary-glass px-6 py-3 text-sm font-semibold"
              >
                Show All ({filtered.length})
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <ShowDetailModal
        show={selectedShow}
        isOpen={!!selectedShow}
        onClose={() => setSelectedShow(null)}
      />
    </div>
  );
}
