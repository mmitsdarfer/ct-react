//handles scraping standings and anything with time

import fs from 'fs';
import puppeteer from 'puppeteer';

const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

//take in time left in a game and convert it in order to compare
export function timeConversion(league, time){
    time = String(time);
    let unitLen = 0;    //in seconds if applicable
    let unitMax;
    if(league == 'NHL'){
        unitLen = 1200;
        unitMax = 3;
        if(time.includes('SO') && !time.includes('Final')) return 5 * unitLen;
    }
    else if(league == 'NFL'){
        unitLen = 900;
        unitMax = 4;
    }
    else if(league == 'NBA'){
        unitLen = 720;
        unitMax = 4;
    }
    else if(league == 'MLB'){
        unitMax = 9;
    }
    
    //format: mins, seconds, period or quarter
    if(time == 'Postponed' || time == 'Canceled'){
        time = '11:59 PM';
    }
    if(time.includes('End') && league != 'MLB'){
        time = [0, 0, (parseInt(time.slice(-3))).toString()];
    }
    else if(time == 'OT'){
        time = [0, 0, unitMax.toString()];
    }
    else if(time.includes('Halftime')){
        time = [0, 0, (unitMax/2).toString()];
    }
    else if(time.includes('Delayed')){
        time = [unitLen/60, 0, (1).toString()];
    }
    else if(time.includes('AM') || time.includes('PM') || time.includes('Final')){
        return time;
    }
    else if(time.length == 3){
        time = [0, 0, (parseInt(time) + 1).toString()]; //as period ends the time disappears but the period remains,
                                                        //so set time to beginning of next period
    }
    else if(league == 'MLB'){
        time = time.split(' ');
        let frame;
        time[1] = parseInt(time[1]);
        if(time[0] == 'Top'){
            frame = 0;
        }
        else if(time[0] == 'Mid'){
            frame = 1;
        }
        else if(time[0] == 'Bot'){
            frame = 2;
        }
        else if(time[0] == 'End'){
            frame = 3;
        }
        else if(time[0] == 'Rain'){
            time[1] = parseInt(time[3]);
            if(time[2] == 'Top'){
                frame = 0;
            }
            else if(time[2] == 'Mid'){
                frame = 1;
            }
            else if(time[2] == 'Bot'){
                frame = 2;
            }
            else if(time[2] == 'End'){
                frame = 3;
            }
        }
        
        time = 2 * time[1] + frame;
        return time;
    }
    else{    
        time = time.split(' - ');
        if(time[0].includes(':')){
            let hold = time[0].split(':');
            time = time.concat(hold);         
            time[0] = time[2];
            time[2] = time[1];
            time[1] = time[3];
        }
        else{
            time[2] = time[1];
            time[1] = time[0];
            time[0] = '0';
        }
        time = time.slice(0,3);    
        time[0] = parseInt(time[0]);
        time[1] = parseInt(time[1]);
    }   
    
    if((time[2].includes('OT'))){
        if(!isNaN(parseInt(time[2]))){
            time[2] = parseInt(time[2]);    //if multiple OTs, which one
        }
        else{
            time[2] = 1;
        }        
        time[2] = time[2] + unitMax;
    }
    else{
        time[2] = parseInt(time[2]);
    }
    
    time[0] = time[0] * 60;
    time[0] = time[0] + time[1];
    time[1] = time[2] - 1;
    time = time.slice(0,2);
    time = time[1] * unitLen + (unitLen - time[0]);
    return time;
}

//compares current timestamp with last standings check
function dateAndTime(last, current){  
    let timeDiff = current - last; 
    let diffHrs = Math.round(timeDiff / (1000 * 3600));
    var cDate = new Date(current); 
    console.log('current timestamp: ' + cDate.toString());
    var lDate = new Date(last); 
    console.log('last timestamp: ' + lDate.toString());
    if(diffHrs > 3){
        return true;
    }
    return false;
}

//if league is in standings, how long since it was updated?
export async function needStandings(league){ 
    /*
    let currentDate = new Date().getTime();
    const parsedStands = JSON.parse(fs.readFileSync('../json/standings.json', 'utf-8'));
    for(let i = 0; i < Object.keys(parsedStands.table).length; i++){
        if(parsedStands.table[i].league == league){
            let last = parsedStands.table[i].time;
            return dateAndTime(last, currentDate);
        }
    }
        */
    return null;
}

export async function reuseStands(league, data){
    /*
    const parsedStands = JSON.parse(fs.readFileSync('../json/standings.json', 'utf-8'));
    let leagueIndex; 
    let standings = {};
    standings.table = [];
    standings = parsedStands;
    for(let i = 0; i < Object.keys(parsedStands.table).length; i++){
        if(parsedStands.table[i].league == league){
            leagueIndex = i;
        }
    }

    let dateOut = parsedStands.table[leagueIndex].time;
    let teamRanks = parsedStands.table[leagueIndex].standings;
    standings.table.splice(leagueIndex, 1);
    standings.table.push({
        league: league,
        time: dateOut,
        standings: teamRanks
    });

    let gameRanks = [];
    for(let i = 0; i < data.length; i++){
        gameRanks[i] = [];
        for(let j = 0; j < teamRanks.length; j++){
            if(teamRanks[j].includes(data[i].team1)){        
                gameRanks[i].push(data[i].team1, j);    
            }
        }
        for(let j = 0; j < teamRanks.length; j++){
            if(teamRanks[j].includes(data[i].team2)){        
                gameRanks[i].push(data[i].team2, j);      
            }
        }
        data[i].avgStanding = (gameRanks[i][1] + gameRanks[i][3]) / 2;
    }
    return data;
    */
}

export async function standingsScrape(league, data, needUpdate, haveJson){
    let standings = {};
    standings.table = [];
    let teamRanks = [];
    let currentDate = new Date().getTime();
    let leagueIndex;  
    let dateOut;

    let results;

    const loadLatest = async () => {
        results = await fetch(`${baseUrl}/standings`).then(resp => resp.json());
        if(results[0] === undefined){
            update = false;
            return;
        }
        
       /* let dbDate = new Date (Date.parse(results[0].leagueDate)); //date of most recent db entry
        dbDate = dbDate.getFullYear() + '-' + (dbDate.getMonth()+1) + '-' + dbDate.getDate();
        if(leagueDate === dbDate) {
            id = results[0]._id;
        }
        else update = false;  
        */
    }
    await loadLatest();
   // console.log(results[0].MLB)
    standings = results[0].MLB;
    console.log('11111111')
    console.log(standings)

    const updateDb = async () => {
        await fetch(`${baseUrl}/standings/${league}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(
            {
                league: league,
            standings: standings
          })
        });
    }

    /*
    if(haveJson){
        const parsedStands = JSON.parse(fs.readFileSync('../json/standings.json', 'utf-8'));
        standings = parsedStands;
        for(let i = 0; i < Object.keys(parsedStands.table).length; i++){
            if(parsedStands.table[i].league == league){
                leagueIndex = i;
            }
        }
        if(needUpdate) standings.table.splice(leagueIndex, 1); //if already in json, remove to replace it
    }
    */
    console.log(standings)
    

    console.log(league + ' standings');
    dateOut = currentDate;
    let url;
    if(league === 'MLB') url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/overall'; 
    else url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);         
    teamRanks = await page.evaluate(() => {
        let getStands = document.querySelectorAll('span.hide-mobile > a');
        let standArr = Array.from(getStands);
        standArr = standArr.map(game => game.textContent);
        return standArr;
    });
    
    await browser.close();
    standings = {
        time: dateOut,
        standings: teamRanks
    };
    updateDb();

    fs.writeFile('../json/standings.json', JSON.stringify(standings), function(err){
        if(err) throw err;
     });
    let gameRanks = [];
    for(let i = 0; i < data.length; i++){
        gameRanks[i] = [];
        for(let j = 0; j < teamRanks.length; j++){
            if(teamRanks[j].includes(data[i].team1)){        
                gameRanks[i].push(data[i].team1, j);    
            }
        }
        for(let j = 0; j < teamRanks.length; j++){
            if(teamRanks[j].includes(data[i].team2)){        
                gameRanks[i].push(data[i].team2, j);      
            }
        }
        data[i].avgStanding = (gameRanks[i][1] + gameRanks[i][3]) / 2;
    }
    return data;
}

export default standingsScrape;