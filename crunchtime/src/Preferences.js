import { useState } from "react";
import data from './json/preferences.json';
import { logos } from "./logos";

function makeCapital(lower){
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function Dropdowns(){
    let priority = [];
    function readCookies(){
        const getCookieValue = (name) => (
            document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
        )
        priority[0] = getCookieValue('Priority0');
        priority[1] = getCookieValue('Priority1');
        priority[2] = getCookieValue('Priority2');
    }
    readCookies();

    const [topPriority, setTop] = useState(priority[0]); 
    const [midPriority, setMid] = useState(priority[1]);
    const [lastPriority, setLast] = useState(priority[2]);

    function setCookies(choice, rank){
        if(rank === 0){
            if(priority[1] === choice){
                document.cookie = "Priority1="+priority[0];
                document.cookie = "Priority0="+choice;
            }
            else if(priority[2] === choice){
                document.cookie = "Priority2="+priority[1];
                document.cookie = "Priority1="+priority[0];
                document.cookie = "Priority0="+choice;
            }
            setMid(priority[0]); 
        } 
        else if(rank === 1){
            if(priority[2] === choice){
                document.cookie = "Priority2="+priority[1];
                document.cookie = "Priority1="+choice;
            }
        }   
        readCookies();
        setLast(priority[2]);
    }

    function LastDrop(){
        return(
            <select className="selectPriority" defaultValue={lastPriority}>
                <option value={lastPriority}>{makeCapital(lastPriority)}</option>
            </select>
        )
    }

    function MidDrop(){
        if(topPriority === 'diffs'){
            return(
                <select className="selectPriority" value={midPriority} onChange={(e) => {setMid(e.target.value); setCookies(e.target.value, 1)}}>
                    <option value="times">Times</option> 
                    <option value="standings">Standings</option>
                </select>
            )
        }
        else if(topPriority === 'times'){
            return(
                <select className="selectPriority" value={midPriority} onChange={(e) => {setMid(e.target.value); setCookies(e.target.value, 1)}}>
                    <option value="diffs">Diffs</option>
                    <option value="standings">Standings</option>
                </select>
            )
        }
        else if(topPriority === 'standings'){
            return(
                <select className="selectPriority" value={midPriority} onChange={(e) => {setMid(e.target.value); setCookies(e.target.value, 1)}}>
                    <option value="diffs">Diffs</option>
                    <option value="times">Times</option> 
                </select>
            )
        }
    }

    function TopDrop(){
        let topVal = priority[0];
        return(
            <div>
                Top:
                <select className="selectPriority" value={topVal} onChange={(e) => {setTop(e.target.value); setCookies(e.target.value, 0);}}>
                    <option value="diffs">Diffs</option>
                    <option value="times">Times</option> 
                    <option value="standings">Standings</option>
                </select>            
            </div>
        )
    }

    return(
        <div>
        <TopDrop></TopDrop>      
        2nd:<MidDrop></MidDrop>
        <br></br>
        3rd:<LastDrop></LastDrop>
        <br></br>
        Sort by games with closest scores (diffs),
        <br></br>closest to ending (times),
        <br></br>or highest average of 2 teams' league rankings (standings)
        <br></br><br></br>
        </div>  
    )
}

function Switch(){
    let takeVal;
    function readCookies(){
      const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
      )
      takeVal = getCookieValue('Take');
    }
    readCookies();
    const [take, setTake] = useState(takeVal === 'true'); //cookies are strings, so turn to boolean
    
    function changeTake(){
        document.cookie = "Take="+!take;
        setTake(!take);
        readCookies();
    }

    function TakeMe(){
        readCookies();
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

function ResetButton(){
    return(
        <button className="reset"type="button" onClick={e => document.cookie = "Reset=true"}> 
            Reset visit data 
        </button> 
    )
}

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
        return(   
            <div>
                <br></br>{current} 
            </div> 
        ) 
    }

    function LeagueList(){
        let leagueList = []; 
        for(let i = 2; i < data.length; i++){
        Object.values(logos).forEach((value, index) => 
        {  
                if(data[i][0] === Object.keys(logos)[index]){
                    leagueList[i] = (
                        <div key={"leagueId"+index} className="column">
                            <League current={data[i][0]}></League>
                            <Visits current={data[i][1]}></Visits>
                        </div>
                    )
                } 
            index++;
        })
    }
        return leagueList.reverse();
    }
    return(
        <div>
            <div id="times-visited">
                  <br></br><br></br><br></br>
                    Times Visited:
            </div>
            <div className="row">         
                <LeagueList></LeagueList>  
            </div>
        </div>
    )
}

export default function Preferences(){
    return(
    <div>
        <h1>Preferences</h1>
        <h3>Priorities:</h3>
        <Dropdowns></Dropdowns>

        <h4>Take me out to the ball (or puck) game:</h4>   
        <Switch></Switch>
        Turn on to be sent to a stream of #1 game by priority if available<br></br>
        (You must allow popups to automatically be redirected to your stream)

        <br></br><br></br>
        <ResetButton></ResetButton>
        <VisitData></VisitData>
    </div>
    )
}