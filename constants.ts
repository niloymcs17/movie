
export const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || 'b5f2064412eb9f6aead2cb4f127f5b16',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original',
};

export const RATINGS = [
  { label: 'Any Rating', value: '' },
  { label: '8+ ★', value: '8' },
  { label: '7+ ★', value: '7' },
  { label: '6+ ★', value: '6' },
  { label: '5+ ★', value: '5' },
];

export const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Newest First', value: 'primary_release_date.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
];

export const YEARS = Array.from({ length: 50 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: year.toString(), value: year.toString() };
});
YEARS.unshift({ label: 'Any Year', value: '' });
