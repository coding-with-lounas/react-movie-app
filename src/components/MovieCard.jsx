import React from 'react'
const BASE_URL = import.meta.env.BASE_URL;

const MovieCard = ({movie : {title,vote_average,poster_path,release_date,original_language}}) => {
  return (
    <div className='movie-card'>
       <img 
  src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `${BASE_URL}No-Poster.png`} 
  alt={title} 
  onError={(e) => { e.currentTarget.src = `${BASE_URL}No-Poster.png`; }} 
/>
       <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
            <div className='rating'>
              <img src={BASE_URL + "/star.svg"} alt="star icon" />
              <p>{vote_average ? vote_average.toFixed(1): 'N/A' }</p>
            </div>
            <span>•</span>
            <div className="lang">{original_language}</div>
            <span>•</span>
            <p className='year'>
                {release_date ? release_date.split('-')[0] : 'N/A' }
            </p>
        </div>
       </div>
    </div>  
  )
}

export default MovieCard