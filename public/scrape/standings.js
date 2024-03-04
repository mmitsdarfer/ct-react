import fs from 'fs';
import puppeteer from 'puppeteer';

//compares current timestamp with last standings check
function dateAndTime(last, current){  
    let timeDiff = current - last; // current.getTime() - last.getTime();
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

export async function standingsScrape(league, data){
    console.log(data);
    let standings = {};
    standings.table = [];
    let teamRanks = [];
    let currentDate = new Date().getTime();
    let exists = false;
    let last;
    let leagueIndex;
    let needCheck;
    let dateOut;

    if(fs.existsSync('json/standings.json')){
        const parsedStands = JSON.parse(fs.readFileSync('json/standings.json', 'utf-8'));
        standings = parsedStands;
        for(let i = 0; i < Object.keys(parsedStands.table).length; i++){
            if(parsedStands.table[i].league == league){
                leagueIndex = i;
                exists = true;
                last = parsedStands.table[i].time;
                needCheck = dateAndTime(last, currentDate);
            }
        }
        if(!exists || needCheck){
            console.log(league + ' standings');
            dateOut = currentDate;
            let url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);         
            teamRanks = await page.evaluate(() => {
                let getStands = document.querySelectorAll('span.hide-mobile > a');
                standArr = Array.from(getStands);
                standArr = standArr.map(game => game.textContent);
                return standArr;
            });
            standings.table.splice(leagueIndex, 1);
            await browser.close();
        }
        else if(exists && !needCheck){
            dateOut = parsedStands.table[leagueIndex].time;
            teamRanks = parsedStands.table[leagueIndex].standings;
            standings.table.splice(leagueIndex, 1);
        }
        standings.table.push({
            league: league,
            time: dateOut,
            standings: teamRanks
        });
    }
    else{
        console.log(league + ' standings');
        dateOut = currentDate;
        let url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);              
        teamRanks = await page.evaluate(() => {
            let getStands = document.querySelectorAll('span.hide-mobile > a');
            standArr = Array.from(getStands);
            standArr = standArr.map(game => game.textContent);
            return standArr;
        });
        standings.table.push({
            league: league,
            time: dateOut,
            standings: teamRanks
        });
        await browser.close();
    }

  //  console.log(data.length);
    fs.writeFile('json/standings.json', JSON.stringify(standings), function(err){
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
      //   console.log(data[i].avgStanding);
     }
     return data;
}

export default standingsScrape;