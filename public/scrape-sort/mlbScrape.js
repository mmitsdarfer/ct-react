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
    var league = 'MLB'; 
    console.log('Current league: ' + league);
    console.log('Priority: ' + priority);
    url = 'https://www.espn.com/'+league.toLowerCase()+'/scoreboard';
    data.table = []; 

    //use puppeteer to open link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var fullDate, teams, times, scores, nets, numGames, postponed;

    await page.waitForSelector('div.ScoreCell__Score'); //scores are loaded a bit later, so need to wait for them (I think...)
    
    [fullDate, teams, times, scores, numGames, postponed] = await page.evaluate(() => {
        fullDate = document.querySelector('.Card__Header__Title__Wrapper .Card__Header__Title').textContent;
        teams = [];
        scores = [];
        times = [];
        nets = [];
        let endedLen = 0;
        let postponed = 0;
        let postCan = 0;
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
                if(times[i/2].includes('Final')){
                    if(firstFin == 0) firstFin = i;
                    //if(i < scoreLen){
                        scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
                        scores[i+1] = document.querySelectorAll('.ScoreCell__Score')[i+1].textContent;
                    //}
                    endedLen++;
                }
                else if(times[i/2] == 'Postponed' || times[i/2] == 'Canceled'){
                    scores[i] = '-';
                    scores[i+1] = '-';
                    //postponed.push(i, i+1);
                    postponed += 2;
              //  }
                
                }
                else if(times[i/2].includes('AM') || times[i/2].includes('PM')){
                    if(firstUnstart == 0) firstUnstart = i;
                    //scores[i] = '-';
                    //scores[i+1] = '-';
                    scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
                        scores[i+1] = document.querySelectorAll('.ScoreCell__Score')[i+1].textContent;
                }
                else{
                    //if(i < scoreLen){
                        scores[i] = document.querySelectorAll('.ScoreCell__Score')[i-postponed].textContent;
                        scores[i+1] = document.querySelectorAll('.ScoreCell__Score')[i+1-postponed].textContent;
                  //  }
                }
               // else if(times[i/2] == 'Canceled'){
                    //postCan++;
               // }
            }
        }

        for(let i = firstUnstart; i < firstFin; i++){
            scores.splice(firstUnstart, 0, '-');
        }
        for(let i = 0; i < teamLen; i++){
            if(scores[i].includes('-') && /^\d/.test(scores[i])){
                scores.splice(i, 1);
                i--;
            }
        }
        

        
        endedLen *= 2;
        
        notEnded = teamLen - endedLen;

        let len = scores.length;
        for(let i = 0; i < scores.length; i++){
            if(scores[i].includes('-') && !isNaN(parseInt(scores[i]))){
             //   scores.splice(i, 2);
            //    i--;
               // len -= 1;
            }
            if(times[i/2] == 'Final' || (times[i/2] != 'Postponed' && times[i/2] != 'Canceled')){
                //scores[i] = document.querySelectorAll('.ScoreCell__Score')[i].textContent;
            }
            else{
              //  scores[i] = '-';
                postCan++;
            }
        }
      //  let scoreArr = Array.from(scores);
     //   scoreArr = scoreArr.map(game => game.textContent);  

        for(let i = scoreLen - endedLen; i < teamLen - endedLen; i++){
         //   scoreArr[i] = '-';
        }
        for(let i = postponed; i < teamLen; i++){
       //     scores[i] = '-';
        }

        for(let i = teamLen - endedLen; i < teamLen; i++){
                //scoreArr[i] = document.querySelectorAll('.ScoreCell__Score')[scoreLen - endedLen + i - notEnded].textContent;
                if (scores[i] === null){
          //          scores[i] = '---';
                } 
        }
        //scores.splice(postponed, 10);
//        scores.push(...scores.splice(postponed, 2));

        //TODO: add networks

        return [fullDate, teams, times, scores, numGames, firstFin];
    })
    console.log(postponed);
    console.log(teams);
    console.log(times);
    console.log(scores);

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