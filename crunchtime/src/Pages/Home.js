import { logos } from '../logos';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

function League({current}){    
    for (let [key, value] of Object.entries(logos)) {
        if (key === current) {
            return(
                <div>
                    <Link to={'/'+key}>
                        <button className="logo-img" type="submit">
                            <img width={value.width} height={value.height} src={value.link} alt={key + " logo"}/>
                        </button>
                    </Link>
                </div>
            )    
        }
    }
}

function LeagueList(){
    const USER = 'mikeymits'; //replace with login
    const [resultKeys, setResultKeys] = useState([])
    useEffect(() => {
        const loadLatest = async () => {
            let results = await fetch(`${baseUrl}/preferences/${USER}`)
            .then(resp => resp.json())
            .catch(err => {console.log(`No user ${USER} found`)});
            if(results === undefined){
                results = {
                    _id: '-',
                    user: USER,
                    priority: ['diffs', 'times', 'stands'],
                    streams: '-',
                    NBA: 0,
                    MLB: 0,
                    NFL: 0,
                    NHL: 0
                }
                setResultKeys(Object.keys(results));
            } 
            else{                
                setResultKeys(Object.keys(results)); //need order of leagues
            }
        }
        loadLatest();
    }, 
    []);  

    let leagueList = [];
    for(let i = 0; i < 4; i++){
        leagueList[i] = (
        <div key={"leagueId"+(i-4)} className="column">
            <League current={ resultKeys[i+4]}></League>
        </div>
        )
    }
    
  return leagueList.reverse();
}

export default function Home(){
    return(
        <div>        
            <title>Crunch Time</title>
                <h1>Crunch Time</h1>
                <h3>Select a sport</h3>
                <br></br><br></br>
                <br></br>
                <div className="logo-vis">  
                    <LeagueList></LeagueList>             
                </div>        
        </div>
    )
}