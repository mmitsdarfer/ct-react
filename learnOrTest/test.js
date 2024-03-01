//test data for sorting troubleshooting

var priority = ['diffs', 'times', 'standings'];
var data = {}; 
data.table  = []; 
data.table.push(
    {
      team1: 'Flyers',
      score1: '0',
      team2: 'Capitals',
      score2: '0',
      progress: 'ongoing',
      time: '1:25 - 1st',
      network: 'NBCSP',
      link: 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia',
      diff: 0,
      avgStanding: 16.5,
    }
);
data.table.push(
    {
      team1: 'Coyotes',
      score1: '-',
      team2: 'Senators',
      score2: '-',
      progress: 'unstarted',
      time: '7:00 PM',
      network: 'NHLPP|ESPN+',
      link: 'https://www.espn.com/watch/',
      diff: 100,
      avgStanding: 26.5,
    }
);
data.table.push(
    {
      team1: 'test0',
      score1: '1',
      team2: 'test1',
      score2: '1',
      progress: 'ongoing',
      time: '11:25 - 2nd',
      network: '',
      link: '',
      diff: 0,
      avgStanding: 1.5,
    }
);
data.table.push(
    {
      team1: 'Devils',
      score1: '4',
      team2: 'Ducks',
      score2: '3',
      progress: 'ended',
      time: 'Final/OT',
      network: 'NHLPP|ESPN+',
      link: 'https://www.espn.com/watch/',
      diff: 1,
      avgStanding: 22.5,
    }
);

function timeConversion(league, time){
    time = String(time);
    let units = null;
    let unitLen = 0;    //in seconds if applicable
    let unitMax;
    if(league == 'NHL'){
        units = 'periods';
        unitLen = 1200;
        unitMax = 3;
        if(time.includes('SO') && !time.includes('Final')) return 5 * unitLen;
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
        time = [0, 0, (parseInt(time) + 1).toString()];    //as period ends the time disappears but the period remains,
                                                        //so set time to beginning of next period
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

function timeToObj(data, league){   
    for(let i = 0; i < data.length; i++){
        data[i].convertedTime = timeConversion(league, data[i].time).toString();
    }
}

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

function diffSort(data){
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
            endedDiffs[i] = data[i].diff;
        }
    }

    let ongoingSort = dropEmpties(mergeSort(ongoingDiffs));
    let endedSort  = dropEmpties(mergeSort(endedDiffs));
    
    for(let i = 0; i < data.length; i++){
        console.log(data[i]);
        for(let j = 0; j < ongoingSort.length; j++){
            if(data[i].diff == ongoingSort[j] && data[i].progress == 'ongoing'){
                data[i].diffRank = j;
            }
        }
        for(let j = 0; j < endedSort.length; j++){
            if(data[i].diff == endedSort[j] && data[i].progress == 'ended'){
                data[i].diffRank = j + ongoingSort.length;
                console.log('DRHERE');
                console.log(data[i]);
            }
        }
    }
    for(let i = 0; i < data.length; i++){
        
    }

    return data;
}

function standingsSort(data){
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
            if(data[i].progress == 'ongoing' && data[i].avgStanding == onStandsSort[j]){
                data[i].standRank = j
            }
        }
        for(let j = 0; j < unstartedStands.length; j++){
            if(data[i].progress == 'unstarted' && data[i].avgStanding == unstartStandsSort[j]){
                data[i].standRank = j + ongoingStands.length;
            }
        }
        for(let j = 0; j < endedStands.length; j++){
            if(data[i].progress == 'ended' && data[i].avgStanding == endStandsSort[j]){
                data[i].standRank = j + ongoingStands.length + unstartedStands.length;
            }
        }
    }

    return data;
}

function dropEmpties(data){
    
    for(let i = 0; i < data.length; i++){
        if(data[i] !== undefined){
            if(data[i].length == 0){
                data.splice(i, 1);
                i = i-1; //reset since changing length skips numbers
            }
        }
        else{
            data.splice(i, 1);
                i = i-1;
        }
    }
    return data;
}

function finalSort(data, priority, league, date){
    data = timeSort(data);
    data = diffSort(data);
    data = standingsSort(data);

    let sorted = [];
    let midSorted = [];
    let lastSorted = [];
    let allSorted = [];
    let endSorted = [];

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
            
            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].standRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);                     
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
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
            
            dropEmpties(allSorted); 

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){                     
                    for(let j = 0; j < data.length+1; j++){                                              
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].timeRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);               
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }        
    }
    else if(priority[0] == 'times'){
        for(let i = 0; i < data.length+1; i++){    
            sorted[i] = [];
            for(let j = 0; j < data.length; j++){
                if(data[j].timeRank == i){
                    sorted[i].push(data[j]);
                }
            }
        }
        if(priority[1] == 'diffs'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].diffRank == j){
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

            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].standRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);             
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
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
            
            dropEmpties(allSorted); 

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){                     
                    for(let j = 0; j < data.length+1; j++){                                              
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].diffRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);               
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        } 
    }
    else if(priority[0] == 'standings'){
        for(let i = 0; i < data.length+1; i++){  
            sorted[i] = [];     
            for(let j = 0; j < data.length; j++){
                if(data[j].standRank == i){
                    sorted[i].push(data[j]);
                }
            }
        }
        if(priority[1] == 'diffs'){
            for(let i = 0; i < data.length+1; i++){
                if(sorted[i] !== undefined && sorted[i].length > 1){    
                    for(let j = 0; j < data.length+1; j++){
                        midSorted[j] = [];
                        for(let k = 0; k < sorted[i].length; k++){                        
                            if(sorted[i][k].diffRank == j){
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

            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].timeRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);             
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
        else if(priority[1] == 'times'){
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
            
            dropEmpties(allSorted);

            for(let i = 0; i < data.length+1; i++){
                if(allSorted[i] !== undefined && allSorted[i].length > 1){  
                    for(let j = 0; j < data.length+1; j++){                       
                        lastSorted[j] = [];
                        for(let k = 0; k < allSorted[i].length; k++){                        
                            if(allSorted[i][k].diffRank == j){
                                lastSorted[j].push(allSorted[i][k]);
                            }
                        } 
                        endSorted.push(lastSorted[j]);                     
                    }
                }
                else{
                    endSorted.push(allSorted[i]);
                }
            }  
        }
    }
    
    dropEmpties(endSorted);

    console.log(priority);
    console.log(endSorted); 
   // toJson(endSorted, league, date); 
}

function timeSort(data){
    let sorted = [];
    let times = [];
    
    for(let i = 0; i < data.length; i++){
        if(data[i].convertedTime.includes('Final')){
            times[i] = '0';
        }
        else if(data[i].convertedTime.includes('PM') || data[i].time.includes('AM')){
            times[i] = militaryTime(data[i].time);
            data[i].convertedTime = militaryTime(data[i].time);
        }
        else{
            times[i] = data[i].convertedTime;
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

var league = "NHL";
var date = "March 1, 2024";

data = data.table;
timeToObj(data, league);
finalSort(data, priority, league, date);