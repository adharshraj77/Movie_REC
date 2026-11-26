import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Sparkles, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GenreIcon from './GenreIcon';
import { formatRuntimeLabel } from '../utils/helpers';

export default function MovieCard({ show, onSelect, compact = false, showMatch = false }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 260, damping: 22, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothX, [0, 1], [-10, 10]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle 180px at ${gx} ${gy}, rgba(255,255,255,0.2), transparent 70%)`
  );

  const posterUrl = show.posterMedium || show.poster;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleRecommend = (e) => {
    e.stopPropagation();
    navigate(`/recommend?title=${encodeURIComponent(show.title)}`);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(show);
    } else {
      navigate(`/recommend?title=${encodeURIComponent(show.title)}`);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className={`movie-card-item group relative cursor-pointer select-none ${
        compact ? 'w-44 sm:w-48 flex-shrink-0' : 'w-full'
      }`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.04, y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative overflow-hidden rounded-xl bg-[#14141f] border border-white/10 shadow-lg group-hover:border-red-500/60 group-hover:shadow-2xl group-hover:shadow-red-600/25 transition-colors duration-300"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: glareBackground }}
        />

        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181824]">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 shimmer-card" />
          )}

          {posterUrl && !imgError ? (
            <img
              src={posterUrl}
              alt={show.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-950/60 via-purple-950/40 to-black text-center">
              <GenreIcon genre={show.genre} className="w-8 h-8 text-red-400 mb-2" />
              <p className="font-bold text-white text-sm line-clamp-3">{show.title}</p>
              <span className="text-[11px] text-gray-400 mt-1">{show.year}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
            <span className="flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{show.score}</span>
            </span>

            <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/10 truncate max-w-[90px]">
              {show.language && show.language !== 'English' ? show.language : show.genre}
            </span>
          </div>

          {showMatch && (show.matchPercent || show.similarity) && (
            <div className="absolute top-10 left-2.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-red-600 to-purple-600 px-2 py-0.5 text-[11px] font-black text-white shadow-lg">
                <Sparkles className="w-3 h-3" />
                {show.matchPercent || Math.round(show.similarity * 100)}% Match
              </span>
            </div>
          )}

          {/* Bottom Info Overlay */}
          <div
            className="absolute inset-x-0 bottom-0 p-3 z-10 flex flex-col justify-end"
            style={{ transform: 'translateZ(20px)' }}
          >
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-red-400 transition-colors">
              {show.title}
            </h3>

            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-300 flex-wrap">
              <span>{show.year}</span>
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span>{formatRuntimeLabel(show)}</span>
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span className="uppercase text-[10px] font-semibold text-purple-300">
                {show.type || 'Series'}
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleRecommend}
                title="Find similar titles using AI"
                className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Match AI</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelect) onSelect(show);
                }}
                title="View full details"
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium backdrop-blur-md flex items-center justify-center transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
