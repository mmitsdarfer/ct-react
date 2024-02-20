/*just used for testing*/


teams = ['Golden Knights', 'Rangers', 'Panthers', 'Penguins', 'Kings', 'Avalanche', 'Blues', 'Kraken'];
scores = [12, 1, 4, 2, 13, 2, 33, 4];
progress = ['ongoing', 'ongoing', 'ongoing', 'ongoing'];
times = ['0:33 - 3rd', '3:22 - 2nd', 'End of 2nd', '1:55 - OT'];
diffs = [];
ongoingDiffs = [];
for(let i = 0; i < times.length; i++){
    if(progress[i] == 'ongoing'){
        diffs[i] = Math.abs(scores[i*2] - scores[i*2+1]);
        ongoingDiffs.push(diffs[i]);
    }
}

ongoingSort = mergeSort(ongoingDiffs);
diffTies = [];
diffTimes = [];

for(let i = 0; i < ongoingDiffs.length; i++){
    diffTies[i] = [];
    diffTimes[i] = [];
    for(let j = 0; j < times.length; j++){
        if(ongoingSort.indexOf(diffs[j]) == i){
            diffTies[i].push([diffs[j], j]);   //diff amount, diff position
            diffTimes[i].push(times[j]);
        }
    }
}
league = 'NHL';

multiTimes = [];

for(let i = 0; i < diffTies.length; i++){
    if(diffTies[i].length > 1){
        multiTimes = timeSort(league, diffTimes[i]);
        for(let j = 0; j < diffTies[i].length; j++){
            console.log(teams[2*diffTies[i][multiTimes[j][1]][1]] + ': ' + scores[2*diffTies[i][multiTimes[j][1]][1]] + '\n'
            + teams[2*diffTies[i][multiTimes[j][1]][1]+1] + ': ' + scores[2*diffTies[i][multiTimes[j][1]][1]+1]) + '\n'; /*team at position derived from current diff amount,
            highest time from timeSort, and the ones are for positions being second for timeSort and diffTies       */

        }  
    }
    else if(diffTies[i].length == 1){
        console.log(teams[2*diffTies[i][0][1]] + ': ' + scores[2*diffTies[i][0][1]] + '\n'
        + teams[2*diffTies[i][0][1]+1] + ': ' + scores[2*diffTies[i][0][1]+1]) + '\n';
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

function timeConversion(league, time){
    convertedTime = 0;
    units = null;
    unitLen = 0;    //in seconds if applicable
    if(league == 'NHL'){
        units = 'periods';
        unitLen = 1200;
        unitMax = 3;
        if(time.includes('SO')) return 5 * unitLen;
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

    if(time.includes('End')){
        time = [20, 0, (parseInt(time.slice(-3))+1).toString()]
    }
    else{
        time = time.split(':');
        time = time.concat(time[1].split(' - '));
        time[1] = time[2];
        time[2] = time[3];
        time = time.slice(0,3);
        time[0] = parseInt(time[0]);
        time[1] = parseInt(time[1]);
    }
    
    if((time[2].endsWith('OT'))){
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

function timeSort(league, times){
    //times = list of times from games with same diffs
    convertedTimes = [];
    finalSort = [];
    for(let i = 0; i < times.length; i++){
        convertedTimes[i] = timeConversion(league, times[i]);
    }
    orderedTimes = mergeSort(convertedTimes);
    orderedTimes = orderedTimes.reverse();
    for(let j = 0; j < times.length; j++){
        finalSort.push([orderedTimes[j], convertedTimes.indexOf(orderedTimes[j])]);
    }
    return finalSort;
}