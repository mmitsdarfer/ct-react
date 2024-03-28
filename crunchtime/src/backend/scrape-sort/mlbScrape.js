//MLB has many edge cases (e.g. innings, bottom/top), so it has its own scrape file

import puppeteer from 'puppeteer';
import { timeConversion, standingsScrape } from './standings-time.js';
import finalSort from './finalSort.js';
var url;
var data = {};

//converts time and saves it to data obj separately
function timeToObj(data, league){   
    for(let i = 0; i < data.length; i++){
        data[i].convertedTime = timeConversion(league, data[i].time).toString();
    }
}

export async function mlbScrape(priority){
    var league = 'MLB'; 
    console.log('Current league: ' + league);
    console.log('Priority: ' + priority);
    url = 'https://www.espn.com/'+league.toLowerCase()+'/scoreboard';
    data.table = []; 

    //use puppeteer to open link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var fullDate, teams, times, scores, nets, numGames;

    await page.waitForSelector('div.ScoreCell__Score'); //scores are loaded a bit later, so need to wait for them (I think...)
    
    [fullDate, teams, times, scores, numGames] = await page.evaluate(() => {
        fullDate = document.querySelector('.Card__Header__Title__Wrapper .Card__Header__Title').textContent;
        teams = [];
        scores = [];
        times = [];
        nets = [];
        let firstFin = 0;
        let firstUnstart = 0;

        teamLen = document.querySelectorAll('.Scoreboard__Row .ScoreCell__TeamName').length;
        numGames = teamLen/2;

        for(let i = 0; i < numGames; i++){
            times[i] = document.querySelectorAll('.Scoreboard .ScoreCell__Time')[i].textContent;
        }
        
        scoreLen = document.querySelectorAll('.ScoreCell__Score').length;

        for(let i = 0; i < teamLen; i++){
            teams[i] = document.querySelectorAll('.Scoreboard__Row .ScoreCell__TeamName')[i].textContent;
            if(!(i%2)){
                if(times[i/2] == ('Final')){
                    if(firstFin == 0) firstFin = i;
                    scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
                    scores[i+1] = document.querySelectorAll('.ScoreCell__Score')[i+1].textContent;
                }
                else if(times[i/2] == 'Postponed' || times[i/2] == 'Canceled'){
                    scores[i] = '-';
                    scores[i+1] = '-';                
                }
                else if(times[i/2].includes('AM') || times[i/2].includes('PM')){
                    if(firstUnstart == 0) firstUnstart = i;
                    scores[i] = '-';
                    scores[i+1] = '-';
                }
                else{
                    scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
                    scores[i+1] = document.querySelectorAll('.ScoreCell__Score')[i+1].textContent;
                }
            }
        }

        if(firstUnstart != 0){
            for(let i = firstUnstart; i < firstFin; i++){
                scores.splice(firstUnstart, 0, '-');
            }
        }
        for(let i = 0; i < teamLen; i++){
            if(scores[i].includes('-') && /^\d/.test(scores[i])){   //if has dash and starts with a number for when espn puts records in place of scores for unstarted games 
                scores.splice(i, 1);
                i--;
            }
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
            else links[i] = "teststs";
        }

        return [fullDate, teams, times, scores, numGames];
    })

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
        if(times[i].endsWith('PM') || times[i].endsWith('AM') || times[i] == 'Postponed' || times[i] == 'Canceled'){
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

    var obj = {};
    for(let i = 0; i < numGames; i++){
        obj = {
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
        data.table.push(obj);
    }


    const callStandings = async () => {
        data = await standingsScrape('MLB', data.table); 
        timeToObj(data, 'MLB');
        finalSort(data, priority, 'MLB', date);
    }
    callStandings();
      
    await browser.close();
}

export default mlbScrape;