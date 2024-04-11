import express from 'express';
const app = express();
const port = 8000;
import fs from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { parse } from 'url';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { existsSync, readFileSync, writeFile } from "fs";
import cookieParser from 'cookie-parser';
import { callScrape } from './scrape-sort/scrape.js';

var current;
var takeMe;

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

app.use(cookieParser());

//convert cookies to be written into preferences.json and reset if asked to
function getCookies(req, res){
    let priority = [];
    priority[0] = (req.cookies.Priority0); 
    priority[1] = (req.cookies.Priority1); 
    priority[2] = (req.cookies.Priority2); 
    takeMe = req.cookies.Take;
    let timer = req.cookies.Timer;
    if(timer === undefined){
        res.cookie('Timer', 'manual');
    }
    if(takeMe === undefined){
        takeMe = 'off';
        res.cookie('Take', 'off');
    }
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

    if (!existsSync('../json/preferences.json')) {
        prefReset(priority);
    }
    
    let parsedPrefs;
    function callReset(){    
        res.cookie('Reset', 'false');
        setTimeout(() => {   
            prefReset(priority);     
        }, );
        parsedPrefs = JSON.parse(readFileSync('../json/preferences.json', 'utf-8'));
        return parsedPrefs;
    }
    if(reset === 'true'){   //cookies are read as strings, so == would just be if they exist
        parsedPrefs = callReset();
    }
    else{
        parsedPrefs = JSON.parse(readFileSync('../json/preferences.json', 'utf-8'));
    }
    
    let prefsOut = parsedPrefs;
    prefsOut[1] = priority;
    writeFile('../json/preferences.json', (JSON.stringify(prefsOut)), function(err){
        if(err) throw err;
    });
}

//home page
app.get('/', (req, res) => {
    getCookies(req, res);
    res.sendFile(__dirname + '\\index.html');
});

app.use(express.static(__dirname + '/')); 
app.use(express.static(join(__dirname, 'public')));

//resets values of preferences.json or creates it with reset values
async function prefReset(priority = ['diffs', 'times', 'standings']){
    let prefData = JSON.stringify(['NHL', priority, ['NBA', 0], ['MLB', 0], ['NFL', 0], ['NHL', 0]]);
    writeFile('../json/preferences.json', prefData, function(err){
        if(err) throw err;
    });  
    return true;    
}

//increases preference value when league selected and updates preferences.json
function preferences(league){
    var prefData;
    if (existsSync('../json/preferences.json')) {
        prefData = JSON.parse(readFileSync('../json/preferences.json', 'utf-8'));
    }
    else{
        prefReset();    //need preferences.json to exist
        prefData = JSON.parse(readFileSync('../json/preferences.json', 'utf-8'));
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
    writeFile('../json/preferences.json', JSON.stringify(outList), function(err){
        if(err) throw err;
    }); 
}

function timer(duration, league, res){
    if(duration == 'manual') console.log('Auto-refresh set to manual')
    else if (duration == 30 || duration == 60 || duration == 300){
        console.log('Timer length: ' + duration);
        function redir(){
            res.redirect('/'+league);
        }
        setTimeout(redir, duration*1000);
    }
    else duration = 'manual';
    
}

app.get('/nhl', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('../json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('../json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
            if(err) throw err;
        }); 
    }
    getCookies(req, res);
    let priority = [];
    priority[0] = req.cookies.Priority0; 
    priority[1] = req.cookies.Priority1; 
    priority[2] = req.cookies.Priority2;   
    let reset = req.cookies.Reset;

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
            let duration = req.cookies.Timer;
            timer(duration, current, res);   
        }, 100);       
    }
    writeNhl();

    
});

app.get('/nfl', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('../json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('../json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
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
            let duration = req.cookies.Timer;
            timer(duration, current, res);    
        }, 100);
    }
    writeNfl();
});

app.get('/nba', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('../json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('../json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
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
            let duration = req.cookies.Timer;
            timer(duration, current, res);      
        }, 100);     
    }
    writeNba();
});

import mlbScrape from './scrape-sort/mlbScrape.js';
app.get('/mlb', (req, res) => {
    current = parse(req.url).pathname.replace('/', '').toUpperCase();
    var data = {};
    data.table = [];
    data.table.push({"date":"December 21, 2000"});
    if(!existsSync('../json/' + current.toLowerCase() + '.json', 'utf-8')) {
        fs.writeFile('../json/' + current.toLowerCase()+'.json', JSON.stringify(data), function(err){
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
            mlbScrape(priority);
            preferences(current);     
            let duration = req.cookies.Timer;
            timer(duration, current, res);   
        }, 100);     
    }
    writeMlb();
});

app.use((req, res) => {
    res.status(404).send('Page not found');
})

if (!existsSync('../json/preferences.json')) {
    prefReset();
}

app.listen(port, () => {
    console.log('Running on ' + port);
})