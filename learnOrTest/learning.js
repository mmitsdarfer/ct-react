let postponed = 2;

let scores = [
    '0', '2', '-',  '-', '1',
    '7', '4', '3',  '9', '3',
    '5', '6', '12', '9', '2',
    '0', '8', '7',  '6', '2',
    '3', '3', '12', '5'
  ]
  
//let postGame = scores.shift();
//scores += postGame;


scores.push(...scores.splice(postponed, 2));
console.log(scores);