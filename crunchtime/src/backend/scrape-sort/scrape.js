import puppeteer from 'puppeteer';
import fs from 'fs';
import { timeConversion, standingsScrape } from './standings-time.js';
import finalSort from './finalSort.js';
import netLinks from './netLinks.js';

var league;
var priority;
var url;
var prefData;
var data = {};  //object json data will be stored in
var gameData = {};

//league and priority come from preferencs.json on original call
if (fs.existsSync('../json/preferences.json')) {
    const parsedPrefs = JSON.parse(fs.readFileSync('../json/preferences.json', 'utf-8'));
    league = parsedPrefs[0];
    priority = parsedPrefs[1];
}
else{   //current, priority, ranked leagues with time visited
    prefData = ['NHL', ['diffs', 'times', 'standings'], ['NHL', 0], ['NFL', 0], ['MLB', 0], ['NBA', 0]]; 
    fs.writeFile('../json/preferences.json', JSON.stringify(prefData), function(err){
        if(err) throw err;
    }); 
    league = prefData[0];
    priority = prefData[1];
}

//converts time and saves it to data obj separately
function timeToObj(data, league){   
    for(let i = 0; i < data.length; i++){
        data[i].convertedTime = timeConversion(league, data[i].time).toString();
    }
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
    var fullDate, teams, times, scores, nets, numGames, links, logos;
    
    [fullDate, teams, times, scores, nets, numGames, links, logos] = await page.evaluate((league) => {
        fullDate = document.querySelector('.Card__Header__Title__Wrapper .Card__Header__Title').textContent;
        teams = [];
        scores = [];
        times = [];
        nets = [];
        links = [];
        logos = [];
        let teamLen = document.querySelectorAll('.AnchorLink .ScoreCell__TeamName').length;
        numGames = teamLen/2;
        
        times = document.querySelectorAll('.ScoreboardScoreCell__Overview .ScoreCell__Time');
        let timeArr = Array.from(times);
        timeArr = timeArr.map(game => game.textContent);

        let endedLen = 0;
        let scoreLen = 0;
        let notEnded = 0;

        for(let i = 0; i < teamLen; i++){
            teams[i] = document.querySelectorAll('.AnchorLink .ScoreCell__TeamName')[i];
            logos[i] = document.querySelectorAll('.AnchorLink .ScoreboardScoreCell__Logo')[i].src;
            if(!(i%2) && timeArr[i/2].includes('Final')){
                endedLen++;
            }
        }
        endedLen *= 2;  //each 1 game ended has 2 teams and scores
        scoreLen = document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score').length;
        notEnded = teamLen - endedLen;

        //put scores in array
        for(let i = 0; i < scoreLen; i++){
            scores[i] = document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score')[i];
            if(scores[i] == null){
                scores[i] = '-';
            } 
        }
        scoreArr = Array.from(scores);
        scoreArr = scoreArr.map(game => game.textContent);  
        for(let i = scoreLen - endedLen; i < teamLen - endedLen; i++){
            scoreArr[i] = '-';  //placeholder before score exists
        }

        //scores only exist for ongoing and ended, so scores have to split around unstarted games
        //because ongoing games are always first and ended are always last on espn
        for(let i = teamLen - endedLen; i < teamLen; i++){
            scoreArr[i] =  document.querySelectorAll('.ScoreboardScoreCell__Item .ScoreCell__Score')[scoreLen - endedLen + i - notEnded].textContent;
        }
        
        //put networks in nodelist
        let netLen = document.querySelectorAll('.ScoreboardScoreCell .ScoreCell__NetworkItem').length;
        for(let i = 0; i < netLen; i++){
            nets[i] = document.querySelectorAll('.ScoreboardScoreCell .ScoreCell__NetworkItem')[i];
        }
        for(let i = 0; i < numGames; i++){
            if(document.querySelectorAll('.Scoreboard .Scoreboard__Callouts .WatchListenButtons .AnchorLink')[i] !== undefined){
                links[i] = document.querySelectorAll('.Scoreboard .Scoreboard__Callouts .WatchListenButtons .AnchorLink')[i];
            }
        }
        
        //convert nodelists into arrays
        teamArr = Array.from(teams);
        teamArr = teamArr.map(team => team.textContent);  
        
        netArr = Array.from(nets);
        netArr = netArr.map(net => net.textContent);
        linkArr = Array.from(links);
        linkArr = linkArr.map(link => link.href);

        return [fullDate, teamArr, timeArr, scoreArr, netArr, numGames, linkArr, logos];
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

    var channels = [];
    if(nets.length > 0) channels = netLinks(nets, teams, progress, numGames, links);
    else{
        for(let i = 0; i < numGames; i++){
            channels[i] = '';
        }
    }

    gameData.table = [];
    var gameObj = {};
    for(let i = 0; i < numGames; i++){

        //if nets[i] defined call netLinks.js to set links

        gameObj = {
            team1: teams[2*i],
            score1: scores[2*i],
            logo1: logos[2*i],
            team2: teams[2*i+1],
            score2: scores[2*i+1],
            logo2: logos[2*i+1],
            progress: progress[i],  //unstarted, ended, ongoing
            time: times[i],   //time left or start time
            network: nets[i],
            link: channels[i],
            diff: diffs[i]
        }
        gameData.table.push(gameObj);
    } 

    const callStandings = async () => {
        data = await standingsScrape(league, gameData.table);
        timeToObj(gameData.table, league);
        finalSort(gameData.table, priority, league, date);
      }
      
    callStandings();

    //close puppeteer browser
    await browser.close();
}

export function callScrape(league, priority){
    scrape(league, priority);
}

export default scrape;