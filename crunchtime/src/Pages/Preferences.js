import { useEffect, useState } from "react";
import data from '../json/preferences.json';
import { logos } from '../logos';

const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

/*
read preference db
show on this page
if changes made update db
*/

function makeCapital(lower){
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function Preferences(){
    document.title = 'Crunch Time: Preferences';
    const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    )
    let resVal = getCookieValue('Reset');
    const [reset, setReset] = useState(resVal); 

    function ResetButton(){
        return(
            <button id="reset" type="button" onClick={(e) => {document.cookie = "Reset=true"; setReset('true')}}> 
                Reset visit data 
            </button> 
        )
    }

    const USER = 'mikeymits'; //TODO: replace with login
    const [priority, setPriority] = useState(['times', 'diffs', 'stands']);
    const [nets, setNets] = useState(["TNT","ESPN+","FOX","ABC","NBC","CBS","AppleTV+","TBS","FS1","MLB Network","MLBTV","NBATV","NBC Sports (local)"]);
    const [leagues, setLeagues] = useState([{NBA: 0}, {MLB: 0}, {NFL: 0}, {NHL: 0}]);
    const [take, setTake] = useState(false);
    const [refresh, setRefresh] = useState(0);

    const [topPriority, setTop] = useState(); 
    const [midPriority, setMid] = useState();
    const [lastPriority, setLast] = useState();
    
    useEffect(() => {
        async function loadLatest(){
            let results = await fetch(`${baseUrl}/preferences/${USER}`)
            .then(resp => resp.json())
            .catch(err => {console.log(`No user "${USER}" found`)});
            if(results === undefined){
                results = {
                    priority: ['diffs', 'times', 'stands'],
                    streams: nets,
                    leagues: [{NBA: 0}, {MLB: 0}, {NFL: 0}, {NHL: 0}],
                    take: take,
                    refresh: refresh
                }
                //top = diffs, mid = times, last = stands
            }
            else{           
                setPriority(results.priority);
                setTop(results.priority[0]);
                setMid(results.priority[1]);
                setLast(results.priority[2]);
                setNets(results.streams);
                setLeagues(results.leagues);
                setTake(results.take);
                setRefresh(results.refresh);
            }
            
        }
        loadLatest();
        //line below gets rid of misleading warning
        // eslint-disable-next-line
    }, []);   
    
    async function updateDbPriority(top, mid, last){
            await fetch(`${baseUrl}/preferences/${USER}`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                user: USER, 
                priority: [top, mid, last], 
                streams: nets,
                leagues: leagues,
                take: take,
                refresh: refresh
            })
            });
            console.log('Priority updated');
    }
    
    function Dropdowns({priority}){    
        function TopDrop(){
            return(
                <div className="drop">
                    Top:
                    <select className="select-priority" value={topPriority} onChange={(e) => {
                        setTop(e.target.value); 
                        if(e.target.value !== priority[1]){
                            setPriority([e.target.value, priority[0], priority[1]]);
                            updateDbPriority(e.target.value, priority[0], priority[1]);
                        }
                        else{
                            setPriority([e.target.value, priority[0], priority[2]]);
                            updateDbPriority(e.target.value, priority[0], priority[2]);
                        }
                        setMid(priority[0]);
                        setLast(priority[2]);                        
                    }}>
                        <option value="diffs">Diffs</option>
                        <option value="times">Times</option> 
                        <option value="stands">Stands</option>
                    </select>            
                </div>
            )
        }
    
        function MidDrop(){
            if(priority[0] === 'diffs'){
                return(
                    <div className="drop">
                        2nd:
                    <select className="select-priority" value={midPriority} onChange={(e) => {
                        setMid(e.target.value); 
                        setPriority([priority[0], e.target.value, priority[1]]);
                        setLast(priority[2]);
                        updateDbPriority(priority[0], e.target.value, priority[1]);
                    }
                    }>
                        <option value="times">Times</option> 
                        <option value="stands">Stands</option>
                    </select>
                    </div>
                )
            }
            else if(priority[0] === 'times'){
                return(
                    <div className="drop">
                        2nd:
                        <select className="select-priority" value={midPriority} onChange={(e) => {
                            setMid(e.target.value);
                            setPriority([priority[0], e.target.value, priority[1]]);
                            setLast(priority[2]);
                            updateDbPriority(priority[0], e.target.value, priority[1]);
                            }}>
                        <option value="diffs">Diffs</option>
                        <option value="stands">Stands</option>
                    </select>
                    </div>
                    
                )
            }
            else if(priority[0] === 'stands'){
                return(
                    <div className="drop">
                        2nd:
                        <select className="select-priority" value={midPriority} onChange={(e) => 
                            {setMid(e.target.value);
                            setPriority([priority[0], e.target.value, priority[1]]);
                            setLast(priority[2]);
                            updateDbPriority(priority[0], e.target.value, priority[1]);
                            }}>
                            <option value="diffs">Diffs</option>
                            <option value="times">Times</option> 
                        </select>
                    </div>             
                )
            }
        }
    
        function LastDrop(){
            return(
                <div className="drop">
                    3rd:
                <select className="select-priority" defaultValue={lastPriority}>
                    <option value={priority[2]}>{makeCapital(priority[2])}</option>
                </select>
                </div>
               
            )
        }
    
        return(
            <div>
                <TopDrop></TopDrop>     
                <MidDrop></MidDrop>
                <LastDrop></LastDrop>     
                <br></br>
                Sort by games with closest scores (diffs),
                <br></br>closest to ending (times),
                <br></br>or highest average of 2 teams' league rankings (stands)
                <br></br><br></br>
            </div>  
        )
    }

    function Switch(){  
        async function updateDbTake(newTake){
            await fetch(`${baseUrl}/preferences/${USER}`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                user: USER, 
                priority: [topPriority, midPriority, lastPriority], 
                streams: nets,
                leagues: leagues,
                take: newTake,
                refresh: refresh
            })
            });
            console.log('Take updated');
    }
        
        function changeTake(){
            updateDbTake(!take);
            setTake(!take);
        }
    
        function TakeMe(){
            return( 
                <input className="switch-input" id="check" type="checkbox" onChange={e => changeTake()} checked={take}/>
            )
        }

        return(
          <div>
            <label className="switch">
              <TakeMe></TakeMe>
              <span className="switch-label" data-on="On" data-off="Off"></span> 
              <span className="switch-handle"></span> 
            </label>
          </div>
          
        )
    }
    
    function Timer(){  
        async function updateDbTimer(newTime){
            await fetch(`${baseUrl}/preferences/${USER}`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                user: USER, 
                priority: [topPriority, midPriority, lastPriority], 
                streams: nets,
                leagues: leagues,
                take: take,
                refresh: newTime
            })
            });
            console.log('Timer updated');
        }

        return(
            <div>
                <br></br><h4>Choose auto-refresh frequency:</h4>
                <div id="timer">
                    <select id="select-timer" defaultValue={refresh} onChange={(e) => {
                        document.cookie = "Timer="+e.target.value;
                        updateDbTimer(e.target.value);
                        }}>
                        <option value="0">Don't auto refresh</option>
                        <option value="30">30 seconds</option> 
                        <option value="60">1 minute</option> 
                        <option value="300">5 minutes</option> 
                    </select>
                </div>          
            </div>  
        )
    }

    //nested in Preferences function because it uses state of reset
    function VisitData(){
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
        function Visits({current}){
            if(reset === 'true'){
                return(
                    <div>
                     <br></br>0 
                    </div> 
                )
            }
            return(   
                <div>
                    <br></br>{current} 
                </div> 
            ) 
        }
    
        function LeagueList(){
            let leagueList = []; 
            for(let i = 3; i < data.length; i++){
            Object.values(logos).forEach((value, index) => 
            {  
                if(data[i][0] === Object.keys(logos)[index]){
                    leagueList[i] = (
                        <div key={"leagueList"+(i-2)}>
                            <div key={"leagueId"+index} className="column">
                                <League current={data[i][0]}></League>
                            </div>
                            <div key={"visitId"+index}>
                                <Visits current={data[i][1]}></Visits>
                            </div>
                        </div>      
                    )
                } 
                index++;
            })
        }
            return leagueList.reverse();
        }

        return(
            <div className="logo-vis">
                <div> 
                    <div id="vert-space"></div>         
                    Times Visited:
                </div> 
                <LeagueList></LeagueList>
                <div id="spacer">          
                </div>               
            </div>            
        )
    }

    return(
    <div>
        <h1>Preferences</h1>
        <h3>Priorities:</h3>
        <Dropdowns priority={priority}></Dropdowns>

        <h4>Take me out to the ball (or puck) game:</h4>   
        <Switch></Switch>
        Turn on to be sent to a stream of #1 game by priority if available<br></br>
        (You must allow popups to automatically be redirected to your stream)<br></br>
        <br></br>

        <a href={'//localhost:3000/stream'}>
            <button id="reset" type="submit">Change stream preferences</button>
        </a>

        <br></br>
        <Timer></Timer>

        <br></br><br></br>
        <ResetButton></ResetButton>
        <VisitData></VisitData>
    </div>
    )
}