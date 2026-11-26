// Enhanced AI Content-Based Recommendation Engine (Movies + Series, Global Languages)

const GENRE_AFFINITY = {
  drama: { crime: 0.8, thriller: 0.75, war: 0.7, western: 0.65, romance: 0.65, comedy: 0.4, scifi: 0.4 },
  crime: { drama: 0.8, thriller: 0.85, action: 0.72, documentary: 0.5 },
  scifi: { action: 0.8, animation: 0.7, thriller: 0.6, drama: 0.5 },
  action: { scifi: 0.8, crime: 0.75, war: 0.7, western: 0.65, animation: 0.6, thriller: 0.7 },
  comedy: { romance: 0.65, drama: 0.45, animation: 0.55, reality: 0.4 },
  animation: { scifi: 0.7, action: 0.65, comedy: 0.6 },
  documentary: { crime: 0.6, drama: 0.5, war: 0.5 },
  war: { drama: 0.75, action: 0.72 },
  western: { drama: 0.65, crime: 0.6, action: 0.65 },
  thriller: { crime: 0.85, drama: 0.75, horror: 0.72, action: 0.68, scifi: 0.6 },
  horror: { thriller: 0.75, scifi: 0.55, drama: 0.45 },
  romance: { drama: 0.75, comedy: 0.68 },
};

function getGenreSimilarity(g1, g2) {
  if (!g1 || !g2) return 0;
  const a = g1.toLowerCase();
  const b = g2.toLowerCase();
  if (a === b) return 1.0;
  if (GENRE_AFFINITY[a] && GENRE_AFFINITY[a][b]) return GENRE_AFFINITY[a][b];
  if (GENRE_AFFINITY[b] && GENRE_AFFINITY[b][a]) return GENRE_AFFINITY[b][a];
  return 0.15;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'it', 'its', 'as', 'that', 'this', 'from', 'who', 'whom',
  'his', 'her', 'their', 'they', 'them', 'series', 'show', 'season', 'episodes', 'about',
  'into', 'after', 'when', 'which', 'where', 'one', 'two', 'new', 'all', 'more', 'life',
  'film', 'movie', 'indian', 'language', 'directed', 'written', 'starring', 'released'
]);

function extractKeywords(text) {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  return new Set(words);
}

function computeKeywordOverlap(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let matches = 0;
  for (const word of setA) {
    if (setB.has(word)) matches++;
  }
  return matches / Math.sqrt(setA.size * setB.size);
}

/**
 * Recommends top similar titles (movies & series) with multi-factor scoring and reasoning.
 */
export function recommend(targetTitle, shows, options = {}) {
  const {
    topN = 5,
    mode = 'balanced', // 'balanced' | 'genre' | 'hidden_gems' | 'global'
  } = options;

  const target = shows.find(s => s.title.toLowerCase() === targetTitle.toLowerCase());
  if (!target) return [];

  const targetKeywords = extractKeywords((target.summary || '') + ' ' + target.genre + ' ' + target.title);

  const scoredShows = shows
    .filter(s => s.title.toLowerCase() !== target.title.toLowerCase())
    .map(candidate => {
      const genreSim = getGenreSimilarity(target.genre, candidate.genre);

      const scoreDiff = Math.abs(target.score - candidate.score);
      const scoreSim = Math.max(0, 1 - scoreDiff / 2.5);

      const yearDiff = Math.abs(target.year - candidate.year);
      const eraSim = Math.max(0, 1 - yearDiff / 30);

      const sameCountry = target.country && candidate.country && target.country === candidate.country ? 1 : 0;
      const sameLanguage = target.language && candidate.language && target.language === candidate.language ? 1 : 0;
      const sameType = target.type && candidate.type && target.type === candidate.type ? 1 : 0;

      const maxVotes = 1800000;
      const targetVoteNorm = Math.min(target.votes, maxVotes) / maxVotes;
      const candVoteNorm = Math.min(candidate.votes, maxVotes) / maxVotes;
      const popularitySim = Math.max(0, 1 - Math.abs(targetVoteNorm - candVoteNorm));

      const candKeywords = extractKeywords((candidate.summary || '') + ' ' + candidate.genre + ' ' + candidate.title);
      const keywordSim = computeKeywordOverlap(targetKeywords, candKeywords);

      let finalScore = 0;
      const reasons = [];

      if (mode === 'genre') {
        finalScore = (
          genreSim * 0.48 +
          scoreSim * 0.22 +
          keywordSim * 0.14 +
          (sameLanguage ? 0.08 : 0) +
          (sameType ? 0.08 : 0)
        );
      } else if (mode === 'hidden_gems') {
        const underappreciatedBonus = candidate.score >= 7.8 && candidate.votes < 65000 ? 0.24 : 0;
        finalScore = (
          genreSim * 0.34 +
          scoreSim * 0.28 +
          underappreciatedBonus +
          keywordSim * 0.14 +
          (sameLanguage ? 0.06 : 0)
        );
      } else if (mode === 'global') {
        const diffLanguageBonus = target.language !== candidate.language ? 0.34 : 0;
        finalScore = (
          genreSim * 0.38 +
          scoreSim * 0.28 +
          diffLanguageBonus +
          keywordSim * 0.18 +
          (sameType ? 0.06 : 0)
        );
      } else {
        finalScore = (
          genreSim * 0.34 +
          scoreSim * 0.22 +
          keywordSim * 0.16 +
          eraSim * 0.08 +
          (sameLanguage ? 0.12 : (sameCountry ? 0.05 : 0)) +
          (sameType ? 0.08 : 0.02)
        );
      }

      if (candidate.genre === target.genre) {
        reasons.push(`Direct ${candidate.genre.toUpperCase()} match`);
      } else if (genreSim >= 0.7) {
        reasons.push(`Complementary ${candidate.genre} tone`);
      }

      if (sameLanguage) {
        reasons.push(`${candidate.language} ${candidate.type || 'Title'}`);
      } else if (mode === 'global') {
        reasons.push(`${candidate.language} Cinema (${candidate.country})`);
      }

      if (scoreDiff <= 0.4) {
        reasons.push(`Matching acclaim (${candidate.score}/10)`);
      }

      if (yearDiff <= 4 && reasons.length < 3) {
        reasons.push(`Same era (${candidate.year})`);
      }

      if (keywordSim > 0.15 && reasons.length < 3) {
        reasons.push('Shared narrative themes');
      }

      const normalizedPercent = Math.min(98, Math.max(72, Math.round(finalScore * 100)));

      return {
        ...candidate,
        similarity: finalScore,
        matchPercent: normalizedPercent,
        reasons: reasons.slice(0, 3),
        factors: {
          genreSim: Math.round(genreSim * 100),
          scoreSim: Math.round(scoreSim * 100),
          eraSim: Math.round(eraSim * 100),
          keywordSim: Math.round(Math.min(1, keywordSim * 2) * 100),
          popularitySim: Math.round(popularitySim * 100),
        }
      };
    });

  scoredShows.sort((a, b) => b.similarity - a.similarity);

  const results = scoredShows.slice(0, topN);
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].matchPercent >= results[i - 1].matchPercent) {
      results[i].matchPercent = Math.max(70, results[i - 1].matchPercent - (1 + (i % 2)));
    }
  }

  return results;
}

export function filterShows(shows, { genre, country, language, type, minRating, maxRating, minYear, maxYear, search, sortBy }) {
  let result = [...shows];

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.genre && s.genre.toLowerCase().includes(q)) ||
      (s.language && s.language.toLowerCase().includes(q)) ||
      (s.country && s.country.toLowerCase().includes(q)) ||
      (s.type && s.type.toLowerCase().includes(q)) ||
      (s.summary && s.summary.toLowerCase().includes(q))
    );
  }
  if (type) result = result.filter(s => s.type?.toLowerCase() === type.toLowerCase());
  if (language) result = result.filter(s => s.language?.toLowerCase() === language.toLowerCase());
  if (genre) result = result.filter(s => s.genre?.toLowerCase() === genre.toLowerCase());
  if (country) result = result.filter(s => s.country?.toUpperCase() === country.toUpperCase());
  if (minRating != null) result = result.filter(s => s.score >= minRating);
  if (maxRating != null) result = result.filter(s => s.score <= maxRating);
  if (minYear != null) result = result.filter(s => s.year >= minYear);
  if (maxYear != null) result = result.filter(s => s.year <= maxYear);

  if (sortBy === 'rating-desc') result.sort((a, b) => b.score - a.score);
  else if (sortBy === 'rating-asc') result.sort((a, b) => a.score - b.score);
  else if (sortBy === 'year-desc') result.sort((a, b) => b.year - a.year);
  else if (sortBy === 'year-asc') result.sort((a, b) => a.year - b.year);
  else if (sortBy === 'votes-desc') result.sort((a, b) => b.votes - a.votes);
  else if (sortBy === 'title-asc') result.sort((a, b) => a.title.localeCompare(b.title));

  return result;
}
