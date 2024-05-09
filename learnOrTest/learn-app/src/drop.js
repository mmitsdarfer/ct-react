import { /*useEffect,*/ useState } from "react";

export default function Drop(){
    let priority = [];
    function readCookies(){
        const getCookieValue = (name) => (
            document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
        )
        priority[0] = getCookieValue('Priority0');
        priority[1] = getCookieValue('Priority1');
        priority[2] = getCookieValue('Priority2');
        console.log(priority);
    }
    readCookies();

    const [topPriority, setTop] = useState(priority[0]); 
    const [midPriority, setMid] = useState(priority[1]);
    const [lastPriority, setLast] = useState(priority[2]);

    function makeCapital(lower){
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

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
            <select className="selectPriority" value={lastPriority}>
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
        <h1></h1>
        <TopDrop></TopDrop>
        
        <MidDrop></MidDrop>
        <br></br>
        <LastDrop></LastDrop>
        </div>
        
    )
}