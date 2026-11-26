import { Link } from 'react-router-dom';
import { Home, Compass, Sparkles, Film } from 'lucide-react';

export default function Footer({ totalCount = 0 }) {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-16 bg-[#06060a]/85 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e50914] to-[#8b5cf6] flex items-center justify-center shadow-lg">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-wider">
                  CINE<span className="text-[#e50914]">MATCH</span>
                </span>
                <span className="text-purple-400 text-[9px] font-bold uppercase tracking-widest ml-1.5">AI</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              AI-powered movie and TV show recommendations using multi-factor similarity analysis.
              Built with React, GSAP, Three.js, Vanta, and Tailwind CSS.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Navigate</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-gray-400" /> Home
              </Link>
              <Link to="/explore" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-gray-400" /> Explore Catalog
              </Link>
              <Link to="/recommend" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-red-400" /> AI Matchmaker
              </Link>
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Architecture</h4>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'GSAP', 'Three.js', 'Vanta.js', 'Framer Motion', 'Tailwind CSS', 'Recharts', 'PapaParse'].map(tech => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-gray-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} CINEMATCH AI — Client-Side Neural Discovery
          </p>
          <p className="text-[10px] text-gray-700">
            Catalog: {totalCount || 'Global'} Movies &amp; Series · Imagery: IMDb &amp; TVmaze
          </p>
        </div>
      </div>
    </footer>
  );
}
