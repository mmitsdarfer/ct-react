import fs from 'fs';

//merge & mergesort to rank the diffs
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
    let mid = Math.floor(arr.length / 2);
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

//puts game start tme into value that can be compared to game progress time
function militaryTime(time){
    time = time.split(':');
    time[0] = parseInt(time[0]);
    if(time[1].includes('PM')){
        time[0] += 12;
    }
    time[0] *= -60;
    time = time[0] - parseInt(time[1]);
    return time;
}

//groups games by progress and sorts them by time remaining
function timeSort(data){
    console.log(data);
    let sorted = [];
    let times = [];   
    for(let i = 0; i < data.length; i++){
        if(data[i].convertedTime.includes('Final')){
            times[i] = 0;
        }
        else if(data[i].convertedTime.includes('PM') || data[i].time.includes('AM')){
            times[i] = parseInt(militaryTime(data[i].time));
        }
        else{
            times[i] = parseInt(data[i].convertedTime);
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

//remove empty arrays from an array of arrays
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

//groups games by progress and sorts them by point differential 
function diffSort(data){
    let ongoingDiffs = [];
    let endedDiffs = [];
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ongoing'){
            ongoingDiffs[i] = data[i].diff;
        }
    }
    for(let i = 0; i < data.length; i++){
        if(data[i].progress == 'ended'){
            endedDiffs[i] = data[i].diff;
        }
        else if(data[i].progress == 'unstarted'){
            data[i].diffRank = ongoingDiffs.length;
        }
    }

    let ongoingSort = dropEmpties(mergeSort(ongoingDiffs));
    let endedSort  = dropEmpties(mergeSort(endedDiffs));
    
    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < ongoingSort.length; j++){
            if(data[i].diff == ongoingSort[j] && data[i].progress == 'ongoing'){
                data[i].diffRank = j;
            }
        }
        for(let j = 0; j < endedSort.length; j++){
            if(data[i].diff == endedSort[j] && data[i].progress == 'ended'){
                data[i].diffRank = j + ongoingSort.length + 1; //put ended games after ongoing and unstarted
            }
        }
    }
    return data;
}

//groups games by progress and sorts them by average standings of teams
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

//write to league page based on previous sorts
function toJson(data, league, date){
    let jsonData = {};
    jsonData.table = [];
    let obj = {};
    for(let i = 0; i < data.length; i++){
        if(data[i] !== undefined){
            for(let j = 0; j < data[i].length; j++){
                obj = {
                    team1: data[i][j].team1,
                    score1: data[i][j].score1,
                    team2: data[i][j].team2,
                    score2: data[i][j].score2,
                    progress: data[i][j].progress,
                    time: data[i][j].time,
                    network: data[i][j].network,
                    link: data[i][j].link
                }
                jsonData.table.push(obj);
            }
        }
        else{
            obj = {
                team1: data[i].team1,
                score1: data[i].score1,
                team2: data[i].team2,
                score2: data[i].score2,
                progress: data[i].progress,
                time: data[i].time,
                network: data[i].network,
                link: data[i].link
            }
            jsonData.table.push(obj);
        }      
    }
    jsonData.table.push({date: date});
    fs.writeFile('json/' + league.toLowerCase()+'.json', JSON.stringify(jsonData), function(err){
        if(err) throw err;
    }); 
}

//calls each type of sort and uses those rankings with priorities to come up with final sorted order and send that to json
export function finalSort(data, priority, league, date){
    console.log(data);
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

    console.log('Priority: ' + priority);
    console.log(endSorted); 
    toJson(endSorted, league, date); 
}

export default finalSort;