import express from 'express';
const app = express();
const router = express.Router();
const port = 8000;
import fs from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { parse } from 'url';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { existsSync, readFileSync, writeFile } from "fs";
import cookieParser from 'cookie-parser';
import callScrape from './scrape.js';


var current;
 
//logo format = league, width, height, link
const logos = [['NHL', 120, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/1200px-05_NHL_Shield.svg.png'],
['NFL', 100, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png'],
['MLB', 160, 86, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/1200px-Major_League_Baseball_logo.svg.png'],
['NBA', 73, 120, 'https://brandlogos.net/wp-content/uploads/2014/09/NBA-logo-big.png']];

//merge and mergesort used to rank leagues by most views
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

//use data from league jsons to transform league.html & leagueIndex.html
function jsonHtml(league, priority){
    var jsonParsed;
    async function writeJson(){
        setTimeout(() => {   
            callScrape(league, priority);
            jsonParsed = JSON.parse(readFileSync('json/' + league.toLowerCase() + '.json', 'utf-8'));
            return jsonParsed;
        }, );     
    }
    if(existsSync('json/' + league.toLowerCase() + '.json', 'utf-8')) {
        jsonParsed = JSON.parse(readFileSync('json/' + league.toLowerCase() + '.json', 'utf-8'));
    }
    else{
        jsonParsed = writeJson();    
    }
    
    var leagueHtml = readFileSync('public/league.html', 'utf-8');
    var leagueIndex = readFileSync('public/leagueIndex.html', 'utf-8');
    var leagueOut0 = [];
    var leagueOut1 = [];
    var leagueOut2 = [];
    var leagueOut3 = [];
    var len = Math.ceil(jsonParsed.table.length);
    var j = 0;
    for(let i = 0; i < len-1; i++){
        if(typeof jsonParsed.table[i] === 'undefined'){         
          break;
        }
        if(i % 4 == 0){
            leagueOut0[i] = leagueHtml.replace('{{%TEAM1%}}', jsonParsed.table[i].team1).replace('{{%SCORE1%}}', jsonParsed.table[i].score1);
            leagueOut0[i] = leagueOut0[i].replace('{{%TEAM2%}}', jsonParsed.table[i].team2).replace('{{%SCORE2%}}', jsonParsed.table[i].score2);
            leagueOut0[i] = leagueOut0[i].replace('{{%TIME%}}', jsonParsed.table[i].time)
            if(jsonParsed.table[i].progress != 'ended'){
                if(jsonParsed.table[i].network == 'NHL NET') {
                    leagueOut0[i] = leagueOut0[i].replace('{{%NETLINK%}}', '<a class="net">{{%NETWORK%}} has no available links</a>');
                }
                else if(jsonParsed.table[i].network == undefined){
                    leagueOut0[i] = leagueOut0[i].replace('{{%NETLINK%}}','');
                }
                else leagueOut0[i] = leagueOut0[i].replace('{{%NETLINK%}}', '<a class="btn" href="{{%LINK%}}" target="_blank" style="padding: 0.35em;">Watch on {{%NETWORK%}}</a>');
                leagueOut0[i] = leagueOut0[i].replace('{{%LINK%}}', jsonParsed.table[i].link).replace('{{%NETWORK%}}', jsonParsed.table[i].network);
            }
            else{
                leagueOut0[i] = leagueOut0[i].replace('{{%NETLINK%}}','');
            }
        }
        if(i % 4 == 1){
            leagueOut1[i] = leagueHtml.replace('{{%TEAM1%}}', jsonParsed.table[i].team1).replace('{{%SCORE1%}}', jsonParsed.table[i].score1);
            leagueOut1[i] = leagueOut1[i].replace('{{%TEAM2%}}', jsonParsed.table[i].team2).replace('{{%SCORE2%}}', jsonParsed.table[i].score2);
            leagueOut1[i] = leagueOut1[i].replace('{{%TIME%}}', jsonParsed.table[i].time)
            if(jsonParsed.table[i].progress != 'ended'){
                if(jsonParsed.table[i].network == 'NHL NET') {
                    leagueOut1[i] = leagueOut1[i].replace('{{%NETLINK%}}', '<a class="net">{{%NETWORK%}} has no available links</a>');
                }
                else if(jsonParsed.table[i].network == undefined){
                    leagueOut1[i] = leagueOut1[i].replace('{{%NETLINK%}}','');
                }
                else leagueOut1[i] = leagueOut1[i].replace('{{%NETLINK%}}', '<a class="btn" href="{{%LINK%}}" target="_blank" style="padding: 0.35em;">Watch on {{%NETWORK%}}</a>');
                leagueOut1[i] = leagueOut1[i].replace('{{%LINK%}}', jsonParsed.table[i].link).replace('{{%NETWORK%}}', jsonParsed.table[i].network);
            }
            else{
                leagueOut1[i] = leagueOut1[i].replace('{{%NETLINK%}}','');
            }
        }
        if(i % 4 == 2){
            leagueOut2[i] = leagueHtml.replace('{{%TEAM1%}}', jsonParsed.table[i].team1).replace('{{%SCORE1%}}', jsonParsed.table[i].score1);
            leagueOut2[i] = leagueOut2[i].replace('{{%TEAM2%}}', jsonParsed.table[i].team2).replace('{{%SCORE2%}}', jsonParsed.table[i].score2);
            leagueOut2[i] = leagueOut2[i].replace('{{%TIME%}}', jsonParsed.table[i].time)
            if(jsonParsed.table[i].progress != 'ended'){
                if(jsonParsed.table[i].network == 'NHL NET') {
                    leagueOut2[i] = leagueOut2[i].replace('{{%NETLINK%}}', '<a class="net">{{%NETWORK%}} has no available links</a>');
                }
                else if(jsonParsed.table[i].network == undefined){
                    leagueOut2[i] = leagueOut2[i].replace('{{%NETLINK%}}','');
                }
                else leagueOut2[i] = leagueOut2[i].replace('{{%NETLINK%}}', '<a class="btn" href="{{%LINK%}}" target="_blank" style="padding: 0.35em;">Watch on {{%NETWORK%}}</a>');
                leagueOut2[i] = leagueOut2[i].replace('{{%LINK%}}', jsonParsed.table[i].link).replace('{{%NETWORK%}}', jsonParsed.table[i].network);
            }
            else{
                leagueOut2[i] = leagueOut2[i].replace('{{%NETLINK%}}','');
            }
        }
        if(i % 4 == 3){
            leagueOut3[i] = leagueHtml.replace('{{%TEAM1%}}', jsonParsed.table[i].team1).replace('{{%SCORE1%}}', jsonParsed.table[i].score1);
            leagueOut3[i] = leagueOut3[i].replace('{{%TEAM2%}}', jsonParsed.table[i].team2).replace('{{%SCORE2%}}', jsonParsed.table[i].score2);
            leagueOut3[i] = leagueOut3[i].replace('{{%TIME%}}', jsonParsed.table[i].time)
            if(jsonParsed.table[i].progress != 'ended'){
                if(jsonParsed.table[i].network == 'NHL NET') {
                    leagueOut3[i] = leagueOut3[i].replace('{{%NETLINK%}}', '<a class="net">{{%NETWORK%}} has no available links</a>');
                }
                else if(jsonParsed.table[i].network == undefined){
                    leagueOut3[i] = leagueOut3[i].replace('{{%NETLINK%}}','');
                }
                else leagueOut3[i] = leagueOut3[i].replace('{{%NETLINK%}}', '<a class="btn" href="{{%LINK%}}" target="_blank" style="padding: 0.35em;">Watch on {{%NETWORK%}}</a>');
                leagueOut3[i] = leagueOut3[i].replace('{{%LINK%}}', jsonParsed.table[i].link).replace('{{%NETWORK%}}', jsonParsed.table[i].network);
            }
            else{
                leagueOut3[i] = leagueOut3[i].replace('{{%NETLINK%}}','');
            }
        }
    }

    var currentLogo = [];
    for(let i = 0; i < logos.length; i++){
        if(league == logos[i][0]){
            currentLogo = logos[i].slice(1);
        }
    }

    leagueOut0 = leagueOut0.join(' \n');
    leagueOut1 = leagueOut1.join(' \n');
    leagueOut2 = leagueOut2.join(' \n');
    leagueOut3 = leagueOut3.join(' \n');

    var leagueRes = leagueIndex.replace('{{%CONTENT0%}}', leagueOut0).replace('{{%CONTENT1%}}', leagueOut1).replace('{{%CONTENT2%}}', leagueOut2).replace('{{%CONTENT3%}}', leagueOut3);
    leagueRes = leagueRes.replace('{{%LEAGUE%}}', league).replace('{{%LEAGUE%}}', league.toLowerCase()).replace('{{%WIDTH%}}', currentLogo[0])
    .replace('{{%HEIGHT%}}', currentLogo[1]).replace('{{%LOGO%}}', currentLogo[2]).replace('{{%DATE%}}', jsonParsed.table[len-1].date)
    .replace('{{%PRIORITY0%}}', priority[0].charAt(0).toUpperCase() + priority[0].slice(1)).replace('{{%PRIORITY1%}}', priority[1].charAt(0).toUpperCase() + priority[1].slice(1))
    .replace('{{%PRIORITY2%}}', priority[2].charAt(0).toUpperCase() + priority[2].slice(1));

    return leagueRes;
}

app.use(cookieParser());

//convert cookies to be written into preferences.json and reset if asked to
function getCookies(req, res){
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2); 
    if(priority[0] === undefined){
        priority[0] = 'diffs';
        res.cookie('Priority0', 'diffs');
    }
    if(priority[1] === undefined){
        priority[1] = 'times';
        res.cookie('Priority1', 'times');
    }
    if(priority[2] === undefined){
        priority[2] = 'standings';
        res.cookie('Priority2', 'standings');
    }

    let reset = (req.cookies.Reset);
    if(reset === undefined){
        reset = 'false';
        res.cookie('Reset', 'false');
    }

    if (!existsSync('json/preferences.json')) {
        prefReset(priority);
    }
    
    let parsedPrefs;
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
        parsedPrefs = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
        return parsedPrefs;
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        parsedPrefs = callReset();
    }
    else{
        parsedPrefs = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
    }
    
    let prefsOut = parsedPrefs;
    prefsOut[1] = priority;
    writeFile('json/preferences.json', (JSON.stringify(prefsOut)), function(err){
        if(err) throw err;
    });
}

//home page
app.get('/', (req, res) => { 
    /*TODO: I want to call for each league in order based on preferences.json ranking
    which might require using promises? I considered timers too
    */
    getCookies(req, res);
    res.sendFile(__dirname + '\\index.html');
});

app.use(express.static(__dirname + '/')); 
app.use(express.static(join(__dirname, 'public')));

//resets values of preferences.json or creates it with reset values
async function prefReset(priority = ['diffs', 'times', 'standings']){
    let prefData = JSON.stringify(['NHL', priority, ['NBA', 0], ['MLB', 0], ['NFL', 0], ['NHL', 0]]);
    writeFile('json/preferences.json', prefData, function(err){
        if(err) throw err;
    });  
    return true;    
}

//increases preference value when league selected and updates preferences.json
function preferences(league){
    var prefData;
    if (existsSync('json/preferences.json')) {
        prefData = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
    }
    else{
        prefReset();    //need preferences.json to exist
        prefData = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
    }
    let prefsList = (Object.values(prefData));
    let prefHits = [];

    //increase hit number
    for(let i = 2; i < prefsList.length; i++){
        if(prefsList[i][0] == league){
            prefsList[i][1]++;
            prefsList[i] = [prefsList[i][0], prefsList[i][1]];
        }
        prefHits[i-2] = prefsList[i][1];
    }
    let sorted = mergeSort(prefHits);
    let outList = [league, prefsList[1]];

    let outCount = 2; //start at lowest league position in preferences.json
    for(let i = 0; i < sorted.length; i++){
        for(let j = 2; j < prefsList.length; j++){
            if(sorted.indexOf(prefsList[j][1]) == i){
                outList[outCount] = (prefsList[j]);
                outCount++;
            }
        }
    }
    //preferences.json format: [current league selected, priority, [least visited team, team visits], [2nd least visit team, team visits], ... [most visited team, team visits]]
    writeFile('json/preferences.json', JSON.stringify(outList), function(err){
        if(err) throw err;
    }); 
}

app.get('/nhl', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
            if(err) throw err;
        }); 
    }
    getCookies(req, res);
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2);   
    let reset = (req.cookies.Reset);
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        callReset();
    }
    async function writeNhl(){
        setTimeout(function () {
            preferences(current);   
            callScrape(current, priority);
            var nhlRes = jsonHtml(current, priority);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(nhlRes);          
        }, 100);       
    }
    writeNhl();
});

app.get('/nfl', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
            if(err) throw err;
        }); 
    }
    getCookies(req, res);
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2); 
    let reset = (req.cookies.Reset);
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        callReset();
    }
    async function writeNfl(){
        setTimeout(function () {
            preferences(current);
            callScrape(current, priority);
            var nflRes = jsonHtml(current, priority);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(nflRes);    
        }, 100);
    }
    writeNfl();
});

app.get('/nba', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
            if(err) throw err;
        }); 
    }
    getCookies(req, res);
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2);  
    let reset = (req.cookies.Reset);
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        callReset();
    }
    async function writeNba(){
        setTimeout(function () {     
            preferences(current);
            callScrape(current, priority);
            var nbaRes = jsonHtml(current, priority);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(nbaRes);         
        }, 100);     
    }
    writeNba();
});

app.get('/mlb', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
            if(err) throw err;
        }); 
    }
    getCookies(req, res);
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2); 
    let reset = (req.cookies.Reset);
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        callReset();
    }
    async function writeMlb(){
        setTimeout(function () {
            preferences(current);
            callScrape(current, priority);
            var mlbRes = jsonHtml(current, priority);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(mlbRes);          
        }, 100);     
    }
    writeMlb();
});

//fills in preferences.html with preferences.json data
function prefsJsonHtml(priority){
    var leagueHtml = readFileSync('public/preferences.html', 'utf-8');
    var prefsOut; 
    var prefsParsed;
    if(priority[0] == undefined){
        if (existsSync('json/preferences.json', 'utf-8')) {
            prefsParsed = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
        }
    }
   
    var prefLogos = [];
    prefsParsed = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
    for(let i = prefsParsed.length - 1; i > 1; i--){  
        for(let j = 0; j < logos.length; j++){
            if(prefsParsed[i][0] == logos[j][0]){
                prefLogos[prefsParsed.length - 1 - i] = logos[j];
                if(prefLogos[prefsParsed.length - 1 - i].length == logos.length){
                    prefLogos[prefsParsed.length - 1 - i].push(prefsParsed[i][1]);
                }
                else{
                    prefLogos[prefsParsed.length - 1 - i][logos.length] = prefsParsed[i][1];
                }
            }
        }
    }
    prefsOut = leagueHtml;
    for(let i = 0; i < prefLogos.length; i++){
        prefsOut = prefsOut.replace('{{%LEAGUE%}}', prefLogos[i][0]).replace('{{%WIDTH%}}', 0.9 * prefLogos[i][1])
        .replace('{{%HEIGHT%}}', 0.9 * prefLogos[i][2]).replace('{{%LOGO%}}', prefLogos[i][3]); 
        prefsOut = prefsOut.replace('{{%HITS%}}', prefLogos[i][4]);  
    }
    prefLogos.length = 0;
    
    var dropdownHtml = [];
    for(let i = 0; i < priority.length; i++){
        if(priority[i] == 'diffs'){
            dropdownHtml[i] = '<option value="diffs">Diffs</option> <option value="times">Times</option>' + 
            '<option value="standings">Standings</option>';
        }
        else if(priority[i] == 'times'){
            dropdownHtml[i] = '<option value="times">Times</option> <option value="diffs">Diffs</option>' + 
            '<option value="standings">Standings</option>'
        }
        else if(priority[i] == 'standings'){
            dropdownHtml[i] = '<option value="standings">Standings</option> <option value="diffs">Diffs</option>' + 
            '<option value="times">Times</option>';
        }
    }
    prefsOut = prefsOut.replace('{{%DROP0%}}', dropdownHtml[0]).replace('{{%DROP1%}}', dropdownHtml[1])
            .replace('{{%DROP2%}}', dropdownHtml[2]);
    
    return prefsOut;
}

app.get('/preferences', (req, res) => {
    let priority = [];
    getCookies(req, res);
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2); 
    let reset = (req.cookies.Reset);
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
        let parsedPrefs = JSON.parse(readFileSync('json/preferences.json', 'utf-8'));
        return parsedPrefs;
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        let parsedPrefs = callReset();
    }

    async function writePrefs(){
        setTimeout(function () {
            let prefRes = prefsJsonHtml(priority);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(prefRes);          
        }, 100);       
    }
    writePrefs();
})

app.use((req, res) => {
    res.status(404).send('Page not found');
})

if (!existsSync('json/preferences.json')) {
    prefReset();
}

app.listen(port, () => {
    console.log('Running on ' + port);
})