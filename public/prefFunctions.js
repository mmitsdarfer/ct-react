//Handles cookies and adjusts preferences.html code to reflect user choices

function setD(numVal){
    console.log('Priority' + numVal + ' set as diffs');
    var priorities = document.getElementsByClassName("selectPriority");
    if(numVal == 0){
        document.cookie = "Priority0=diffs";
        //top priority so remove from all lower dropdowns
        priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>','');
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="diffs">Diffs</option>','');
    }
    else if(numVal == 1){
        document.cookie = "Priority1=diffs";
        //remove lower dropdown
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="diffs">Diffs</option>','');
    }
    else if(numVal == 2){
        document.cookie = "Priority2=diffs";
    }    
}
function setT(numVal){
    console.log('Priority' + numVal + ' set as times');
    var priorities = document.getElementsByClassName("selectPriority");
    if(numVal == 0){
        document.cookie = "Priority0=times";
        //top priority so remove from all lower dropdowns
        priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>','');
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="times">Times</option>','');
    }
    else if(numVal == 1){
        document.cookie = "Priority1=times";
        //remove lower dropdown
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option class="options" value="times">Times</option>','');
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="times">Times</option>','');                                         
    }
    else if(numVal == 2){
        document.cookie = "Priority2=times";
    }  
}
function setS(numVal){
    console.log('Priority' + numVal + ' set as standings');
    var priorities = document.getElementsByClassName("selectPriority");
    if(numVal == 0){
        document.cookie = "Priority0=standings";
        //top priority so remove from all lower dropdowns
        priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>','');
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="standings">Standings</option>','');
    }
    else if(numVal == 1){
        document.cookie = "Priority1=standings"; 
        //remove lower dropdown
        priorities[2].innerHTML = priorities[2].innerHTML.replace('<option value="standings">Standings</option>','');
    }
    else if(numVal == 2){
        document.cookie = "Priority2=standings";
    }  
}

//alter html based on current rank
function resetPriorities(rank){  
    var priorities = document.getElementsByClassName("selectPriority");
    //successive priorities are the same except for rank and option values which are changed in set functions
    if(rank == 'top'){
        priorities[1].innerHTML = priorities[0].innerHTML.replace('top', '2nd');
        priorities[2].innerHTML = priorities[1].innerHTML.replace('2nd', 'last');
    }  
    else if(rank == 'mid'){
        priorities[2].innerHTML = priorities[1].innerHTML.replace('2nd', 'last');
    }
}

//called onload. gets cookies and sets starting dropdowns accordingly
function startup(){
    const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    )
    let priority = [];
    priority[0] = getCookieValue('Priority0');
    priority[1] = getCookieValue('Priority1');
    priority[2] = getCookieValue('Priority2');
    let diffsUsed = false;
    let timesUsed = false;
    let standUsed = false;
    for(let i = 0; i < priority.length; i++){
        //put selection in corresponding dropdown only if it hasn't been used yet
        //set functions remove repeated option from dropdowns but they could be displayed as selected w/o used bools
        if(priority[i] == 'diffs'){
            if(!diffsUsed){
                setD(i);
                diffsUsed = true;
            }
            else if(!timesUsed){
                setT(i);
                timesUsed = true;
            }
            else if(!standUsed){
                setS(i);
                standUsed = true;
            }
        }
        else if(priority[i] == 'times'){
            if(!timesUsed){
                setT(i);
                timesUsed = true;
            }
            else if(!diffsUsed){
                setD(i);
                diffsUsed = true;
            }
            else if(!standUsed){
                setS(i);
                standUsed = true;
            }
        }
        else if(priority[i] == 'standings'){
            if(!standUsed){
                setS(i);
                standUsed = true;
            }
            else if(!diffsUsed){
                setD(i);
                diffsUsed = true;
            }
            else if(!timesUsed){
                setT(i);
                timesUsed = true;
            }
        }
    }
    let takeCheck = getCookieValue('Take');
    let takeMe = document.getElementById("check");
}

//1st dropdown
function topPriority(){
    const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    );
    let priority1 = getCookieValue('Priority1');
    resetPriorities('top');
    var priorities = document.getElementsByClassName("selectPriority");
    var chosenPri = priorities[0].value;

    /*for whole if block:
    set top choice, change other choices to reflect (past priority if possible, next on list if same as top choice)
    update dropdown lists so choices are in same order as they were chosen and not duplicated
    */
    if(chosenPri == 'diffs'){
        setD(0);  
        if(priority1 == 'times' || priority1 == 'diffs'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>','<option value="times">Times</option>')
             + '<option value="standings">Standings</option>';
            setT(1);
            setS(2);
        }
        else if(priority1 == 'standings'){
            setS(1);
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>','<option value="standings">Standings</option>')
             + '<option value="times">Times</option>';
             
            setT(2);
        }
    }
    else if(chosenPri == 'times'){
        setT(0);
        if(priority1 == 'diffs' || priority1 == 'times'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>','<option value="diffs">Diffs</option>')
             + '<option value="standings">Standings</option>';
            console.log('time');
            console.log(priorities[1]);
            setD(1);
           
            setS(2);
        }
        else if(priority1 == 'standings'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>','<option value="standings">Standings</option>')
             + '<option value="diffs">Diffs</option>';
            setS(1);
            setD(2);
        }
    }
    else if(chosenPri == 'standings'){
        setS(0);
        console.log('stand:');
        console.log(priorities[1]);
        if(priority1 == 'times' || priority1 == 'standings'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>','<option value="times">Times</option>')
             + '<option value="diffs">Diffs</option>';
            
            
            setT(1);
            setD(2);
        }
        else if(priority1 == 'diffs'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>','<option value="diffs">Diffs</option>')
             + '<option value="times">Times</option>';
            setD(1);
            setT(2);
        }
    }
}

//changes 2nd and 3rd dropdowns
function midPriority(){
    resetPriorities('mid');
    const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
      )
    let priority0 = getCookieValue('Priority0');
    var priorities = document.getElementsByClassName("selectPriority");
    var chosenPri = priorities[1].value
    if(chosenPri == 'diffs'){
        setD(1);
        if(priority0 == 'times'){
            setS(2);
        }
        else if(priority0 == 'standings'){
            setT(2);
        }
    }
    else if(chosenPri == 'times'){
        setT(1);
        if(priority0 == 'diffs'){
            setS(2);
        }
        else if(priority0 == 'standings'){
            setD(2);
        }
    }
    else if(chosenPri == 'standings'){
        setS(1);
        if(priority0 == 'times'){
            setD(2);
        }
        else if(priority0 == 'diffs'){
            setT(2);
        }
    }
}

//last dropdown shows only remaining option, but this ensures no duplicates between mid and last dropdowns
function lastPriority(){
    var priorities = document.getElementsByClassName("selectPriority");
    var chosenPri = priorities[2].value
    if(chosenPri == 'diffs'){
        setD(2);
    }
    else if(chosenPri == 'times'){
        setT(2);
    }
    else if(chosenPri == 'standings'){
        setS(2);
    }
}

//clears number of page views and updates reset cookie which is accessed in other pages
function reset(){
    console.log('Reset');
    var hits = document.getElementsByClassName('hits')
    for(let i = 0; i < hits.length; i++){
        hits[i].innerHTML = '<br></br>' + 0;
    }
    document.cookie = "Reset=true";
}

function takeMe(){
    var takeMe = document.getElementById("check");
    if(takeMe.checked){
        console.log('take me: on');
        document.cookie = "Take=on";
    }  //add take me on or take me off
    else{
        console.log('take me: off');
        document.cookie = "Take=off";
    }
}