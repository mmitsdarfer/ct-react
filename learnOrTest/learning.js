var priority = 'times';
var league = 'NHL';
import puppeteer from 'puppeteer';
var url = 'https://www.espn.com/'+league.toLowerCase()+'/standings';

standingsScrape(league, url);
async function standingsScrape(league, url){
    console.log('Current ' + league + ' standings');
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var teamRanks = [];
    teamRanks = await page.evaluate(() => {
        //document.querySelector("#fittPageContainer > div:nth-child(3) > div > div > section > div > section > div.tabs__wrapper.mv5 > div > section > div.standings__table.InnerLayout__child--dividers > div > div.flex > table > tbody > tr:nth-child(1) > td > div > span.hide-mobile > a")
        var test;
        //for(let i = 0; i < 32; i++){
            test = document.querySelectorAll('span.hide-mobile > a');
      //  }
       testArr = Array.from(test);
        testArr = testArr.map(game => game.textContent);
    return test;
    });
    console.log(teamRanks);
    console.log(url);
}