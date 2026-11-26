import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  Search,
  X,
  Sparkles,
  Star,
  Calendar,
  Globe,
  Layers,
  BarChart3,
  Target,
  Gem,
  Sliders,
  Compass,
  ArrowLeftRight,
  Cpu,
  Film,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import ShowDetailModal from '../components/ShowDetailModal';
import GenreIcon from '../components/GenreIcon';
import { recommend } from '../utils/recommend';
import { countryName, formatRuntimeLabel } from '../utils/helpers';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';

const AI_MODES = [
  { value: 'balanced', label: 'Balanced', icon: Cpu, desc: 'Best overall match across all factors' },
  { value: 'genre', label: 'Genre Focus', icon: Sliders, desc: 'Prioritize same and similar genres' },
  { value: 'hidden_gems', label: 'Hidden Gems', icon: Gem, desc: 'Find underappreciated masterpieces' },
  { value: 'global', label: 'Go Global', icon: Compass, desc: 'Discover shows from other countries' },
];

const BAR_COLORS = ['#e50914', '#ff4d4d', '#a855f7', '#8b5cf6', '#6366f1'];

export default function Recommend({ shows, loading }) {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [aiMode, setAiMode] = useState('balanced');
  const [selectedShow, setSelectedShow] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const titleFromUrl = params.get('title');
    if (titleFromUrl && shows.length > 0) {
      const found = shows.find(s => s.title.toLowerCase() === titleFromUrl.toLowerCase());
      if (found) {
        setSelected(found);
        setQuery(found.title);
        setIsAnimating(true);
        setHasSearched(true);
        const timer = setTimeout(() => {
          const recs = recommend(found.title, shows, { topN: 5, mode: aiMode });
          setResults(recs);
          setIsAnimating(false);
        }, 900);
        return () => clearTimeout(timer);
      }
    }
  }, [params, shows]);

  // GSAP stagger reveal whenever recommendation results populate
  useEffect(() => {
    if (!results.length || isAnimating || !resultsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.rec-result-col', {
        y: 32,
        opacity: 0,
        scale: 0.94,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      });
      gsap.from('.rec-factor-card', {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        delay: 0.25,
        ease: 'power2.out',
      });
    }, resultsRef);

    return () => ctx.revert();
  }, [results, isAnimating]);

  const suggestions = useMemo(() => {
    if (query.length < 2 || selected) return [];
    const q = query.toLowerCase();
    return shows.filter(s => s.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query, shows, selected]);

  const handleSelect = (show) => {
    setSelected(show);
    setQuery(show.title);
    setResults([]);
    setHasSearched(false);
  };

  const handleRecommend = () => {
    if (!selected) return;
    setIsAnimating(true);
    setHasSearched(true);

    setTimeout(() => {
      const recs = recommend(selected.title, shows, { topN: 5, mode: aiMode });
      setResults(recs);
      setIsAnimating(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }, 950);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    setResults([]);
    setHasSearched(false);
  };

  const radarData = useMemo(() => {
    if (!selected) return [];
    return [
      { metric: 'Score', value: selected.score / 10 },
      { metric: 'Popularity', value: Math.min(selected.votes / 1000000, 1) },
      { metric: 'Seasons', value: Math.min(selected.seasons / 15, 1) },
      { metric: 'Year', value: (selected.year - 1960) / 65 },
      { metric: 'Duration', value: Math.min(selected.duration / 90, 1) },
    ];
  }, [selected]);

  const barData = useMemo(() => {
    return results.map(r => ({
      name: r.title.length > 18 ? r.title.slice(0, 18) + '…' : r.title,
      match: r.matchPercent,
      fullTitle: r.title,
    }));
  }, [results]);

  if (loading) {
    return (
      <div className="pt-28 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
        <div className="shimmer-card h-12 w-96 rounded-xl mb-4" />
        <div className="shimmer-card h-6 w-72 rounded-lg mb-8" />
        <div className="shimmer-card h-64 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="shimmer-card aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeModeObj = AI_MODES.find(m => m.value === aiMode);

  return (
    <div className="pt-28 pb-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Neural Similarity Engine
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">
          AI <span className="netflix-gradient-text">Matchmaker</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Select any movie or TV series across {shows.length} global titles. Our multi-factor recommendation engine analyzes genre affinity,
          language, critical acclaim, and narrative themes to find your next favorite watch.
        </p>
      </motion.div>

      {/* Search & AI Mode Panel */}
      <motion.div
        className="glass-panel-glow p-6 sm:p-8 mb-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-bl from-red-600/5 to-transparent pointer-events-none" />

        {/* Search Input */}
        <div className="relative z-10">
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">
            Step 1 — Choose a show you love
          </label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); setResults([]); setHasSearched(false); }}
              placeholder="Search any movie or series (e.g. RRR, Breaking Bad, 3 Idiots, Parasite)..."
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-black/40 border border-white/15 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-30 left-0 right-0 top-full mt-2 rounded-2xl bg-[#12121e]/98 backdrop-blur-2xl border border-white/15 overflow-hidden shadow-2xl shadow-black/60"
                >
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#1a1a28] flex-shrink-0 border border-white/10">
                        {s.posterMedium ? (
                          <img src={s.posterMedium} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <GenreIcon genre={s.genre} className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{s.title}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {s.score}
                          <span>·</span> {s.year}
                          <span>·</span> <span className="capitalize">{s.genre}</span>
                          <span>·</span> {s.language || s.country}
                          <span>·</span> {s.type || 'Series'}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Show Preview */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/15 bg-[#161622]">
                  {selected.poster ? (
                    <img src={selected.poster} alt={selected.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center text-white">
                      <GenreIcon genre={selected.genre} className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-black text-xl sm:text-2xl truncate">{selected.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-400">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" /> {selected.score}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> {selected.year}
                    </span>
                    <span className="capitalize inline-flex items-center gap-1">
                      <GenreIcon genre={selected.genre} className="w-3.5 h-3.5 text-red-400" /> {selected.genre}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" /> {selected.language || countryName(selected.country)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> {formatRuntimeLabel(selected)} ({selected.type || 'Series'})
                    </span>
                  </div>
                  {selected.summary && (
                    <p className="text-gray-400 text-xs sm:text-sm mt-2 line-clamp-2">{selected.summary}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Mode Selector */}
        <div className="mt-6">
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">
            Step 2 — Choose AI analysis mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AI_MODES.map(m => {
              const ModeIcon = m.icon;
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    setAiMode(m.value);
                    if (hasSearched && selected) {
                      const recs = recommend(selected.title, shows, { topN: 5, mode: m.value });
                      setResults(recs);
                    }
                  }}
                  className={`p-3.5 rounded-xl text-left transition-all border ${
                    aiMode === m.value
                      ? 'bg-red-600/15 border-red-500/50 shadow-lg shadow-red-600/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ModeIcon className={`w-4 h-4 ${aiMode === m.value ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className="text-sm font-bold text-white">{m.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommend Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleRecommend}
            disabled={!selected || isAnimating}
            className={`btn-netflix px-10 py-4 text-base sm:text-lg font-black flex items-center gap-2.5 ${
              !selected ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            {isAnimating ? 'Analyzing Vectors...' : 'Find My Perfect Match'}
          </button>
        </div>
      </motion.div>

      {/* Loading Animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              className="w-24 h-24 mx-auto rounded-full border-4 border-red-900/30 border-t-[#e50914]"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-6 text-gray-300 text-lg font-medium animate-pulse">
              Analyzing genre affinity, scores, era &amp; narrative themes...
            </p>
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {['Genre', 'Score', 'Country', 'Era', 'Themes'].map((f, i) => (
                <motion.span
                  key={f}
                  className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                >
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ RESULTS ════════ */}
      <div ref={resultsRef}>
        {results.length > 0 && !isAnimating && (
          <div>
            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Shows Similar to <span className="netflix-gradient-text">{selected?.title}</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  AI Mode: {activeModeObj?.label}
                </p>
              </div>
              <button
                onClick={() => { setResults([]); setHasSearched(false); }}
                className="btn-secondary-glass px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" /> New Search
              </button>
            </div>

            {/* Result Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5 mb-12">
              {results.map((s) => (
                <div key={s.id} className="rec-result-col flex flex-col gap-2">
                  <MovieCard show={s} onSelect={setSelectedShow} showMatch />
                  {s.reasons && s.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {s.reasons.map((r, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/10 text-gray-400 leading-tight"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ════════ ANALYSIS SECTION ════════ */}
            <div>
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-purple-600/15 border border-purple-500/25 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                AI Analysis Breakdown
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Similarity Bar Chart */}
                <div className="glass-panel p-5 sm:p-6">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-400" /> Match Scores
                  </h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 5, right: 25, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                      <YAxis dataKey="name" type="category" width={115} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                        formatter={(val, _, props) => [`${val}% match`, props.payload.fullTitle]}
                      />
                      <Bar dataKey="match" radius={[0, 8, 8, 0]} barSize={18}>
                        {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Chart for Selected Show */}
                <div className="glass-panel p-5 sm:p-6">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" /> "{selected?.title}" Profile
                  </h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 1]} />
                      <Tooltip contentStyle={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                      <Radar dataKey="value" stroke="#e50914" fill="#e50914" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Factor Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {results.map((r, i) => (
                  <div key={r.id} className="rec-factor-card glass-panel p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1 rounded-r" style={{ background: BAR_COLORS[i] }} />
                    <div className="pl-3">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">#{i + 1} Match</span>
                      <h5 className="text-sm font-bold text-white truncate mt-0.5">{r.title}</h5>
                      <div className="text-2xl font-black mt-1" style={{ color: BAR_COLORS[i] }}>
                        {r.matchPercent}%
                      </div>
                      <div className="mt-2 space-y-1.5 text-[10px]">
                        {r.factors && Object.entries(r.factors).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-gray-500 w-16 capitalize">{key.replace('Sim', '')}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-purple-500" style={{ width: `${val}%` }} />
                            </div>
                            <span className="text-gray-400 w-7 text-right">{val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {hasSearched && !isAnimating && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No recommendations found. Try a different show!</p>
          </motion.div>
        )}
      </div>

      {/* How It Works */}
      {!hasSearched && !selected && (
        <motion.div
          className="mt-8 glass-panel p-8 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-black text-white mb-8 text-center">How Our Engine Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Search', desc: 'Find a show you love from 246 Netflix titles' },
              { icon: Cpu, title: 'Vectorize', desc: 'Extracts genre, region, acclaim, era & themes' },
              { icon: Sparkles, title: 'Score', desc: 'Multi-factor similarity ranks all candidates' },
              { icon: Target, title: 'Match', desc: 'Top 5 results with match % and reasoning' },
            ].map(({ icon: StepIcon, title, desc }, i) => (
              <motion.div
                key={title}
                className="text-center p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mx-auto mb-3 text-red-400">
                  <StepIcon className="w-7 h-7" />
                </div>
                <h4 className="text-white font-bold mb-1">{title}</h4>
                <p className="text-gray-500 text-sm leading-snug">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
