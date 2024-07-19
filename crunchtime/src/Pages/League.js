import nhlData from '../json/nhl.json';
import nflData from '../json/nfl.json'
import mlbData from '../json/mlb.json';
import nbaData from '../json/nba.json';
import {useEffect, useState} from 'react';
import { noLinks } from '../backend/scrape-sort/netLinks';
import { useNavigate } from 'react-router-dom';

const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

var fullNets = [['TNT', 'https://www.tntdrama.com/watchtnt/east'], ['ESPN+', 'https://www.espn.com/watch/'], ['FOX', 'https://www.foxsports.com/live'],
['CBS', 'https://www.cbs.com/live-tv/stream'], ['ABC', 'https://abc.com/watch-live/abc'], 
['NBC', 'https://www.nbc.com/live?brand=nbc'],
['AppleTV+', 'https://tv.apple.com/us/room/apple-tv-major-league-baseball/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2'],
['TBS', 'https://www.tbs.com/watchtbs/east'], ['FS1', 'https://www.foxsports.com/live/fs1'], ['MLB Network', 'https://www.mlb.com/network/live?success=true'],
['MLBTV', 'https://www.mlb.com/tv'], ['NBA TV', 'https://www.nba.com/watch/nba-tv'],
['NBCSP', 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia']];

function makeCapital(lower){
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function League({league, logoData}){
    document.title = 'Crunch Time: ' + league;
    const navigate = useNavigate();

    const USER = 'mikeymits'; //TODO: replace with login
    //line below gets rid of misleading warning
    // eslint-disable-next-line
    const [priority, setPriority] = useState(['times', 'diffs', 'stands']);
    const [streams, setStreams] = useState(["TNT","ESPN+","FOX","ABC","NBC","CBS","AppleTV+","TBS","FS1","MLB Network","MLBTV","NBATV","NBCSP"]);
    //line below gets rid of misleading warning
    // eslint-disable-next-line
    const [leagues, setLeagues] = useState([{NBA: 0}, {MLB: 0}, {NFL: 0}, {NHL: 0}]);
    const [take, setTake] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        async function loadLatest(){
            let results = await fetch(`${baseUrl}/preferences/${USER}`)
            .then(resp => resp.json())
            .catch(err => {console.log(`No user "${USER}" found`)});
            if(results === undefined){
                results = {
                    priority: ['diffs', 'times', 'stands'],
                    streams: streams,
                    leagues: [{NBA: 0}, {MLB: 0}, {NFL: 0}, {NHL: 0}],
                    take: take,
                    refresh: refresh
                }
                //top = diffs, mid = times, last = stands
            }
            else{           
                setPriority(results.priority);
                setStreams(results.streams);
                setLeagues(results.leagues);
                setTake(results.take);
                setRefresh(results.refresh);
            } 
        }
        loadLatest();
        //line below gets rid of misleading warning
        // eslint-disable-next-line
    }, []);

    async function leagueCall(){
       // if(league == 'MLB') mlbScrape(priority, streams); 
       // else callScrape(league, priority, streams);     
        timer(league);
    }
    leagueCall()

    function timer(){
        if (refresh === 30 || refresh === 60 || refresh === 300){
            console.log('Timer length: ' + refresh);
            function redir(){;
                leagueCall(league);
            }
            setTimeout(redir, refresh*1000);
        }
    }

    // line below hides unneeded/misleading warning (refreshed not used)
    // eslint-disable-next-line 
    const [refreshed, setRefreshed] = useState(true); 

    let leagueData;
    if(league === 'NHL') leagueData = nhlData;
    else if(league === 'NFL') leagueData = nflData;
    else if(league === 'MLB') leagueData = mlbData;
    else if(league === 'NBA') leagueData = nbaData;

    let haveTopLink = false;
    if(streams.find(chan => chan === leagueData.table[0].network) !== undefined) haveTopLink = true;

    function getLink(net){
        if(fullNets.find(chan => chan[0] === net) !== undefined) return fullNets.find(chan => chan[0] === net)[1];
    }

    //if takeme is on, open that link in new window
    //only want league to be current when opening page so visit count only increments once
    const [origin, setOrigin] = useState(document.referrer); // gives url of previous page)

    if(origin !== window.location.href) {
            if(!noLinks(leagueData.table[0].network) && take && leagueData.table[0].progress !== 'ended' && haveTopLink){
                window.open(getLink(leagueData.table[0].network)); //use getLink w/ net instead of table.link so it never goes to /stream
                            //(would only happen if takeMe is on after updating streamPrefs to include top network)
                setTake(false)
                setOrigin(window.location.href);
            } 
        }
    
    // line below hides unneeded warning (data not used)
    // eslint-disable-next-line
    const [data, setData] = useState(null);
    
    useEffect(() => {
        fetch('/'+league)
        .then((data) => setData(data.message));
        setRefreshed(false);
    },  // line below hides unneeded warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    []);    
    

    let len = leagueData.table.length-1
    let rows = Math.ceil(len/4); 
    function Net({i}){
        if(leagueData.table[i].network === 'ESPN') leagueData.table[i].network = 'ESPN+';
        if(leagueData.table[i].progress !== 'ended'){
            if(leagueData.table[i].network === undefined || leagueData.table[i].network === ''){
                return <br></br>
            }
            else if(noLinks(leagueData.table[i].network)) {
                    return <div className="net">{leagueData.table[i].network} has no available links</div>
            }
            else if(leagueData.table[i].network !== undefined && streams.indexOf(leagueData.table[i].network) !== -1){
                return <a id="btn" href={leagueData.table[i].link} target="_blank" rel="noreferrer">Watch on {leagueData.table[i].network}</a>
            }
            else {
                return(
                    <div>
                        <a id="btn" href={getLink(leagueData.table[i].network)} target="_blank" rel="noreferrer" 
                            onClick={() => {navigate('/stream'); alert('Select ok to go to login for '+leagueData.table[i].network+
                            ', then make sure to update your stream preferences')}}>Log in to {leagueData.table[i].network}</a>
                    </div>
                    )
            }
            
        }
        else{
            return <br></br>
        }
    }
    function Time({i}){
        if(leagueData.table[i].time !== undefined){
            return <div id="time">{leagueData.table[i].time}</div>
        }
    }
    function Logo1({i}){
        if(leagueData.table[i].logo1 !== undefined){
            return(
                <img className='team-logo' width={30} height={30} src={leagueData.table[i].logo1} alt={leagueData.table[i].team1 + " logo"}/>
            )
        }
    }
    function Logo2({i}){
        if(leagueData.table[i].logo2 !== undefined){
            return(
                <img className='team-logo' width={30} height={30} src={leagueData.table[i].logo2} alt={leagueData.table[i].team2 + " logo"}/>
            )
        }
    }
    function Game({i}){
        if(typeof leagueData.table[i] === 'undefined'){
            return;
        }
        return(
            <div>
                <div className="games">
                    <div className='team-info'> {/*team-info is nested in games so position: absolute can be inside of a position: relative*/}
                        <Logo1 i={i}></Logo1>
                        <span className='team'>{leagueData.table[i].team1}</span>
                        <div className="scores">{leagueData.table[i].score1}</div>
                    </div>      
                </div>
                <div className="games">
                    <div className='team-info'>
                        <Logo2 i={i}></Logo2>
                        <span className='team'>{leagueData.table[i].team2}</span>
                        <div className="scores">{leagueData.table[i].score2}</div>
                    </div>
                </div>
                <Time i={i}></Time>
                <div className="net"><Net i={i}></Net></div>
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

    function Priority(){
        return(
            <div>
                <p>
                    Priorities: <br></br>
                    {makeCapital(priority[0])} <br></br>
                    {makeCapital(priority[1])} <br></br>
                    {makeCapital(priority[2])}
                </p>
            </div>
        )
      }

    return(
        <div>        
            <h1>{league} Games</h1>
            <div id="league-logo">
                <a href={'//localhost:3000/'+league}>
                    <button className="logo-img" type="submit" onClick={() => {setRefreshed(true); }}>
                        <img width={logoData.width} height={logoData.height} src={logoData.link} alt={league + " logo"}/>
                    </button>
                </a>
            </div>
            <h2>Click the league logo to refresh scores</h2>
            <div id="date">
                    <h2>{leagueData.table[leagueData.table.length-1].date}</h2>
                </div>
            <div id='league-row'>
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
            <Priority></Priority>           
        </div>
    )
}