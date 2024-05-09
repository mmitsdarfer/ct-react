function topPriority(){
    var pri = document.getElementById("topPri").value;
    console.log(pri);
    if(pri == 'diffs'){
        setD();
    }
    else if(pri == 'times'){
        setT();
    }
    else if(pri == 'standings'){
        setS();
    }
}
//after getting top priority update 2nd priority drop down with remaining choices

//save priorities as cookies priority1, priority2, priority3
//initiate this function with a submit button or is there a way to do it when all 3 are filled in

function setD(){
    console.log('Set as diffs');
    document.cookie = "Priority=diffs"
    return 'diffs';
}
function setT(){
console.log('Set as times');
document.cookie = "Priority=times"
return 'times';
}
function setS(){
console.log('Set as standings');
document.cookie = "Priority=standings"
return 'standings';
}