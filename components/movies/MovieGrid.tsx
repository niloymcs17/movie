
import React from 'react';
import { Movie } from '../../types';
import MovieCard from './MovieCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  title: string;
  lastMovieElementRef: (node: HTMLDivElement | null) => void;
  onMovieClick: (id: number) => void;
  onClearFilters: () => void;
}

const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading,
  error,
  hasMore,
  title,
  lastMovieElementRef,
  onMovieClick,
  onClearFilters,
}) => {
  return (
    <main className="flex-1">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-1">
            {title}
          </h2>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-center my-8">
          <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
        </div>
      )}

      {!loading && movies.length === 0 && !error && (
        <div className="text-center py-20 space-y-4">
          <div className="text-slate-700">
            <i className="fa-solid fa-clapperboard text-8xl"></i>
          </div>
          <p className="text-slate-400 text-xl font-medium">No results found.</p>
          <button 
            onClick={onClearFilters}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Reset all filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie, index) => {
          const uniqueKey = `${movie.id}-${index}`;
          if (movies.length === index + 1) {
            return (
              <div ref={lastMovieElementRef} key={uniqueKey}>
                <MovieCard movie={movie} onClick={onMovieClick} />
              </div>
            );
          } else {
            return <MovieCard key={uniqueKey} movie={movie} onClick={onMovieClick} />;
          }
        })}
      </div>

      {loading && <LoadingSpinner />}

      {!hasMore && movies.length > 0 && (
        <p className="text-center text-slate-500 mt-12 mb-8 py-4 border-t border-slate-800">
          End of list.
        </p>
      )}
    </main>
  );
};

export default MovieGrid;
