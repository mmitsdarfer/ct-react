import {TopPriority, MidPriority, LastPriority} from "./prefFunctions";
import { useState } from "react";

export default function Learning(){
    function setD({numVal}){
        if({numVal} == 0){
            document.cookie = "Priority0=diffs";
            return (
                <div>
                    <option value="diffs">Diffs</option>
                    <option value="diffs">Diffs</option>
                </div>
                
            )
        }
    }

    function Home(){
        return (
            <a className="home" href="//localhost:8000">
            <button className="home" type="submit"> 
                <br></br><img type="image" width="70" height="70" src="goHome.png"/>
            </button> 
        </a>
        )
    }
    
    const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    )
    let priority = [];
    priority[0] = getCookieValue('Priority0');
    priority[1] = getCookieValue('Priority1');
    priority[2] = getCookieValue('Priority2');

    const [likes,setLikes] = useState(0);

    function handleTopClick(){
        setLikes(likes);
        console.log('!!!!!!!!!!');
    }
    
    function Priority(){
        return(
            <div>
                <br id="priority-break"></br>
                <div className="priority">
                    Top:&nbsp;
                    <TopPriority chosenTop={priority[0]} chosenMid={priority[1]} handleClick={handleTopClick}></TopPriority>
                    <MidPriority chosenTop={priority[0]} chosenMid={priority[1]}></MidPriority>
                    <LastPriority chosenLast={priority[2]}></LastPriority>
                </div>
            </div>
        )
    }

    function TopDrop({topChoice, midChoice, lastChoice}){
        return(
        <select className="selectPriority">
            <option value={topChoice}>{topChoice.charAt(0).toUpperCase() + topChoice.slice(1)}</option>
            <option value={midChoice}>{midChoice.charAt(0).toUpperCase() + midChoice.slice(1)}</option> 
            <option value={lastChoice}>{lastChoice.charAt(0).toUpperCase() + lastChoice.slice(1)}</option>
        </select>
        )
    }
    function MidDrop({midChoice, lastChoice}){
        return(
            <select className="selectPriority">
                <option value={midChoice}>{midChoice.charAt(0).toUpperCase() + midChoice.slice(1)}</option> 
                <option value={lastChoice}>{lastChoice.charAt(0).toUpperCase() + lastChoice.slice(1)}</option>
            </select>
        )
    }
    function LastDrop({lastChoice}){
        return(
            <select className="selectPriority">
                 <option value={lastChoice}>{lastChoice.charAt(0).toUpperCase() + lastChoice.slice(1)}</option>
            </select>
        )
    }
    function StartUp({topChoice, midChoice, lastChoice}){
        return(          
            <div className="priority">
                <TopDrop topChoice={priority[0]} midChoice={priority[1]} lastChoice={priority[2]}></TopDrop>
                <br></br><br></br>
                <MidDrop midChoice={priority[1]} lastChoice={priority[2]}></MidDrop>
                <br></br><br></br>
                <LastDrop lastChoice={priority[2]}></LastDrop>
            </div>
        )
    }

    return(
        <div>
            <h1>Preferences</h1>
            <Home></Home>
            Priority <Priority></Priority>
            <StartUp topChoice={priority[0]} midChoice={priority[1]} lastChoice={priority[2]}></StartUp>
        </div>
    )
}