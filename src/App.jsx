import React, { useEffect, useState } from "react";
import Search from "./components/Search";


const App =()=> {
    const [searchTerm,setSearchTerm] = useState('')
    useEffect(()=>{
        
    })
    return (
<main>
    <div className="Patterns">
       <div className="wrapper">
    <header>
        <img src="./public/hero-img.png" alt="hero banner" />
        <h1>Find <span className="text-gradient">Movies</span> You’ll Love Without the Hassle</h1>
        </header>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
       </div>
    </div>
</main>
    )
}
export default App;