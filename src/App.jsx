import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navbar from './components/Navbar';
import VantaBackground from './components/VantaBackground';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Recommend from './pages/Recommend';
import Footer from './components/Footer';
import { inferLanguage } from './utils/helpers';

function parseCsvPromise(url) {
  return new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete(results) {
        resolve(results.data || []);
      },
      error() {
        resolve([]);
      },
    });
  });
}

export default function App() {
  const [shows, setShows] = useState([]);
  const [posters, setPosters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/posters.json').then(r => r.json()).catch(() => ({})),
      parseCsvPromise('/Best_Shows_Netflix.csv'),
      parseCsvPromise('/Global_Catalog.csv'),
    ]).then(([posterData, baseRows, globalRows]) => {
      setPosters(posterData || {});

      const seen = new Set();
      const combined = [...baseRows, ...globalRows]
        .filter(r => r.TITLE && r.TITLE.trim())
        .reduce((acc, r) => {
          const title = r.TITLE.trim();
          const key = title.toLowerCase();
          if (seen.has(key)) return acc;
          seen.add(key);

          const country = (r.MAIN_PRODUCTION ?? '').trim().toUpperCase();
          const type = (r.TYPE ?? '').trim() || 'Series';
          const language = (r.LANGUAGE ?? '').trim() || inferLanguage(country);

          acc.push({
            id: acc.length,
            title,
            year: parseInt(r.RELEASE_YEAR) || 0,
            score: parseFloat(r.SCORE) || 0,
            votes: parseInt(r.NUMBER_OF_VOTES) || 0,
            duration: parseInt(r.DURATION) || 0,
            seasons: parseInt(r.NUMBER_OF_SEASONS) || 0,
            genre: (r.MAIN_GENRE ?? '').trim().toLowerCase(),
            country,
            type,
            language,
          });
          return acc;
        }, []);

      setShows(combined);
      setLoading(false);
    });
  }, []);

  const enrichedShows = shows.map(s => {
    const p = posters[s.title];
    return {
      ...s,
      poster: p?.poster || null,
      posterMedium: p?.posterMedium || null,
      summary: p?.summary || '',
      tvmazeGenres: p?.genres || [],
    };
  });

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <VantaBackground />
        <Navbar shows={enrichedShows} />
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Home shows={enrichedShows} loading={loading} />} />
            <Route path="/explore" element={<Explore shows={enrichedShows} loading={loading} />} />
            <Route path="/recommend" element={<Recommend shows={enrichedShows} loading={loading} />} />
          </Routes>
        </main>
        <Footer totalCount={enrichedShows.length} />
      </div>
    </Router>
  );
}
