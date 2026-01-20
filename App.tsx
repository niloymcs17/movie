
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbService } from './services/tmdbService';
import { Movie, Genre, FilterState } from './types';
import { YEARS, RATINGS, SORT_OPTIONS } from './constants';
import MovieGrid from './components/movies/MovieGrid';
import MovieDetailsView from './components/movies/MovieDetailsView';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    genreId: '',
    year: '',
    rating: '',
    searchQuery: '',
    sortBy: 'popularity.desc'
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Initial Genre load
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await tmdbService.getGenres();
        setGenres(data);
      } catch (err) {
        console.error("Failed to load genres");
      }
    };
    loadGenres();
  }, []);

  // Debounced search input with distinct check
  useEffect(() => {
    const trimmedInput = searchInput.trim();
    
    const timeoutId = setTimeout(() => {
      // Check if value is distinct from current searchQuery
      const trimmedQuery = filters.searchQuery.trim();
      if (trimmedInput !== trimmedQuery) {
        // Update filters with same logic as handleFilterChange for searchQuery
        setMovies([]);
        setPage(1);
        setFilters(prev => ({
          ...prev,
          searchQuery: trimmedInput,
          genreId: '', // Clear genre when searching
          rating: '', // Clear rating when searching
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchQuery]);

  // Main Movie Loader
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        const isSearching = filters.searchQuery.trim().length > 0;

        if (isSearching) {
          // TMDB search endpoint supports 'primary_release_year' but not genres or ratings
          response = await tmdbService.searchMovies(
            filters.searchQuery, 
            page, 
            filters.year || undefined, 
            controller.signal
          );
        } else {
          // Discover endpoint supports all filters
          response = await tmdbService.discoverMovies({
            page,
            with_genres: filters.genreId || undefined,
            primary_release_year: filters.year || undefined,
            'vote_average.gte': filters.rating || undefined,
            sort_by: filters.sortBy,
          }, controller.signal);
        }

        setMovies(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setHasMore(response.page < response.total_pages);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError("Failed to fetch movies. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    return () => controller.abort();
  }, [filters, page]);

  // Unified filter handler
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setMovies([]); 
    setPage(1);    
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // LOGIC:
      // 1. If user changes Search Query, clear Genre and Rating (incompatible) but KEEP Year (compatible).
      if (key === 'searchQuery') {
        newFilters.genreId = '';
        newFilters.rating = '';
      } 
      // 2. If user changes Genre or Rating, clear Search Query (Discovery mode required).
      else if (key === 'genreId' || key === 'rating') {
        newFilters.searchQuery = '';
        setSearchInput(''); // Clear search input state
      }
      // 3. Year and Sort are left alone as they are handled contextually.
      
      return newFilters;
    });
  };

  const clearAll = () => {
    setSearchInput(''); // Clear search input state
    setMovies([]);
    setPage(1);
    setFilters({
      genreId: '',
      year: '',
      rating: '',
      searchQuery: '',
      sortBy: 'popularity.desc'
    });
  };

  const isSearching = filters.searchQuery.trim().length > 0;

  // Compute title for MovieGrid
  const gridTitle = isSearching 
    ? `Search: ${filters.searchQuery}` 
    : filters.genreId 
      ? `${genres.find(g => g.id.toString() === filters.genreId)?.name} Movies` 
      : 'Discover';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={clearAll}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-clapperboard text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">CINE<span className="text-indigo-500">WAVE</span></h1>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="relative flex-1 max-w-lg w-full">
            <input 
              ref={searchInputRef}
              name="search"
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search movies by title..." 
              className="w-full bg-slate-800 text-slate-100 pl-12 pr-10 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            {searchInput && (
              <button 
                type="button"
                onClick={clearAll}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </form>

          
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filters</h3>
              {(filters.genreId || filters.year || filters.rating || filters.searchQuery) && (
                <button onClick={clearAll} className="text-xs text-indigo-400 hover:underline">Reset</button>
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 px-1 uppercase tracking-tight">Sort By</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  disabled={isSearching}
                  className="w-full bg-slate-800 text-slate-200 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className={`text-xs font-semibold uppercase tracking-tight ${isSearching ? 'text-slate-600' : 'text-slate-500'}`}>Genre</label>
                  {isSearching && <span className="text-[10px] text-indigo-400 font-bold uppercase">Discovery Only</span>}
                </div>
                <select 
                  value={filters.genreId}
                  onChange={(e) => handleFilterChange('genreId', e.target.value)}
                  className={`w-full p-3 rounded-xl border focus:outline-none transition-colors cursor-pointer ${isSearching ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500'}`}
                >
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g.id} value={g.id.toString()}>{g.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 px-1 uppercase tracking-tight">Year</label>
                <select 
                   value={filters.year}
                   onChange={(e) => handleFilterChange('year', e.target.value)}
                   className="w-full bg-slate-800 text-slate-200 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className={`text-xs font-semibold uppercase tracking-tight ${isSearching ? 'text-slate-600' : 'text-slate-500'}`}>Min Rating</label>
                  {isSearching && <span className="text-[10px] text-indigo-400 font-bold uppercase">Discovery Only</span>}
                </div>
                <select 
                   value={filters.rating}
                   onChange={(e) => handleFilterChange('rating', e.target.value)}
                   className={`w-full p-3 rounded-xl border focus:outline-none transition-colors cursor-pointer ${isSearching ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500'}`}
                >
                  {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-800/40 rounded-2xl border border-indigo-500/20">
            <h4 className="text-white font-bold mb-2 text-sm">Status</h4>
            <div className="text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed">
                {isSearching 
                  ? `Filtering search results for "${filters.searchQuery}" by year.` 
                  : 'Browsing categories with full filter capabilities.'}
              </p>
              {isSearching && (
                <p className="text-indigo-300 italic">
                  Note: Genre and Rating filters require resetting search to enter "Discovery Mode".
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <MovieGrid
          movies={movies}
          loading={loading}
          error={error}
          hasMore={hasMore}
          title={gridTitle}
          lastMovieElementRef={lastMovieElementRef}
          onMovieClick={setSelectedMovieId}
          onClearFilters={clearAll}
        />
      </div>

      {/* Detail Modal */}
      {selectedMovieId && (
        <MovieDetailsView 
          movieId={selectedMovieId} 
          onClose={() => setSelectedMovieId(null)} 
          onSelectMovie={setSelectedMovieId}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">CINE<span className="text-indigo-500">WAVE</span></h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">Powered by TMDB. Browse thousands of movies with ease.</p>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-300 hover:text-white">
              <i className="fa-brands fa-github"></i>
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-300 hover:text-white">
              <i className="fa-brands fa-twitter"></i>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
