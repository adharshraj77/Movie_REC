import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MovieCard from './MovieCard';

gsap.registerPlugin(ScrollTrigger);

export default function MovieRow({ title, subtitle, shows, icon: Icon = Film, onSelect }) {
  const rowRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !shows?.length) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelector('.row-header'), {
        x: -28,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });

      gsap.from(el.querySelectorAll('.movie-card-item'), {
        y: 26,
        opacity: 0,
        duration: 0.55,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [shows?.length]);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!shows || !shows.length) return null;

  return (
    <section ref={sectionRef} className="relative py-6 group max-w-[1700px] mx-auto">
      {/* Row Header */}
      <div className="row-header flex items-end justify-between mb-3 px-4 sm:px-8 lg:px-12">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-600/15 border border-red-500/25 text-red-400">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1 pl-0.5">{subtitle}</p>
          )}
        </div>

        <span className="text-xs text-gray-500 font-medium">
          {shows.length} titles
        </span>
      </div>

      {/* Navigation Chevrons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 sm:left-4 top-[55%] -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-11 h-20 rounded-r-xl bg-black/75 hover:bg-red-600/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border-y border-r border-white/10"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-1 sm:right-4 top-[55%] -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-11 h-20 rounded-l-xl bg-black/75 hover:bg-red-600/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border-y border-l border-white/10"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Cards Container */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-8 lg:px-12 py-2 scroll-smooth"
      >
        {shows.map((show, idx) => (
          <MovieCard
            key={show.id || `${show.title}-${idx}`}
            show={show}
            onSelect={onSelect}
            compact
          />
        ))}
      </div>
    </section>
  );
}
