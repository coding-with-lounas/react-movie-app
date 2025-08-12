import React, { useEffect, useState } from 'react';
import './MovieDetails.css'; 
import { Spinner } from './Spinner';

const BASE_URL = import.meta.env.BASE_URL;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTION = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const MovieDetails = ({ movieId, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  const fetchMovieDetails = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Fetch movie details, cast, and videos in parallel
      const [detailsResponse, creditsResponse, videosResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTION),
        fetch(`${API_BASE_URL}/movie/${movieId}/credits`, API_OPTION),
        fetch(`${API_BASE_URL}/movie/${movieId}/videos`, API_OPTION)
      ]);

      if (!detailsResponse.ok || !creditsResponse.ok || !videosResponse.ok) {
        throw new Error('Failed to fetch movie data');
      }

      const [detailsData, creditsData, videosData] = await Promise.all([
        detailsResponse.json(),
        creditsResponse.json(),
        videosResponse.json()
      ]);

      setMovieDetails(detailsData);
      setCast(creditsData.cast?.slice(0, 10) || []); // Get top 10 cast members
      
      // Filter for trailers and teasers, prioritize official trailers
      const movieTrailers = videosData.results?.filter(
        video => video.type === 'Trailer' || video.type === 'Teaser'
      ).sort((a, b) => {
        if (a.official && !b.official) return -1;
        if (!a.official && b.official) return 1;
        if (a.type === 'Trailer' && b.type === 'Teaser') return -1;
        if (a.type === 'Teaser' && b.type === 'Trailer') return 1;
        return 0;
      }) || [];
      
      setVideos(movieTrailers.slice(0, 3)); // Get top 3 videos

    } catch (error) {
      console.error('Error fetching movie details:', error);
      setErrorMessage('Failed to load movie details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="movie-details-overlay">
        <div className="movie-details-container">
          <Spinner />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="movie-details-overlay">
        <div className="movie-details-container">
          <button className="close-btn" onClick={onClose}>×</button>
          <p className="text-red-500 text-center">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!movieDetails) return null;

  const mainTrailer = videos.find(video => video.site === 'YouTube') || videos[0];

  return (
    <div className="movie-details-overlay" onClick={onClose}>
      <div className="movie-details-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/* Header Section */}
        <div className="movie-details-header">
          <div className="movie-poster">
            <img
              src={movieDetails.poster_path 
                ? `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}` 
                : `${BASE_URL}No-Poster.png`}
              alt={movieDetails.title}
              onError={(e) => { e.currentTarget.src = `${BASE_URL}No-Poster.png`; }}
            />
          </div>
          
          <div className="movie-info">
            <h1>{movieDetails.title}</h1>
            {movieDetails.tagline && <p className="tagline">"{movieDetails.tagline}"</p>}
            
            <div className="movie-meta">
              <div className="rating">
                <img src={BASE_URL + "/star.svg"} alt="star icon" />
                <span>{movieDetails.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="vote-count">({movieDetails.vote_count} votes)</span>
              </div>
              
              <div className="meta-info">
                <span>{movieDetails.release_date?.split('-')[0] || 'N/A'}</span>
                <span>•</span>
                <span>{formatRuntime(movieDetails.runtime)}</span>
                <span>•</span>
                <span>{movieDetails.original_language?.toUpperCase()}</span>
              </div>
              
              <div className="genres">
                {movieDetails.genres?.map(genre => (
                  <span key={genre.id} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="movie-section">
          <h2>Overview</h2>
          <p className="overview">{movieDetails.overview || 'No overview available.'}</p>
        </div>

        {/* Trailer Section */}
        {mainTrailer && (
          <div className="movie-section">
            <h2>Trailer</h2>
            <div className="trailer-container">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${mainTrailer.key}`}
                title={mainTrailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="movie-section">
            <h2>Cast</h2>
            <div className="cast-list">
              {cast.map(actor => (
                <div key={actor.id} className="cast-member">
                  <img
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w200/${actor.profile_path}` 
                      : `${BASE_URL}No-Poster.png`}
                    alt={actor.name}
                    onError={(e) => { e.currentTarget.src = `${BASE_URL}No-Poster.png`; }}
                  />
                  <div className="cast-info">
                    <p className="actor-name">{actor.name}</p>
                    <p className="character-name">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="movie-section">
          <h2>Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Status:</strong> {movieDetails.status || 'N/A'}
            </div>
            <div className="detail-item">
              <strong>Budget:</strong> {formatCurrency(movieDetails.budget)}
            </div>
            <div className="detail-item">
              <strong>Revenue:</strong> {formatCurrency(movieDetails.revenue)}
            </div>
            <div className="detail-item">
              <strong>Original Language:</strong> {movieDetails.original_language?.toUpperCase() || 'N/A'}
            </div>
            {movieDetails.production_countries?.length > 0 && (
              <div className="detail-item">
                <strong>Country:</strong> {movieDetails.production_countries.map(c => c.name).join(', ')}
              </div>
            )}
            {movieDetails.production_companies?.length > 0 && (
              <div className="detail-item">
                <strong>Production:</strong> {movieDetails.production_companies.slice(0, 3).map(c => c.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Additional Videos */}
        {videos.length > 1 && (
          <div className="movie-section">
            <h2>More Videos</h2>
            <div className="videos-list">
              {videos.slice(1).map(video => (
                <div key={video.id} className="video-item">
                  <iframe
                    width="300"
                    height="169"
                    src={`https://www.youtube.com/embed/${video.key}`}
                    title={video.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <p className="video-title">{video.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;