
import React from 'react';
import { Movie } from '../../types';
import { TMDB_CONFIG } from '../../constants';

interface MovieCardProps {
  movie: Movie;
  onClick: (id: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const posterUrl = movie.poster_path 
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://picsum.photos/500/750?grayscale&blur=2';

  return (
    <div 
      onClick={() => onClick(movie.id)}
      className="group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20"
    >
      <div className="aspect-[2/3] relative">
        <img 
          src={posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
               {movie.vote_average.toFixed(1)} <i className="fa-solid fa-star ml-1"></i>
             </span>
             <span className="text-slate-300 text-xs">
               {movie.release_date?.split('-')[0]}
             </span>
           </div>
           <p className="text-slate-200 text-xs line-clamp-3">{movie.overview}</p>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
          {movie.title}
        </h3>
      </div>
    </div>
  );
};

export default MovieCard;
