
import React, { useEffect, useState } from 'react';
import { tmdbService } from '../../services/tmdbService';
import { MovieDetails, Movie } from '../../types';
import { TMDB_CONFIG } from '../../constants';
import LoadingSpinner from '../common/LoadingSpinner';
import MovieCard from './MovieCard';

interface MovieDetailsViewProps {
  movieId: number;
  onClose: () => void;
  onSelectMovie: (id: number) => void;
}

const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({ movieId, onClose, onSelectMovie }) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailsData, relatedData] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          tmdbService.getRelatedMovies(movieId),
        ]);
        setDetails(detailsData);
        setRelated(relatedData.results.slice(0, 5));
      } catch (err) {
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error || !details) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-center">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <p className="text-red-400 mb-4">{error || "Movie not found"}</p>
        <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors">Close</button>
      </div>
    </div>
  );

  const backdropUrl = details.backdrop_path 
    ? `${TMDB_CONFIG.BACKDROP_BASE_URL}${details.backdrop_path}`
    : `https://picsum.photos/1920/1080?blur=10`;

  const posterUrl = details.poster_path 
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}${details.poster_path}`
    : 'https://picsum.photos/500/750';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-[60] bg-slate-800/80 hover:bg-indigo-600 text-white p-3 rounded-full transition-all hover:rotate-90"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>

      <div className="relative min-h-screen">
        {/* Hero Section with Backdrop */}
        <div className="relative h-[60vh] w-full">
          <img 
            src={backdropUrl} 
            alt={details.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative -mt-40 max-w-6xl mx-auto px-4 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster Sidebar */}
            <div className="md:w-1/3 lg:w-1/4 shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                <img src={posterUrl} alt={details.title} className="w-full h-auto" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Release Date</span>
                  <span className="text-slate-100 font-medium">{details.release_date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Runtime</span>
                  <span className="text-slate-100 font-medium">{details.runtime} mins</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className="text-slate-100 font-medium">{details.status}</span>
                </div>
              </div>
            </div>

            {/* Movie Text Info */}
            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 leading-tight">
                {details.title}
              </h1>
              {details.tagline && (
                <p className="text-xl text-indigo-400 italic font-medium mb-6">"{details.tagline}"</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                  <span className="text-yellow-400 font-bold text-lg">{details.vote_average.toFixed(1)}</span>
                  <i className="fa-solid fa-star text-yellow-400"></i>
                  <span className="text-slate-400 text-xs">/ 10</span>
                </div>
                {details.genres.map(genre => (
                  <span key={genre.id} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-sm border border-slate-700">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-indigo-500 pl-4">Overview</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {details.overview || "No overview available."}
                </p>
              </div>

              {/* Related Movies Section */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">Recommended For You</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {related.map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onClick={() => {
                          onSelectMovie(movie.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsView;
