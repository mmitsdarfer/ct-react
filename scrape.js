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

function timeToObj(data, league){   //rename when merging files
    //data[data.length-2].time = '7:30 - 1st';
    //data[data.length-1].time = '7:00 - 3rd';      //use to compare game starts with game progress during off times of day
    for(let i = 0; i < data.length; i++){
        data[i].time = timeConversion(league, data[i].time).toString();
    }
}

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

function newTimeSort(data){ //RENAME
    let sorted = [];
    let times = [];
    
    for(let i = 0; i < data.length; i++){
        if(data[i].time.includes('PM') || data[i].time.includes('AM')){
            times[i] = militaryTime(data[i].time);
        }
        else if(data[i].time.includes('Final')){
            times[i] = '0';
        }
        else{
            times[i] = data[i].time;
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

function newDiffSort(data){
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

function newStandingsSort(data){
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
            if(data[i].avgStanding == onStandsSort[j]){
                data[i].standRank = j
            }
        }
        for(let j = 0; j < unstartedStands.length; j++){
            if(data[i].avgStanding == unstartStandsSort[j]){
                data[i].standRank = j + ongoingStands.length;
            }
        }
        for(let j = 0; j < endedStands.length; j++){
            if(data[i].avgStanding == endStandsSort[j]){
                data[i].standRank = j + ongoingStands.length + unstartedStands.length;
            }
        }
    }

    return data;
}

function finalSort(data, priority){
    data = newTimeSort(data);  //RENAME
    data = newDiffSort(data);  //RENAME
    data = newStandingsSort(data); //RENAME

    let sorted = [];
    let midSorted = [];
    let lastSorted = [];
    let allSorted = [];

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
            for(let i = 0; i < data.length+1; i++){
               // if(sorted[i] !== undefined && sorted[i].length > 1)
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
        }

        //move here to end of if diff block after if/elses
        for(let i = 0; i < allSorted.length; i++){
            if(allSorted[i] !== undefined){
                if(allSorted[i].length == 0){
                    allSorted.splice(i, 1);
                    i = 0; //reset since changing length skips numbers
                }
            }
        }
        console.log('__allSorted below__');
        console.log(allSorted);  
    }
        

            /*
            if(sorted[i] !== undefined && sorted[i].length > 1){
                for(let j = 0; j < data.length+1; j++){
                    midSorted[j] = [];
                    if(priority[1] == 'times'){
                        for(let k = 0; k < sorted[i].length; k++){
                            if(sorted[i][k].timeRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        }
                        if(midSorted[j] !== undefined && midSorted[j].length > 1){
                            for(let m = 0; m < data.length; m++){
                                lastSorted[m] = [];
                                for(let n = 0; n < midSorted[j].length; n++){
                                    if(midSorted[j][n].standRank == m){
                                     lastSorted[m].push(midSorted[j][n]);
                                    }
                                }
                                //midSorted[m] = lastSorted[m];
                                //CAN'T DO THIS: TOO BIG ERROR
                            }
                        }
                    }
                    else if(priority[1] == 'standings'){
                        for(let k = 0; k < sorted[i].length; k++){
                            console.log(sorted[i][k]);
                            console.log(j);
                            if(sorted[i][k].standRank == j){
                                midSorted[j].push(sorted[i][k]);
                            }
                        }
                    }     
                    //sorted[j] = midSorted[j];
                    //console.log(midSorted[j]);            
                }

            
        }
        if(sorted[i].length == 0){
           // sorted.shift();
            //if no entry, remove from array
                //but there are nests so have to go 2 levels
        }
     //   console.log(sorted[sorted.length-1]);
    }
    */
    else if(priority[0] == 'times'){
        for(let i = 0; i < data.length+1; i++){    
            sorted[i] = [];
            midSorted[i] = [];   
            for(let j = 0; j < data.length; j++){
                if(data[j].timeRank == i){
                    sorted[i].push(data[j]);
                }
            }
            if(sorted[i] !== undefined && sorted[i].length > 1){
                console.log(sorted[i][0].diffRank);
                for(let j = 0; j < data.length+1; j++){
                    for(let k = 0; k < sorted[i].length; k++){
                        if(sorted[i][k].diffRank == j){
                            midSorted[i].push(sorted[i][k]);
                        }
                    }
                    for(let k = 0; k < sorted[i].length; k++){
                        if(sorted[i][k].standRank == j){
                        //    midSorted[i].push(sorted[i][k]);
                        }
                    }
                }     
                sorted[i] = midSorted[i];
            }
        }
        console.log(sorted);
    }
    else if(priority[0] == 'standings'){
        for(let i = 0; i < data.length; i++){       
            for(let j = 0; j < data.length; j++){
                if(data[j].standRank == i){
                    sorted.push(data[j]);
                }
            }
        }
    }
   // console.log('SORTED');
   
    for(let i = 0; i < sorted.length; i++){
      //  console.log(sorted[i].length);
       // console.log(sorted[i]);
    }
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
    //!!!get standings first to add to obj -> need new standings function
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


    }
    
    //write to json file 
    fs.writeFile('json/' + league.toLowerCase()+'.json', JSON.stringify(data), function(err){
        if(err) throw err;
    }); 

    const callStandings = async () => {
        await standingsScrape(gameData.table, league);
        //gameData.table.push({date: date});
        //console.log(gameData);

        timeToObj(gameData.table, league);
        //console.log(gameData.table);
        finalSort(gameData.table, priority);

        // do something else here after standingsScrape completes
        //put everything else in here to ensure standings are collected
      }
      
    callStandings();

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