import puppeteer from 'puppeteer';

var league = 'NHL';

var obj = {};
    obj = {
      team1: 'phi',
      score1: 1,
      team2: 'nyr',
      score2: 0,
      progress: 'ended',  //unstarted, ended, ongoing
      time: '7:00 PM',   //time left or start time
      network: 'ESPN'
    }
obj.test = 'testing';

async function standingsScrape(data, league){
  console.log(league + ' standings');
  let url = 'https://www.espn.com/'+league.toLowerCase()+'/standings/_/group/league';
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

  console.log(data);
}





const secondFunction = async () => {
  const result = await standingsScrape(obj, league);
  console.log(2);
  // do something else here after firstFunction completes
}

secondFunction();