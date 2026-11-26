// Helper utilities for Cinematch AI (clean, emoji-free)

export function countryName(code) {
  const map = {
    US: 'United States',
    GB: 'United Kingdom',
    JP: 'Japan',
    IN: 'India',
    CA: 'Canada',
    DE: 'Germany',
    FR: 'France',
    KR: 'South Korea',
    ES: 'Spain',
    NO: 'Norway',
    SE: 'Sweden',
    CO: 'Colombia',
    TR: 'Turkey',
    AU: 'Australia',
    BE: 'Belgium',
    IL: 'Israel',
    TW: 'Taiwan',
    BR: 'Brazil',
    MX: 'Mexico',
    PL: 'Poland',
    DK: 'Denmark',
    FI: 'Finland',
    ZA: 'South Africa',
    IT: 'Italy',
    AR: 'Argentina',
  };
  return map[code?.toUpperCase()] || code || 'Global';
}

export function inferLanguage(country) {
  const map = {
    US: 'English',
    GB: 'English',
    CA: 'English',
    AU: 'English',
    ZA: 'English',
    IN: 'Hindi',
    JP: 'Japanese',
    KR: 'Korean',
    ES: 'Spanish',
    MX: 'Spanish',
    CO: 'Spanish',
    AR: 'Spanish',
    FR: 'French',
    DE: 'German',
    IT: 'Italian',
    TR: 'Turkish',
    BR: 'Portuguese',
    SE: 'Swedish',
    NO: 'Norwegian',
    DK: 'Danish',
    FI: 'Finnish',
    IL: 'Hebrew',
    BE: 'Dutch',
    TW: 'Mandarin',
    PL: 'Polish',
  };
  return map[country?.toUpperCase()] || 'English';
}

export function formatVotes(votes) {
  if (!votes) return '0';
  if (votes >= 1000000) return (votes / 1000000).toFixed(1) + 'M';
  if (votes >= 1000) return (votes / 1000).toFixed(0) + 'k';
  return votes.toString();
}

export function formatRuntimeLabel(show) {
  if (show.type === 'Movie') {
    return show.duration ? `${show.duration} min` : 'Feature Film';
  }
  const s = show.seasons || 1;
  return `${s} Season${s !== 1 ? 's' : ''}`;
}

export function getUniqueGenres(shows) {
  return [...new Set(shows.map(s => s.genre).filter(Boolean))].sort();
}

export function getUniqueCountries(shows) {
  return [...new Set(shows.map(s => s.country).filter(Boolean))].sort();
}

export function getUniqueLanguages(shows) {
  return [...new Set(shows.map(s => s.language).filter(Boolean))].sort();
}

export function getYearRange(shows) {
  const years = shows.map(s => s.year).filter(Boolean);
  if (!years.length) return { min: 1960, max: 2025 };
  return { min: Math.min(...years), max: Math.max(...years) };
}
