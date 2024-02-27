import puppeteer from 'puppeteer';
import fs from 'fs';
import { all } from 'axios';

var league;
var priority;
var url;
var prefData;
var data = {};  //object json data will be stored in
var gameData = {};


//league and priority come from preferencs.json on original call
if (fs.existsSync('json/preferences.json')) {
    const parsedPrefs = JSON.parse(fs.readFileSync('json/preferences.json', 'utf-8'));
    league = parsedPrefs[0];
    priority = parsedPrefs[1];
}
else{   //current, priority, ranked leagues with time visited
    prefData = ['NHL', ['diffs', 'times', 'standings'], ['NHL', 0], ['NFL', 0], ['MLB', 0], ['NBA', 0]]; 
    fs.writeFile('json/preferences.json', JSON.stringify(prefData), function(err){
        if(err) throw err;
    }); 
    league = prefData[0];
    priority = prefData[1];
}

//visits league standings page and assigns an average of each team's standing
async function standingsScrape(data, league){
    console.log(league + ' standings');
    let url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    let teamRanks = [];
    teamRanks = await page.evaluate(() => {
        let standings = document.querySelectorAll('span.hide-mobile > a');
        standArr = Array.from(standings);
        standArr = standArr.map(game => game.textContent);
    return standArr;
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

    //close puppeteer browser
    await browser.close();
}

//converts time and saves it to data obj separately
function timeToObj(data, league){   
    //data[data.length-2].time = '7:30 - 1st';
    //data[data.length-1].time = '7:00 - 3rd';      //use to compare game starts with game progress during off times of day
    for(let i = 0; i < data.length; i++){
        data[i].convertedTime = timeConversion(league, data[i].time).toString();
    }
}

//puts game start tme into value that can be compared to game progress time
function militaryTime(time){
    time = time.split(':');
    time[0] = parseInt(time[0]);
    if(time[1].includes('PM')){
        time[0] += 12;
    }
    if(time[1].includes('Final')){

    }
    time[0] *= -60;
    time = time[0] - parseInt(time[1]);

    return time;
}

//sorts and ranks times for each game obj
function timeSort(data){
    let sorted = [];
    let times = [];
    
    for(let i = 0; i < data.length; i++){
        if(data[i].convertedTime.includes('Final')){
            times[i] = '0';
        }
        else if(data[i].convertedTime.includes('PM') || data[i].time.includes('AM')){
            times[i] = militaryTime(data[i].time);
        }
        else{
            times[i] = data[i].convertedTime;
        }
    }

    sorted = mergeSort(times).reverse();

    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data.length; j++){
            if(sorted[j] == times[i] && !data[i].time.includes('Final')){
                data[i].timeRank = j;
            }
            else if(data[i].time.includes('Final')){
                data[i].timeRank = data.length;
            }
        }
    }

    return data;
}

function diffSort(data){
    let ongoingDiffs = [];
    let endedDiffs = [];
    let unstartedLen = 0;

    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ongoing'){
            ongoingDiffs[i] = data[i].diff;
        }
        else if(data[i].progress == 'unstarted'){
            data[i].diffRank = data.length;
            unstartedLen++;
        }
    }
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ended'){
            endedDiffs[i-unstartedLen-ongoingDiffs.length] = data[i].diff;
        }
    }

    let ongoingSort = mergeSort(ongoingDiffs);
    
    let endedSort  = mergeSort(endedDiffs);
    
    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < ongoingSort.length; j++){
            if(data[i].diff == ongoingSort[j] && data[i].progress == 'ongoing'){
                data[i].diffRank = j;
            }
        }
        for(let j = 0; j < endedSort.length; j++){
            if(data[i].diff == endedSort[j] && data[i].progress == 'ended'){
                data[i].diffRank = j + ongoingSort.length;
            }
        }
    }
    for(let i = 0; i < data.length; i++){
        
    }

    return data;
}

function standingsSort(data){
    let ongoingStands = [];
    let unstartedStands = [];
    let endedStands = [];
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ongoing'){
            ongoingStands[i] = data[i].avgStanding;
        }
    }
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'unstarted'){
            unstartedStands[i-ongoingStands.length] = data[i].avgStanding;
        }
    }
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ended'){
            endedStands[i-ongoingStands.length-unstartedStands.length] = data[i].avgStanding;
        }
    }
    
    let onStandsSort = mergeSort(ongoingStands);
    let unstartStandsSort = mergeSort(unstartedStands);
    let endStandsSort = mergeSort(endedStands);

    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < ongoingStands.length; j++){
            if(data[i].progress == 'ongoing' && data[i].avgStanding == onStandsSort[j]){
                data[i].standRank = j
            }
        }
        for(let j = 0; j < unstartedStands.length; j++){
            if(data[i].progress == 'unstarted' && data[i].avgStanding == unstartStandsSort[j]){
                data[i].standRank = j + ongoingStands.length;
            }
        }
        for(let j = 0; j < endedStands.length; j++){
            if(data[i].progress == 'ended' && data[i].avgStanding == endStandsSort[j]){
                data[i].standRank = j + ongoingStands.length + unstartedStands.length;
            }
        }
    }

    return data;
}

function dropEmpties(data){
    for(let i = 0; i < data.length; i++){
        if(data[i] !== undefined){
            if(data[i].length == 0){
                data.splice(i, 1);
                i = i-1; //reset since changing length skips numbers
            }
        }
        else{
            data.splice(i, 1);
                i = i-1;
        }
    }
}

function toJson(data, league, date){
    let jsonData = {};
    jsonData.table = [];
    let obj = {};
    for(let i = 0; i < data.length; i++){
        if(data[i] !== undefined){
            for(let j = 0; j < data[i].length; j++){
                obj = {
                    team1: data[i][j].team1,
                    score1: data[i][j].score1,
                    team2: data[i][j].team2,
                    score2: data[i][j].score2,
                    progress: data[i][j].progress,
                    time: data[i][j].time,
                    network: data[i][j].network,
                    link: data[i][j].link
                }
                jsonData.table.push(obj);
            }
        }
        else{
            obj = {
                team1: data[i].team1,
                score1: data[i].score1,
                team2: data[i].team2,
                score2: data[i].score2,
                progress: data[i].progress,
                time: data[i].time,
                network: data[i].network,
                link: data[i].link
            }
            jsonData.table.push(obj);
        }
        
    }
    jsonData.table.push({date: date});
    fs.writeFile('json/' + league.toLowerCase()+'.json', JSON.stringify(jsonData), function(err){
        if(err) throw err;
    }); 
}

//calls each type of sort and uses those rankings with priorities to come up with final sorted order and save that to json
function finalSort(data, priority, league, date){
    data = timeSort(data);  //RENAME
    data = diffSort(data);  //RENAME
    data = standingsSort(data); //RENAME

    let sorted = [];
    let midSorted = [];
    let lastSorted = [];
    let allSorted = [];
    let endSorted = [];

    if(priority[0] == 'diffs'){
        for(let i = 0; i < data.length+1; i++){       //+1 because max diff/time/standing is set equal to length
            sorted[i] = [];
            for(let j = 0; j < data.length; j++){
                if(data[j].diffRank == i){
                    sorted[i].push(data[j]);
                }
            }
        }
        if(priority[1] == 'times'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].timeRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }
            
            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].standRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);                     
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
        else if(priority[1] == 'standings'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                                            
                            if(sorted[i][k].standRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }   
            
            dropEmpties(allSorted); 

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){                     
                    for(let j = 0; j < data.length+1; j++){                                              
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].timeRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);               
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }        
    }
    else if(priority[0] == 'times'){
        for(let i = 0; i < data.length+1; i++){    
            sorted[i] = [];
            for(let j = 0; j < data.length; j++){
                if(data[j].timeRank == i){
                    sorted[i].push(data[j]);
                }
            }
        }
        if(priority[1] == 'diffs'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].diffRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }

            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].standRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);             
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
        else if(priority[1] == 'standings'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                                            
                            if(sorted[i][k].standRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }   
            
            dropEmpties(allSorted); 

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){                     
                    for(let j = 0; j < data.length+1; j++){                                              
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].diffRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);               
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        } 
    }
    else if(priority[0] == 'standings'){
        for(let i = 0; i < data.length+1; i++){  
            sorted[i] = [];     
            for(let j = 0; j < data.length; j++){
                if(data[j].standRank == i){
                    sorted[i].push(data[j]);
                }
            }
        }
        if(priority[1] == 'diffs'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].diffRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }

            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].timeRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);             
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
        else if(priority[1] == 'times'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].timeRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        } 
                        allSorted.push(midSorted[j]);
                    }
                }
                else{
                    allSorted.push(sorted[i]);
                }
            }
            
            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].diffRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);                     
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
    }
    
    dropEmpties(endSorted);

    console.log(priority);
    console.log(endSorted); 
    toJson(endSorted, league, date); 
}

//scrapes all of the game data for a league
var scrape = async function scrape(league, priority){
    console.log('Current league: ' + league);
    console.log('Priority: ' + priority);
    url = 'https://www.espn.com/'+league.toLowerCase()+'/scoreboard';
    data.table = []; 
    
    //use puppeteer to open link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var fullDate, teams, times, scores, nets, numGames, unstarted;
    
    [fullDate, teams, times, scores, nets, numGames, unstarted] = await page.evaluate((league) => {
        fullDate = document.querySelector('.Card__Header__Title__Wrapper .Card__Header__Title').textContent;
        teams = [];
        scores = [];
        times = [];
        nets = [];
        teamLen = document.querySelectorAll('.AnchorLink .ScoreCell__TeamName').length;
        numGames = teamLen/2;

        times = document.querySelectorAll('.ScoreboardScoreCell__Overview .ScoreCell__Time');
        timeArr = Array.from(times);
        timeArr = timeArr.map(game => game.textContent);

        endedLen = 0;
        scoreLen = 0;
        notEnded = 0;
        unstarted = 0;

        for(let i = 0; i < teamLen; i++){
            teams[i] = document.querySelectorAll('.AnchorLink .ScoreCell__TeamName')[i];
            if(!(i%2) && timeArr[i/2].includes('Final')){
                endedLen++;
            }
            else if(!(i%2) && (timeArr[i/2].includes('PM') || timeArr[i/2].includes('AM'))){
                unstarted++;
            }
        }
        endedLen *= 2;  //each 1 game ended has 2 teams and scores
        scoreLen = document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score').length;
        notEnded = teamLen - endedLen;

        //put scores in array
        for(let j = 0; j < scoreLen; j++){
            scores[j] = document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score')[j];    
            if(scores[j] == null){
                scores[j] = '-';
            } 
        }
        scoreArr = Array.from(scores);
        scoreArr = scoreArr.map(game => game.textContent);  
        for(let k = scoreLen - endedLen; k < teamLen - endedLen; k++){
            scoreArr[k] = '-';  //placeholder before score exists
        }

        //scores only exist for ongoing and ended, so scores have to split around unstarted games
        //because ongoing games are always first and ended are always last on espn
        for(let m = teamLen - endedLen; m < teamLen; m++){
            scoreArr[m] =  document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score')[scoreLen - endedLen + m - notEnded].textContent;
        }

        //put networks in nodelist
        //nba doesn't have network
        if(!league.includes('NBA') && !league.includes('MLB')){
            for(let i = 0; i < notEnded/2; i++){   //networks shown only for unstarted and ongoing games
                nets[i] = document.querySelectorAll('.ScoreboardScoreCell .ScoreCell__NetworkItem')[i];
            }
        }
        
        //convert nodelists into arrays
        teamArr = Array.from(teams);
        teamArr = teamArr.map(game => game.textContent);  
        netArr = Array.from(nets);
        netArr = netArr.map(game => game.textContent);

        return [fullDate, teamArr, timeArr, scoreArr, netArr, numGames, unstarted];
    }, league);

    //date with day of the week stripped off
    let i = 0;
    for(i; i < fullDate.length; i++){
        if(fullDate[i] == ','){
          break;
        }
    }
    var date = [];
    for(let j = 0; j < fullDate.length; j++){
        date[j] = fullDate[i+2];
        i++;
    }
    date = date.toString().replace(',,,', '|').replaceAll(',', '').replace('|', ',');
    console.log(date + '\n');

    //sets progress and diff values
    var ongoingDiffs = [];
    var endedDiffs = [];
    var progress = [];
    var diffs = [];
    for(let i = 0; i < numGames; i++){   
        if(times[i].endsWith('PM') || times[i].endsWith('AM')){
            progress[i] = 'unstarted';
            diffs[i] = 100;
        }
        else if(times[i].includes('Final')){
            progress[i] = 'ended';
            diffs[i] = Math.abs(scores[i*2] - scores[i*2+1]);
            endedDiffs.push(diffs[i]);
        }
        else{
            progress[i] = 'ongoing';
            diffs[i] = Math.abs(scores[i*2] - scores[i*2+1]);
            ongoingDiffs.push(diffs[i]);
        } 
    }

    var channels = netToLink(nets, teams, progress, numGames);

    gameData.table = [];
    var gameObj = {};
    for(let i = 0; i < numGames; i++){
        gameObj = {
            team1: teams[2*i],
            score1: scores[2*i],
            team2: teams[2*i+1],
            score2: scores[2*i+1],
            progress: progress[i],  //unstarted, ended, ongoing
            time: times[i],   //time left or start time
            network: nets[i],
            link: channels[i],
            diff: diffs[i]
        }
        gameData.table.push(gameObj);
    } 

    const callStandings = async () => {
        await standingsScrape(gameData.table, league);

        timeToObj(gameData.table, league);
        finalSort(gameData.table, priority, league, date);
      }
      
    callStandings();

    //close puppeteer browser
    await browser.close();
}

//takes in listed channel and provides streaming link
//eventually use scrape to get specific game link, not just streamer
function netToLink(nets, teams, progress, numGames){
    //make sure to log in first
    const tnt = 'https://www.tntdrama.com/watchtnt/east';
    const espn = 'https://www.espn.com/watch/';
    const nbcsp = 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia';
    const fox = 'https://www.foxsports.com/live'
    const abc = 'https://abc.com/watch-live/abc'
    const channels = [];

    for(let i = 0; i < numGames; i++){  
        if(progress[i] != 'ended'){
            if(i > 0){
                if(nets[i-1] == 'ESPN+' && nets[i] == 'Hulu'){
                    nets[i-1] = 'ESPN+/Hulu';
                    nets[i] = nets[i-1];
                }
            }
            if((teams[i*2] == 'Flyers' || teams[i*2+1] == 'Flyers') && (nets[i] != 'ABC' || nets[i] != 'TNT')){
                channels[i] = nbcsp;    //TO DO: when on regular espn or tnt Flyers aren't on nbcsp
                nets[i] = 'NBCSP';
            }  
            else if(nets[i] == 'TNT'){
                channels[i] = tnt;
            }
            else if(nets[i] == 'ESPN' || nets[i] == 'ESPN+' || nets[i] == 'NHLPP|ESPN+' || nets[i] == 'ESPN+/Hulu' || nets[i] == 'Hulu'){
                channels[i] = espn;        
            }  
            else if(nets[i] == 'FOX'){
                channels[i] = fox;
            }
            else if(nets[i] == 'ABC'){
                channels[i] = abc;
            }
            else { 
                channels[i] = '';
            }   
        }
    }
    return channels;
}

//merge & mergesort to rank the diffs
function merge(left, right){
    let sortedArr = [];
    while(left.length && right.length){
        if(left[0] < right[0]){
            sortedArr.push(left.shift());
        }
        else{
            sortedArr.push(right.shift());
        }
    }
    return [...sortedArr, ...left, ...right];
}
function mergeSort(arr){
    if(arr.length <= 1) return arr;
    let mid = Math.floor(arr.length /2 );
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

//take in time left in a game and convert it in order to compare
function timeConversion(league, time){
    time = String(time);
    let units = null;
    let unitLen = 0;    //in seconds if applicable
    let unitMax;
    if(league == 'NHL'){
        units = 'periods';
        unitLen = 1200;
        unitMax = 3;
        if(time.includes('SO') && !time.includes('Final')) return 5 * unitLen;
    }
    else if(league == 'NFL'){
        units = 'quarters';
        unitLen = 900;
        unitMax = 4;
    }
    else if(league == 'NBA'){
        units = 'quarters';
        unitLen = 720;
        unitMax = 4;
    }
    else if(league == 'MLB'){
        units = 'innings'
        unitMax = 9;
    }
    
    //format: mins, seconds, period or quarter
    if(time.includes('End')){
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
        time = [0, 0, parseInt(time) + 1];
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

scrape(league, priority);

export function callScrape(league, priority){
    scrape(league, priority);
}

export default scrape;