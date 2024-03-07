//MLB has many edge cases, so it has its own scrape file

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
    console.log('Current league: MLB');
    console.log('Priority: ' + priority);
    url = 'https://www.espn.com/mlb/scoreboard';
    data.table = []; 

    //use puppeteer to open link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var fullDate, teams, times, scores, nets, numGames, unstarted, endedLen, scoreLen, teamLen, ongoing, postponed;

    await page.waitForSelector('div.ScoreCell__Score'); //scores are loaded a bit later, so need to wait for them (I think...)
    
    [fullDate, teams, times, scores, numGames, endedLen, scoreLen, teamLen, unstarted, ongoing, postponed] = await page.evaluate(() => {
        fullDate = document.querySelector('.Card__Header__Title__Wrapper .Card__Header__Title').textContent;
        teams = [];
        scores = [];
        times = [];
        nets = [];
        endedLen = 0;
        unstarted = 0;
        ongoing = 0;
        let postponed = 0;

        teamLen = document.querySelectorAll('.Scoreboard__Row .ScoreCell__TeamName').length;

        numGames = teamLen/2;
        for(let i = 0; i < numGames; i++){
            times[i] = document.querySelectorAll('.Scoreboard .ScoreCell__Time')[i].textContent;
        }
        
        for(let i = 0; i < teamLen; i++){
            teams[i] = document.querySelectorAll('.Scoreboard__Row .ScoreCell__TeamName')[i].textContent;
            if(!(i%2)){
                if(times[i/2].includes('Final')){
                    endedLen++;
                }
                else if(times[i/2] == 'Postponed'){
                    postponed = i
                }
            }
        }
        endedLen *= 2;
        scoreLen = document.querySelectorAll('.ScoreCell__Score').length;
        notEnded = teamLen - endedLen;

        for(let i = 0; i < scoreLen; i++){
            scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
            if(scores[i] == '-'){
                scores[i] = '---';
            }
            if(scores[i] == null){
                scores[i] = '-';
            } 
        }

        for(let i = scoreLen - endedLen; i < teamLen - endedLen; i++){
            //scores[i] = '-';
        }
        for(let i = postponed; i < teamLen; i++){
            scores[i] = '-';
        }

        for(let i = teamLen - endedLen; i < teamLen; i++){
               // scores[i] = document.querySelectorAll('.ScoreCell__Score')[scoreLen - endedLen + i - notEnded].textContent;
                if (scores[i] === null){
                    scores[i] = '---';
                } 
        }
        //scores.splice(postponed, 10);
//        scores.push(...scores.splice(postponed, 2));

        //TODO: add networks

        return [fullDate, teams, times, scores, numGames, endedLen, scoreLen, teamLen, unstarted, ongoing, postponed];
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
        if(times[i].endsWith('PM') || times[i].endsWith('AM') || times[i] == 'Postponed'){
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
            network: '',
            link: '',
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