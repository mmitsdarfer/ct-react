function dateAndTime(last){
    let current = new Date();
    let timeDiff = current.getTime() - last.getTime();
    let diffHrs = Math.round(timeDiff / (1000 * 3600));
    console.log('diffHrs btwn ' + current + ' and ' + last);
    console.log(diffHrs);
    if(diffHrs > 3){
        return true;
    }
    return false;
}

let last = new Date(2024, 2, 2, 12, 0);

console.log(dateAndTime(last));
//let current = new Date(...dateAndTime());


/*
Testing:
1) Generate random value for each place for last and current
2) Run
3) Print random and true/false value
*/