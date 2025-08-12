import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import { Spinner } from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import {useDebounce} from "react-use"
import { getTrendingMovies, updateSearchCount } from "./Appwrite";
import MovieDetails from "./components/MovieDetails";


const BASE_URL = import.meta.env.BASE_URL;
const API_BASE_URL ='https://api.themoviedb.org/3';

const API_KEY =import.meta.env.VITE_TMDB_API_KEY;
const API_OPTION= {
   method :'GET',
   headers: {
    accept : 'application/json',
    Authorization: `Bearer ${API_KEY}`
   }

}


const App =()=> {
   const [searchTerm,setSearchTerm] = useState('')
   const[errorMessage,setErrorMessage]= useState('')
   const[movieList,setMovieList]= useState([])
   const [trendingMovies,setTrendingMovies]=useState([])
   const[isLoading,setIsLoading]=useState(false)
   const[debouncedSearch,setDebouncedSearch]=useState('')
   const [selectedMovieId, setSelectedMovieId] = useState(null)
   
   // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
   useDebounce(()=>setDebouncedSearch(searchTerm),500,[searchTerm]);


   const fetchMovies = async(query ='') =>{
    setIsLoading(true);
    setErrorMessage('');
    try{
        const endpoint = query
        ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
        
        const response= await fetch(endpoint, API_OPTION)
        
        if(!response.ok){
        throw new Error('Failed to fetch movies');
        }

        const data = await response.json();

        if(data.response===false){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([])
        return;}

     setMovieList(data.results || []);
    //   updateSearchCount();

      
    if(query && data.results.length > 0){
       await updateSearchCount(query, data.results[0]);
    }
    }catch(error){
        console.log(`error fetching movies: ${error}`)
        setErrorMessage('Error fetching movies. Please try again later.')
    }finally{
        setIsLoading(false);
    }
   }

   const loadingTrend=async()=>{
     try {
        const movies = await getTrendingMovies();
        console.log(movies)
        setTrendingMovies(movies);
     } catch (error) {
        console.error(`error fetching trending moving ${error}`)
     }

   }

    useEffect(()=>{
        fetchMovies(debouncedSearch);
    },[debouncedSearch])
    useEffect(()=>{
       loadingTrend()
    },[])
   
const handleMovieClick = (movieId) => {
  setSelectedMovieId(movieId);
};

const handleCloseDetails = () => {
  setSelectedMovieId(null);
};

const handleTrendingMovieClick = (movie) => {
  const movieId = movie.tmdb_id || movie.id;
  setSelectedMovieId(movieId);
};

    return (
<main>
    <div className="pattern">
       <div className="wrapper">
    <header>
        <img src={BASE_URL +"/hero-img.png"} alt="hero banner" />
        <h1>Find <span className="text-gradient">Movies</span> You’ll Love Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies.length > 0 && (
            <section className="trending">
             <h2>Trending Movies</h2>
             <ul>
                {trendingMovies.map((movie,index)=>
                <li key={movie.$id} onClick={() => handleTrendingMovieClick(movie)} style={{ cursor: 'pointer' }}>
                  <p>{index +1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
            )}
             </ul>
            </section>
        )}
        <section className="all-movies">
            <h2 className="mt-[40px]">All Movies</h2>
            {isLoading ? (
                <Spinner />
                // <p className="text-white">Loading...</p>
            ):errorMessage?(
                <p className="text-red-500">{errorMessage}</p>
            ):(
                <ul>
                    {movieList.map((movie)=><MovieCard key={movie.id} movie={movie} onMovieClick={handleMovieClick}/>)}
                </ul>
            )

            }
            
        </section>
       </div>
    </div>
   
    {/* Movie Details Modal */}
{selectedMovieId && (
  <MovieDetails 
    movieId={selectedMovieId} 
    onClose={handleCloseDetails}
  />
)}
</main>

    )
}
export default App;