import data from './json/preferences.json';
import { logos } from './logos';

function League({current}){    
    for (let [key, value] of Object.entries(logos)) {
        if (key === current) {
            return(
                <div>
                    <a href={'//localhost:3000/'+key}>
                        <button className="logo-img" type="submit">
                            <img width={value.width} height={value.height} src={value.link} alt={key + " logo"}/>
                        </button>
                    </a>
                </div>
            )
        
        }
    }
}

function LeagueList(){
    let leagueList = []; 
    for(let i = 2; i < data.length; i++){
    Object.values(logos).forEach((value, index) => 
    {  
            if(data[i][0] === Object.keys(logos)[index]){
                console.log(data[i][0]);
                leagueList[i] = (
                    <div key={"leagueId"+index} className="column">
                        <League current={data[i][0]}></League>
                    </div>
                )
            } 
        index++;
    })
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
                <div className="logo-vis">
                    <LeagueList></LeagueList>     
                </div>
                  
        </div>
    )
}