//scrape w/o optimized use of prioritiese

import puppeteer from 'puppeteer';
import fs from 'fs';

var league;
var priority;
var url;
var prefData;
var data = {};  //object json data will be stored in

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


async function standingsScrape(league, url, numGames, teams, scores, progress, times, nets, channels, date){
    console.log(league + ' standings');
    console.log(url);
    
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
    
    let standingAvg = [];
    for(let i = 0; i < teamRanks.length; i++){
        for(let j = 0; j < teamRanks.length; j++){
            if(teamRanks[i].includes(teams[j])){        
                teamRanks[i] = teams[j];      
            }
        }
    }

    for(let i = 0; i < numGames; i++){
        standingAvg[i] = (teamRanks.indexOf(teams[2*i]) + teamRanks.indexOf(teams[2*i+1])) / 2; 
    }

    let sortedAvgs = mergeSort(standingAvg);
    let position = [];
    for(let i = 0; i < numGames; i++){
        position[i] = [];
        for(let j = 0; j < numGames; j++){
            if(sortedAvgs.indexOf(standingAvg[j]) == i){
                position[i].push([standingAvg[j], j]);
            }
        }
    }

    for(let i = 0; i < numGames; i++){
        for(let j = 0; j < numGames; j++){
            if(position[i][j] != undefined){
                toJson(teams[2*position[i][j][1]], teams[2*position[i][j][1] +1],
                    scores[2*position[i][j][1]], scores[2*position[i][j][1] + 1],
                    progress[position[i][j][1]], times[position[i][j][1]],
                    nets[position[i][j][1]], channels[position[i][j][1]]);
                if(nets[position[i][j][1]] != undefined){
                    console.log(nets[position[i][j][1]] + ': ' + channels[position[i][j][1]]);
                }
                console.log(times[position[i][j][1]] + '\nProgress: ' + 
                    progress[position[i][j][1]] + '\n' + teams[2*position[i][j][1]]
                    + '  ' + scores[2*position[i][j][1]] + '\n' + teams[2*position[i][j][1]+1]
                    + '  ' + scores[2*position[i][j][1]+1] + '\n');
            }
        }
    }

    data.table.push({date: date});
    fs.writeFile('json/' + league.toLowerCase()+'.json', JSON.stringify(data), function(err){
        if(err) throw err;
    }); 

    //close puppeteer browser
    await browser.close();

    
}


var scrape = async function scrape(league, priority){
    console.log('Current league: ' + league);
    console.log('Priority: ' + priority);
    url = 'https://www.espn.com/'+league.toLowerCase()+'/scoreboard';
    data.table = []; 
    
    //use puppeteer to open link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var fullDate, teams, times, scores, nets, numGames, league, unstarted;
    
    [fullDate, teams, times, scores, nets, numGames, league, unstarted] = await page.evaluate(() => {
        league = document.querySelectorAll('#fitt-analytics > div > div.HeaderScoreboardWrapper > div > section > div > div:nth-child(1) > div > select.dropdown__select.dropdown__select--sizing.absolute.w-auto > option');
        
        leagueArr = Array.from(league);
        leagueArr = leagueArr.map(game => game.textContent);
        league = leagueArr[0];
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
        if(!league.includes('NBA')){
            for(let i = 0; i < notEnded/2; i++){   //networks shown only for unstarted and ongoing games
                nets[i] = document.querySelectorAll('.ScoreboardScoreCell .ScoreCell__NetworkItem')[i];
            }
        }
        
        //convert nodelists into arrays
        teamArr = Array.from(teams);
        teamArr = teamArr.map(game => game.textContent);  
        netArr = Array.from(nets);
        netArr = netArr.map(game => game.textContent);

        return [fullDate, teamArr, timeArr, scoreArr, netArr, numGames, league, unstarted];
    });


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

    var diffTies;
    var diffTimes;
    var endedSort = mergeSort(endedDiffs); 
    if(priority[0] == 'diffs'){
        [diffTies, diffTimes] = diffSort(ongoingDiffs, times, diffs, progress);
        
        //TODO: make this so if #2 priority == times
        diffsWithTimes(diffTies, diffTimes, progress, teams, scores, times, nets, channels);
        showUnstarted(numGames, progress, teams, scores, times, nets, channels);
        endedDiffSort(endedDiffs, progress, endedSort, diffs, teams, scores, times, nets, channels, numGames);
    data.table.push({date: date});

    }
    else if(priority[0] == 'times'){
        getTimeTies(times, progress, teams, scores, nets, channels);
        showUnstarted(numGames, progress, teams, scores, times, nets, channels);
        timesThenDiffs(endedSort, numGames, diffs, teams, scores, progress, times, nets, channels);
    data.table.push({date: date});

    }
    else if(priority[0] == 'standings'){
        const parsedPrefs = JSON.parse(fs.readFileSync('json/preferences.json', 'utf-8'));
        league = parsedPrefs[0];
        let standingsUrl = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
        standingsScrape(league, standingsUrl, numGames, teams, scores, progress, times, nets, channels, date);


        //TODO: SORT BY STANDINGS
    }
    
    //create json file

    
    fs.writeFile('json/' + league.toLowerCase()+'.json', JSON.stringify(data), function(err){
        if(err) throw err;
    }); 

    //close puppeteer browser
    await browser.close();
}

function showUnstarted(numGames, progress, teams, scores, times, nets, channels){
    for(let i = 0; i < numGames; i++){
        if(progress[i] == 'unstarted'){
            toJson(teams[2*i], teams[2*i+1], scores[2*i], scores[2*i+1], progress[i], times[i], nets[i], channels[i]);
            if(nets[i] != undefined){
                console.log(nets[i] + ': ' + channels[i]);
             } 
             console.log(times[i] + '\n' + 'Progress ' + progress[i] + '\n' + 
             teams[i*2] + '  ' + scores[i*2] + '\n' + teams[i*2+1] + '  ' + scores[i*2+1] +'\n');
        }
    }
}

function getTimeTies(times, progress, teams, scores, nets, channels){
    let convertedTimes = []
    let timeTies = [];
    for(let i = 0; i < times.length; i++){
        if(progress[i] == 'ongoing'){
            convertedTimes[i] = timeConversion(league, times[i]);
        }
    }
    var ongoingTimes = times.slice(0, -(times.length-convertedTimes.length));

    //sorted times (and no nan) comes from ongoingtimes 
    //time ties from convert times
    
    let sortedTimes = timeSort(league, ongoingTimes);
    let sortedTimesNoNan = [];
    for(let i = 0; i < sortedTimes.length; i++){
        if(!isNaN(sortedTimes[i][0])){
            sortedTimesNoNan.push(sortedTimes[i]);
        } 
    }
    
    var shortTimes = [];
    for(let i = 0; i < sortedTimesNoNan.length; i++){
        shortTimes[i] = sortedTimesNoNan[i][0];
    }
    for(let i = 0; i < sortedTimesNoNan.length; i++){
        timeTies[i] = [];
        for(let j = 0; j < sortedTimes.length; j++){
            if(shortTimes.indexOf(convertedTimes[j]) == i){
                timeTies[i].push(convertedTimes[j], j);
            }
        }
    }
    for(let i = 0; i < timeTies.length; i++){
        //what to do if time and scores are both same?? (happened first halftime I implemented this) 
        toJson(teams[2*timeTies[i][1]], teams[2*timeTies[i][1]+1], scores[2*timeTies[i][1]], scores[2*timeTies[i][1]+1],
            progress[timeTies[i][1]], times[timeTies[i][1]], nets[timeTies[i][1]], channels[timeTies[i][1]]);
        if(nets[timeTies[i][1]] != undefined){
            console.log(nets[timeTies[i][1]] + ': ' + channels[timeTies[i][1]]);
        }
        console.log(times[timeTies[i][1]] + '\nProgress:  ' +
        progress[timeTies[i][1]] + '\n' + teams[2*timeTies[i][1]]
        + '  ' + scores[2*timeTies[i][1]] + '\n' + teams[2*timeTies[i][1]+1]
        + '  ' + scores[2*timeTies[i][1]+1] +'\n');
    }

    let endedAmt = times.length - ongoingTimes.length;
    for(let i = 0; i < endedAmt; i++){

    }

    return timeTies;
}

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
            if(teams[i*2] == 'Flyers' || teams[i*2+1] == 'Flyers'){
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

function diffsWithTimes(diffTies, diffTimes, progress, teams, scores, times, nets, channels){
    for(let i = 0; i < diffTies.length; i++){
        var sortedTimes = timeSort(league, diffTimes[i]);
        for(let j = 0; j < diffTies[i].length; j++){    //if multiple games with same diff, add json by time
            /*team at position derived from current diff amount,
            highest time from timeSort, and the ones are for positions being second for timeSort and diffTies    */
            toJson(teams[2*diffTies[i][sortedTimes[j][1]][1]], teams[2*diffTies[i][sortedTimes[j][1]][1]+1],
                scores[2*diffTies[i][sortedTimes[j][1]][1]], scores[2*diffTies[i][sortedTimes[j][1]][1]+1],
                progress[diffTies[i][sortedTimes[j][1]][1]], times[diffTies[i][sortedTimes[j][1]][1]],
                nets[diffTies[i][sortedTimes[j][1]][1]], channels[diffTies[i][sortedTimes[j][1]][1]]);
            if(nets[diffTies[i][0][1]] != undefined){
                console.log(nets[diffTies[i][0][1]] + ': ' + channels[diffTies[i][0][1]]);
                } 
            console.log(times[diffTies[i][sortedTimes[j][1]][1]] + '\nProgress:  ' +
            progress[diffTies[i][sortedTimes[j][1]][1]] + '\n' + teams[2*diffTies[i][sortedTimes[j][1]][1]]
            + '  ' + scores[2*diffTies[i][sortedTimes[j][1]][1]] + '\n' + teams[2*diffTies[i][sortedTimes[j][1]][1]+1]
            + '  ' + scores[2*diffTies[i][sortedTimes[j][1]][1]+1] +'\n');
        }
    }
}

//when priority order is diffs then times
function endedDiffSort(endedDiffs, progress, endedSort, diffs, teams, scores, times, nets, channels, numGames){
    for(let j = 0; j < endedDiffs.length; j++){
        for(let i = 0; i < numGames; i++){
            if(progress[i] == 'ended'){
                if(endedSort.indexOf(diffs[i]) == j){
                    toJson(teams[2*i], teams[2*i+1], scores[2*i], scores[2*i+1], progress[i], times[i], nets[i], channels[i]);
                    if(nets[i] != undefined){
                        console.log(nets[i] + ': ' + channels[i]);
                     } 
                     console.log(times[i] + '\n' + 'Progress ' + progress[i] + '\n' + 
                     teams[i*2] + '  ' + scores[i*2] + '\n' + teams[i*2+1] + '  ' + scores[i*2+1] +'\n');
                }
            }
        }
    }
}

function timesThenDiffs(endedSort, numGames, diffs, teams, scores, progress, times, nets, channels){
    for(let i = 0; i < endedSort.length; i++){
        for(let j = 0; j < numGames; j++){
            if(progress[j] == 'ended'){
                if(endedSort.indexOf(diffs[j]) == i){
                    toJson(teams[2*j], teams[2*j+1], scores[2*j], scores[2*j+1], progress[j], times[j], nets[j], channels[j]);
                    if(nets[j] != undefined){
                        console.log(nets[j] + ': ' + channels[j]);
                     } 
                     console.log(times[j] + '\n' + 'Progress ' + progress[j] + '\n' + 
                     teams[2*j] + '  ' + scores[2*j] + '\n' + teams[2*j+1] + '  ' + scores[2*j+1] +'\n');
                }
            }
        }
    }
}

//TO DO: USE FOR PRIORITY TOGGLE
function diffSort(ongoingDiffs, times, diffs, progress){
    var ongoingSort;
    var ongoingSort = mergeSort(ongoingDiffs);

    var diffTies = [];  //array of diffs that are present in more than one game
    var diffTimes = []; //corresponding time left for those
    for(let i = 0; i < ongoingDiffs.length; i++){
        diffTies[i] = [];
        diffTimes[i] = [];
        for(let j = 0; j < times.length; j++){
            if(ongoingSort.indexOf(diffs[j]) == i && progress[j] == 'ongoing'){
                diffTies[i].push([diffs[j], j]);   //diff amount, diff position
                diffTimes[i].push(times[j]);
            }
        }
    }

    return [diffTies, diffTimes];
}

//push values onto data table to be written to json
function toJson(t1, t2, s1, s2, prog, time, net, link){
    var obj = {};
    obj = {
      team1: t1,
      score1: s1,
      team2: t2,
      score2: s2,
      progress: prog,  //unstarted, ended, ongoing
      time: time,   //time left or start time
      network: net,
      link: link
    }
    data.table.push(obj);
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
    let convertedTime = 0;
    let units = null;
    let unitLen = 0;    //in seconds if applicable
    let unitMax;
    if(league == 'NHL'){
        units = 'periods';
        unitLen = 1200;
        unitMax = 3;
        if(time.includes('SO')) return 5 * unitLen;
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

function timeSort(league, times){
    //times = list of times from games with same diffs
    let convertedTimes = [];
    let sortedTimes = [];
    for(let i = 0; i < times.length; i++){
        convertedTimes[i] = timeConversion(league, times[i]);
    }
    
    let orderedTimes = mergeSort(convertedTimes);
    orderedTimes = orderedTimes.reverse();
    for(let j = 0; j < times.length; j++){
        sortedTimes.push([orderedTimes[j], convertedTimes.indexOf(orderedTimes[j])]);
    }
    return sortedTimes;
}

scrape(league, priority);

export function callScrape(league, priority){
    scrape(league, priority);
}

export default scrape;