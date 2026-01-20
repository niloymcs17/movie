
import { TMDB_CONFIG } from '../constants';
import { Movie, Genre, MovieDetails, TMDBResponse } from '../types';

const fetchFromTMDB = async <T,>(
  endpoint: string, 
  params: Record<string, string | number | boolean> = {},
  signal?: AbortSignal
): Promise<T> => {
  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.API_KEY,
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json();
};

export const tmdbService = {
  getGenres: async (): Promise<Genre[]> => {
    const data = await fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
    return data.genres;
  },

  discoverMovies: async (params: { 
    page: number; 
    with_genres?: string; 
    primary_release_year?: string; 
    'vote_average.gte'?: string;
    sort_by?: string;
  }, signal?: AbortSignal): Promise<TMDBResponse<Movie>> => {
    return fetchFromTMDB<TMDBResponse<Movie>>('/discover/movie', {
      ...params,
      include_adult: false,
    }, signal);
  },

  searchMovies: async (query: string, page: number, year?: string, signal?: AbortSignal): Promise<TMDBResponse<Movie>> => {
    return fetchFromTMDB<TMDBResponse<Movie>>('/search/movie', {
      query,
      page,
      primary_release_year: year,
      include_adult: false,
    }, signal);
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    return fetchFromTMDB<MovieDetails>(`/movie/${id}`);
  },

  getRelatedMovies: async (id: number): Promise<TMDBResponse<Movie>> => {
    return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${id}/recommendations`);
  },
};
