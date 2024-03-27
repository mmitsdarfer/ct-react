import data from './json/preferences.json';

const logos = [['NHL', 120, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/1200px-05_NHL_Shield.svg.png'],
        ['NFL', 100, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png'],
        ['MLB', 160, 86, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/1200px-Major_League_Baseball_logo.svg.png'],
        ['NBA', 73, 120, 'https://brandlogos.net/wp-content/uploads/2014/09/NBA-logo-big.png']];
function League({rank}){
    let position = data.length - rank - 1; //closest to data.length == most visited league
    for(let j = 0; j < logos.length; j++){
        if(data[position][0] === logos[j][0]){
            return(
                <div>
                    <a href={'//localhost:3000/'+data[position][0]}>
                        <button className="logo-img" type="submit">
                            <img width={logos[j][1]} height={logos[j][2]} src={logos[j][3]} alt={logos[j][0] + " logo"}/>
                        </button>  
                    </a>
                    
                </div>                               
            )
        }
    }
}

function LeagueList(){
    let leagueList = [];
    for(let i = data.length-3; i >= 0; i--){    //-3 for 1 less than length minus # of pref.json elements not needed here
        leagueList[i] = (
            <div key={"leagueId"+i}  className="column">
                <div className="logos">
                    <League rank={i}></League>     
                </div> 
            </div>
        )
    }  
    return leagueList;
}

export default function Home(){
    return(
        <div>        
            <title>Crunch Time</title>
                <div className="top">
                    <h1>Crunch Time</h1>
                </div>
                <p>Select a sport</p>
                <br></br><br></br><br></br><br></br>
                <LeagueList></LeagueList>        
        </div>
    )
}