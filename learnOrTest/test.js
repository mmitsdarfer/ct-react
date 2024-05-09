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

var mlbData =  
[
       {
         team1: 'Rays',
         score1: '2',
         team2: 'Rockies',
         score2: '4',
         progress: 'ongoing',
         time: 'Bot 7th',
         network: 'Apple TV+',
         link: 'https://tv.apple.com/us/room/apple-tv-major-league-baseball/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2',
         diff: 2,
         avgStanding: 22.5,
         convertedTime: '15',
         timeRank: 1,
         diffRank: 2,
         standRank: 2
       },
       {
         team1: 'Orioles',
         score1: '4',
         team2: 'Pirates',
         score2: '2',
         progress: 'ongoing',
         time: 'Bot 7th',
         network: 'Apple TV+',
         link: 'https://tv.apple.com/us/room/apple-tv-major-league-baseball/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2',
         diff: 2,
         avgStanding: 5,
         convertedTime: '15',
         timeRank: 1,
         diffRank: 2,
         standRank: 0
       },
       {
         team1: 'Padres',
         score1: '2',
         team2: 'Giants',
         score2: '2',
         progress: 'ongoing',
         time: 'Bot 6th',
         network: 'NESN',
         link: '',
         diff: 0,
         avgStanding: 20,
         convertedTime: '13',
         timeRank: 2,
         diffRank: 0,
         standRank: 1
       },
       {
         team1: 'Mets',
         score1: '-',
         team2: 'Reds',
         score2: '-',
         progress: 'unstarted',
         time: '6:40 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 17.5,
         convertedTime: '6:40 PM',
         timeRank: 6,
         diffRank: 3,
         standRank: 7
       },
       {
         team1: 'Phillies',
         score1: '-',
         team2: 'Nationals',
         score2: '-',
         progress: 'unstarted',
         time: '6:45 PM',
         network: 'NBCSP',
         link: 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia',
         diff: 100,
         avgStanding: 21.5,
         convertedTime: '6:45 PM',
         timeRank: 7,
         diffRank: 3,
         standRank: 8
       },
       {
         team1: 'Diamondbacks',
         score1: '-',
         team2: 'Braves',
         score2: '-',
         progress: 'unstarted',
         time: '7:20 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 12.5,
         convertedTime: '7:20 PM',
         timeRank: 8,
         diffRank: 3,
         standRank: 5
       },
       {
         team1: 'White Sox',
         score1: '-',
         team2: 'Royals',
         score2: '-',
         progress: 'unstarted',
         time: '7:40 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 23,
         convertedTime: '7:40 PM',
         timeRank: 9,
         diffRank: 3,
         standRank: 9
       },
       {
         team1: 'Astros',
         score1: '-',
         team2: 'Rangers',
         score2: '-',
         progress: 'unstarted',
         time: '8:05 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 16,
         convertedTime: '8:05 PM',
         timeRank: 10,
         diffRank: 3,
         standRank: 6
       },
       {
         team1: 'Mariners',
         score1: '-',
         team2: 'Brewers',
         score2: '-',
         progress: 'unstarted',
         time: '8:10 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 12,
         convertedTime: '8:10 PM',
         timeRank: 11,
         diffRank: 3,
         standRank: 4
       },
       {
         team1: 'Red Sox',
         score1: '-',
         team2: 'Angels',
         score2: '-',
         progress: 'unstarted',
         time: '9:38 PM',
         network: undefined,
         link: '',
         diff: 100,
         avgStanding: 8.5,
         convertedTime: '9:38 PM',
         timeRank: 12,
         diffRank: 3,
         standRank: 3
       },
       {
         team1: 'Blue Jays',
         score1: '3',
         team2: 'Yankees',
         score2: '0',
         progress: 'ended',
         time: 'Final',
         network: undefined,
         link: undefined,
         diff: 3,
         avgStanding: 8,
         convertedTime: 'Final',
         timeRank: 13,
         diffRank: 6,
         standRank: 11
       },
       {
         team1: 'Athletics',
         score1: '4',
         team2: 'Tigers',
         score2: '5',
         progress: 'ended',
         time: 'Final',
         network: undefined,
         link: undefined,
         diff: 1,
         avgStanding: 14,
         convertedTime: 'Final',
         timeRank: 13,
         diffRank: 4,
         standRank: 12
       },
       {
         team1: 'Dodgers',
         score1: '7',
         team2: 'Cubs',
         score2: '9',
         progress: 'ended',
         time: 'Final',
         network: undefined,
         link: undefined,
         diff: 2,
         avgStanding: 5.5,
         convertedTime: 'Final',
         timeRank: 13,
         diffRank: 5,
         standRank: 10
       }
     ]
var nhlData = [
    {
      team1: 'Lightning',
      score1: '4',
      team2: 'Maple Leafs',
      score2: '1',
      progress: 'ended',
      time: 'Final',
      network: undefined,
      link: undefined,
      diff: 3,
      avgStanding: 10,
      convertedTime: 'Final',
      timeRank: 5,
      diffRank: 4,
      standRank: 1
    },
    {
      team1: 'Devils',
      score1: '3',
      team2: 'Rangers',
      score2: '4',
      progress: 'ended',
      time: 'Final',
      network: undefined,
      link: undefined,
      diff: 1,
      avgStanding: 11,
      convertedTime: 'Final',
      timeRank: 5,
      diffRank: 2,
      standRank: 2
    },
    {
      team1: 'Oilers',
      score1: '0',
      team2: 'Stars',
      score2: '5',
      progress: 'ended',
      time: 'Final',
      network: undefined,
      link: undefined,
      diff: 5,
      avgStanding: 4.5,
      convertedTime: 'Final',
      timeRank: 5,
      diffRank: 5,
      standRank: 0
    },
    {
      team1: 'Kraken',
      score1: '2',
      team2: 'Kings',
      score2: '5',
      progress: 'ended',
      time: 'Final',
      network: undefined,
      link: undefined,
      diff: 3,
      avgStanding: 18,
      convertedTime: 'Final',
      timeRank: 5,
      diffRank: 4,
      standRank: 4
    },
    {
      team1: 'Canucks',
      score1: '2',
      team2: 'Coyotes',
      score2: '1',
      progress: 'ended',
      time: 'Final',
      network: undefined,
      link: undefined,
      diff: 1,
      avgStanding: 15,
      convertedTime: 'Final',
      timeRank: 5,
      diffRank: 2,
      standRank: 3
    }
];

var data;
data = mlbData;
//data = nhlData;



let firstOrder = [];
let secondOrder = [];
let thirdOrder = [];
function finalSort(priority){
    if(priority[0] == 'diffs'){
        for(let i = 0; i < data.length+1; i++){    //+1 because max diff/time/standing is set equal to length 
            for(let j = 0; j < data.length; j++){
                if(data[j].diffRank == i){
                    firstOrder.push(data[j]);
                }
            }
        }
        dropEmpties(firstOrder);
        if(priority[1] == 'times'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].timeRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
            // thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].standRank == j) thirdOrder.push(secondOrder[i][k]);
                            }
                        }
                        
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder.push(secondOrder[i][0]);
                    }
                }
            }
        }
        else if(priority[1] == 'standings'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].standRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
                //thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].timeRank == j) thirdOrder.push(secondOrder[i][k]);
                            }
                        }             
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder.push(secondOrder[i][0]);
                    }
                }
            }
        }   
    }
    else if(priority[0] == 'times'){
        for(let i = 0; i < data.length+1; i++){    //+1 because max diff/time/standing is set equal to length
        // firstOrder[i] = [];
            for(let j = 0; j < data.length; j++){
                if(data[j].timeRank == i) {
                    firstOrder.push(data[j]);
                }
            }
        }
        dropEmpties(firstOrder);
        if(priority[1] == 'diffs'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].diffRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
                //thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].standRank == j) thirdOrder.push(secondOrder[i][k]);
                            }
                        }                
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder.push(secondOrder[i][0]);
                    }
                }
            }
        }
        else if(priority[1] == 'standings'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].standRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
                //thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].diffRank == j) thirdOrder.push(secondOrder[i][k]);
                            }
                        }          
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder.push(secondOrder[i][0]);
                    }
                }
            }
        }
    }
    else if(priority[0] == 'standings'){
        for(let i = 0; i < data.length+1; i++){    //+1 because max diff/time/standing is set equal to length
            for(let j = 0; j < data.length; j++){
                if(data[j].standRank == i){
                    firstOrder.push(data[j]);
                }
            }
        }
        dropEmpties(firstOrder);
        if(priority[1] == 'diffs'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].diffRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
                thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].timeRank == j) thirdOrder[i].push(secondOrder[i][k]);
                            }
                        }
                        
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder[i].push(secondOrder[i][0]);
                    }
                }
            }
        }
        else if(priority[1] == 'times'){
            for(let i = 0; i < firstOrder.length; i++){
                secondOrder[i] = [];
                if(firstOrder[i] !== undefined){
                    if(firstOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < firstOrder[i].length; k++){
                                if(firstOrder[i][k].timeRank == j) secondOrder[i].push(firstOrder[i][k]);
                            }
                        }
                    }
                    else if(firstOrder[i].length == 1){
                        secondOrder[i].push(firstOrder[i][0]);
                    }
                }
            }
            //priority[2] starts here
            for(let i = 0; i < secondOrder.length; i++){
                //thirdOrder[i] = [];
                if(secondOrder !== undefined){
                    if(secondOrder[i].length > 1){
                        for(let j = 0; j < data.length+1; j++){
                            for(let k = 0; k < secondOrder[i].length; k++){
                                if(secondOrder[i][k].diffRank == j) thirdOrder.push(secondOrder[i][k]);
                            }
                        }
                    }
                    else if(secondOrder[i].length == 1){
                        thirdOrder.push(secondOrder[i][0]);
                    }
                }
            }
        }   
    }
}


priority = ['standings', 'times', 'diffs'];
finalSort(priority);
//console.log(data);
//console.log(firstOrder);

console.log(thirdOrder);
console.log(priority);
//console.log(data.length);
//console.log(firstOrder.length);
console.log(thirdOrder.length);

/*
Tested:
diffs-x-x first order   passed
times-x-x first order   passed
standings-x-x first order passed
WIWWO: tested all first orders and just fixed mlb standings, test 2nd order next
*/