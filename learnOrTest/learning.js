function dateConversion(last, current){
    //[3,2,2024,16,49]
    let lastMatch = 0;
    for(let  i = 0; i < last.length; i++){
        if(last[i] != current[i]){
            lastMatch = i-1;
            break;
        }
    }
    if(lastMatch > 2){
        return false;
    }
    else{
        let minDiff = (current[3]*60 + current[4]) - (last[3]*60 + last[4]);
        if(lastMatch == 2){
            if(Math.abs(minDiff) < 180){
                return false;
            }
            else{
                return true;
            }
        }
        else{
            if(last[2] == current[2]){
                if(last[0] == current[0]){
                    if(current[2] - last[2] == 1){
                        console.log('its one');
                    }
                }
            }
        }
    }
//    
    
    console.log(last[lastMatch] + '\n' + lastMatch);
    console.log('last: ' + last);
    console.log('current: ' + current);
    return true;
}
//dateConversion(last, current)
var last = [3,1,2024,16,49];
var current = [3,2,2024,15,49];
var dateFormat = new Date([])
console.log(dateConversion(last, current));

/*
Testing:
1) Generate random value for each place for last and current
2) Run
3) Print random and true/false value
*/