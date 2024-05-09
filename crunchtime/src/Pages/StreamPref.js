import { useState } from "react";
import prefData from '../json/preferences.json';

export default function Stream(){
    document.title = 'Crunch Time: Streams';
    let netLinks = [['TNT', 'https://www.tntdrama.com/watchtnt/east'], ['ESPN+', 'https://www.espn.com/watch/'], ['FOX', 'https://www.foxsports.com/live'],
            ['ABC', 'https://abc.com/watch-live/abc'], ['AppleTV+', 'https://tv.apple.com/us/room/apple-tv-major-league-baseball/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2'],
            ['TBS', 'https://www.tbs.com/watchtbs/east'], ['FS1', 'https://www.foxsports.com/live/fs1'], ['MLB Network', 'https://www.mlb.com/network/live?success=true'],
            ['MLBTV', 'https://www.mlb.com/tv'], ['NBATV', 'https://www.nba.com/watch/nba-tv'],
            ['NBC Sports (local)', 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia']]; 
    let nets = prefData[2];
    if(nets === null) nets = netLinks.map(net => net[0]);    

    const [availNets, setAvailNets] = useState(nets); 
    

        
    function postNets(data){
        fetch('http://localhost:8000/stream',{
            method: "POST",
            headers: {
                'Accept': 'application/json , text/plain',
                'Content-Type': 'application/json'            
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.text())
        .then((result) => {
           // console.log(JSON.parse(result));
            //setAvailNets(JSON.parse(result));
        })
        .catch(err => {console.log(err)})
    }
    
    function NetBox(){
        let allNets = [];
        for(let i = 0; i < netLinks.length; i++){
            function handleCheck(e){ //nested to use i
                let temp = availNets;
                if(e.target.checked){
                    temp[i] = e.target.value; 
                    setAvailNets(temp);
                }
                else {
                    temp[i] = false;
                    setAvailNets(temp);
                }   
                postNets(availNets);             
            }
    
            allNets.push(
                <div key={netLinks[i][0]+'box'} className="net-box">
                    <input className="net-check" value={netLinks[i][0]} type="checkbox" defaultChecked={availNets[i] === netLinks[i][0]} onChange={handleCheck}></input>
                    <span className="net-text">{netLinks[i][0]}</span>         
                        <button className="net-button" type="submit" onClick={() =>  window.open(netLinks[i][1])}>Let me try</button>          
                    <br></br><br></br>
                </div>
            )
        }
        return allNets;
    }

    postNets(availNets);
    

    return(
    <div>
        <h1>Stream Preferences</h1>
        <h3>Select the streams you have access to:</h3>
        (or open the site to see if you can log in) <br></br><br></br>
        <NetBox></NetBox>
    </div>
    )
}