import nhlData from './json/nhl.json';
import nflData from './json/nfl.json';
import mlbData from './json/mlb.json';
import nbaData from './json/nba.json';
import React from 'react';
//import prefs from './json/preferences.json';

export default function League({league, logoData}){
    const [data, setData] = React.useState(null);
  
    React.useEffect(() => {
    fetch('/'+league)
      .then((res) => res.json())
      .then((data) => setData(data.message));
    }, []);

    let leagueData;
    if(league === 'NHL') leagueData = nhlData;
    else if(league === 'NFL') leagueData = nflData;
    else if(league === 'MLB') leagueData = mlbData;
    else if(league === 'NBA') leagueData = nbaData;
    let len = leagueData.table.length-1
    let rows = Math.ceil(len/4); 
    function Net({i}){
        if(leagueData.table[i].progress !== 'ended'){
            if(leagueData.table[i].network === 'NHL NET' || leagueData.table[i].network === 'NBA TV') {
                return <div className="net">{leagueData.table[i].network} has no available links</div>
            }
            else if(leagueData.table[i].network === undefined || leagueData.table[i].network === ''){
                return <div className="blank-btn"><br></br></div>
            }
            else return <a className="btn" href={leagueData.table[i].link} target="_blank" rel="noreferrer">Watch on {leagueData.table[i].network}</a>
        }
        else{
            return <div className="blank-btn"><br></br></div>
        }
    }
    function Time({i}){
        if(leagueData.table[i].time !== undefined){
            return <div className='time'>{leagueData.table[i].time}
            </div>
        }
    }
    function Game({i}){
        if(typeof leagueData.table[i] === 'undefined'){
            return;
        }
        return(
            <div>
            <div className='games'>
                    <span>{leagueData.table[i].team1}</span>
                    <div className='scores'>{leagueData.table[i].score1}</div>
                </div>
                <div className='games'>
                    <span>{leagueData.table[i].team2}</span>
                    <div className='scores'>{leagueData.table[i].score2}</div>
                </div>
                <Time i={i}></Time>
                <div className='net'><Net i={i}></Net></div>
                <br></br>
            </div> 
        )
    }
    function Col({colVal}){
        let colArr = [];
        for(let j = 0; j < rows; j++){
            colArr[j] = <Game key={"game" + colVal + 4 * j} i={colVal + 4 * j}></Game>
        }
        return colArr;
    }
    
    return(
        <div>
            <h1>{league} Games</h1>
            <a href={'//localhost:3000/'+league}>
                <button className="logo-img" type="submit">
                    <img width={logoData.width} height={logoData.height} src={logoData.link} alt={league + " logo"}/>
                </button>
            </a>
            <h2>Click the league logo to refresh scores</h2>
            <div className="date">
                    <h2>{leagueData.table[leagueData.table.length-1].date}</h2>
                </div>
            <div className='league-row'>
                <div className='league-column'>
                    <h3>
                        <Col colVal={0}></Col>
                    </h3>
                </div>
                <div className="league-column" id="alt-column">
                    <h3>
                    <Col colVal={1}></Col>
                    </h3>
                </div>
                <div className='league-column'>
                    <h3>
                        <Col colVal={2}></Col>
                    </h3>
                </div>
                <div className="league-column" id="alt-column">
                    <h3>
                    <Col colVal={3}></Col>
                    </h3>
                </div>
            </div>            
        </div>
        
    )
}