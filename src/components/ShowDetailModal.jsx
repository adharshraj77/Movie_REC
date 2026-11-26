import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Globe, Layers, Sparkles, Languages, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { countryName, formatVotes, formatRuntimeLabel } from '../utils/helpers';
import GenreIcon from './GenreIcon';

export default function ShowDetailModal({ show, isOpen, onClose }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [show]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !show) return null;

  const handleRecommend = () => {
    onClose();
    navigate(`/recommend?title=${encodeURIComponent(show.title)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl glass-panel-glow border border-white/15 bg-[#101018] shadow-2xl text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all border border-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-br from-red-950/40 via-purple-950/30 to-black">
            {show.poster && (
              <img
                src={show.poster}
                alt={show.title}
                className="w-full h-full object-cover object-top opacity-50 filter blur-sm scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101018] via-[#101018]/60 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
              <div className="w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 flex-shrink-0 bg-[#161622]">
                {(show.poster || show.posterMedium) && !imgError ? (
                  <img
                    src={show.poster || show.posterMedium}
                    alt={show.title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-red-950/60 via-purple-950/40 to-black text-center">
                    <GenreIcon genre={show.genre} className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-xs font-bold text-white line-clamp-2">{show.title}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e50914] text-white flex items-center gap-1 shadow-lg shadow-red-600/30">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {show.score}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-600/30 border border-purple-400/30 text-purple-200 inline-flex items-center gap-1">
                    <Film className="w-3 h-3" /> {show.type || 'Series'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-gray-200 capitalize inline-flex items-center gap-1.5">
                    <GenreIcon genre={show.genre} className="w-3 h-3 text-red-400" /> {show.genre}
                  </span>
                  {show.language && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-gray-200 inline-flex items-center gap-1.5">
                      <Languages className="w-3 h-3 text-amber-400" /> {show.language}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-md truncate">
                  {show.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {show.year} · {formatRuntimeLabel(show)} · {countryName(show.country)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRecommend}
                className="btn-netflix px-6 py-2.5 flex items-center gap-2 text-sm sm:text-base font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                Find Similar Titles (AI)
              </button>
              <button
                onClick={onClose}
                className="btn-secondary-glass px-5 py-2.5 text-sm sm:text-base font-medium"
              >
                Close Details
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {show.summary ||
                  `A critically acclaimed ${show.language || ''} ${show.genre} ${(show.type || 'series').toLowerCase()} from ${countryName(show.country)}, rated ${show.score}/10 by ${formatVotes(show.votes)} viewers.`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> IMDb Score
                </span>
                <span className="text-lg font-bold text-white">{show.score} / 10</span>
                <span className="block text-[11px] text-gray-500">({formatVotes(show.votes)} votes)</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Released
                </span>
                <span className="text-lg font-bold text-white">{show.year}</span>
                <span className="block text-[11px] text-gray-500">Release year</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Format
                </span>
                <span className="text-lg font-bold text-white">{formatRuntimeLabel(show)}</span>
                <span className="block text-[11px] text-gray-500">{show.type || 'Series'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Language &amp; Origin
                </span>
                <span className="text-lg font-bold text-white truncate block">{show.language || show.country}</span>
                <span className="block text-[11px] text-gray-500 truncate">{countryName(show.country)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
