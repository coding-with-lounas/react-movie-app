import React, { useEffect, useState } from "react";
import Search from "./components/Search";

const API_BASE_URL ='https://api.themoviedb.org/3';

const API_KEY =import.meta.env.VITE_TMDB_API_KEY;
const API_OPTION= {
   method :'GET',
   headers: {
    accept : 'applicatioN/json',
    Authorization: `Bearer ${API_KEY}`
   }

}


const App =()=> {
    const [searchTerm,setSearchTerm] = useState('')
    
   const[errorMessage,setErrorMessage]= useState('')
    
   const fetchMovies = async()=>{
    try{
        const endpoint =`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
        
        const response= await fetch(endpoint, API_OPTION)
        
        if(!response.ok){
        throw new Error('Failed to fetch movies');
        }
        const data = await response.json();

    }catch(error){
        console.log(`error fetching movies: ${error}`)
        setErrorMessage('Error fetching movies. Please try again later.')
    }
   }
    useEffect(()=>{
        fetchMovies();
    })
    return (
<main>
    <div className="Patterns">
       <div className="wrapper">
    <header>
        <img src="./public/hero-img.png" alt="hero banner" />
        <h1>Find <span className="text-gradient">Movies</span> You’ll Love Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
            <h2>All Movies</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </section>
       </div>
    </div>
</main>
    )
}
export default App;