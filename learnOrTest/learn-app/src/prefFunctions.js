//Handles cookies and adjusts preferences.html code to reflect user choices

function SetD({numVal}){
    console.log('Priority {numVal} set as diffs');
    if({numVal} == 0){
        document.cookie = "Priority0=diffs";
        return(
            <div>
                <p>{numVal}</p>
                <option value="times">Times</option>
                <option value="standings">Standings</option>
            </div>
            
        )
    }
    else if(numVal == 1){
        document.cookie = "Priority1=diffs";
        return(
            ''
        )
        //remove lower dropdown
    }
}

function SetT({numVal}){
    console.log('Priority' + numVal + ' set as diffs');
    if({numVal} == 0){
        document.cookie = "Priority0=times";
        return(           
            <div>
                <p>{numVal}</p>
                <option value="diffs">Diffs</option>
                <option value="standings">Standings</option>
            </div>
            
        )
    }
    else if(numVal == 1){
        document.cookie = "Priority1=diffs";
        return(
            ''
        )
        //remove lower dropdown
    }
}

/*function SetD(numVal){
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

function SetT(numVal){
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
*/
function SetS(numVal){
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

//called onload. gets cookies and SetS starting dropdowns accordingly
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
                diffsUsed = true;
                return(
                    <SetD numVal={i}></SetD>
                )
                
            }
            else if(!timesUsed){
                <SetT numVal={i}></SetT>
                timesUsed = true;
            }
            else if(!standUsed){
                <SetS numVal={i}></SetS>
                standUsed = true;
            }
        }
        else if(priority[i] == 'times'){
            if(!timesUsed){
                <SetT numVal={i}></SetT>
                timesUsed = true;
            }
            else if(!diffsUsed){
                <SetD numVal={i}></SetD>
                diffsUsed = true;
            }
            else if(!standUsed){
                <SetS numVal={i}></SetS>
                standUsed = true;
            }
        }
        else if(priority[i] == 'standings'){
            if(!standUsed){
                <SetS numVal={i}></SetS>
                standUsed = true;
            }
            else if(!diffsUsed){
                <SetD numVal={i}></SetD>
                diffsUsed = true;
            }
            else if(!timesUsed){
                <SetT numVal={i}></SetT>
                timesUsed = true;
            }
        }
    }
}

function TopPriority({chosenTop, chosenMid}){
    if(chosenTop== 'diffs'){
        <SetD numVal={0}></SetD>
        if(chosenMid == 'times' || chosenMid == 'diffs'){
            return(
                <div>
                    <SetT numVal={1}></SetT>
                    <SetS numVal={2}></SetS>
                </div>   
            )        
            return(
                <div>
                    <option value="times">Times</option>
                    <option value="standings">Standings</option>
                </div>
                
            )
        }

    }
    
}

//1st dropdown
/*
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
   /*
    if(chosenPri == 'diffs'){
        SetD(0);  
        if(priority1 == 'times' || priority1 == 'diffs'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>','<option value="times">Times</option>')
             + '<option value="standings">Standings</option>';
            SetT(1);
            SetS(2);
        }
        else if(priority1 == 'standings'){
            SetS(1);
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>','<option value="standings">Standings</option>')
             + '<option value="times">Times</option>';
             
            SetT(2);
        }
    }
    else if(chosenPri == 'times'){
        SetT(0);
        if(priority1 == 'diffs' || priority1 == 'times'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>','<option value="diffs">Diffs</option>')
             + '<option value="standings">Standings</option>';
            console.log('time');
            console.log(priorities[1]);
            SetD(1);
           
            SetS(2);
        }
        else if(priority1 == 'standings'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="standings">Standings</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>','<option value="standings">Standings</option>')
             + '<option value="diffs">Diffs</option>';
            SetS(1);
            SetD(2);
        }
    }
    else if(chosenPri == 'standings'){
        SetS(0);
        console.log('stand:');
        console.log(priorities[1]);
        if(priority1 == 'times' || priority1 == 'standings'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>','<option value="times">Times</option>')
             + '<option value="diffs">Diffs</option>';
            
            
            SetT(1);
            SetD(2);
        }
        else if(priority1 == 'diffs'){
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="diffs">Diffs</option>', '');
            priorities[1].innerHTML = priorities[1].innerHTML.replace('<option value="times">Times</option>','<option value="diffs">Diffs</option>')
             + '<option value="times">Times</option>';
            SetD(1);
            SetT(2);
        }
    }
}
*/

//changes 2nd and 3rd dropdowns
function MidPriority({chosenTop, chosenMid}){
    if(chosenMid == 'diffs'){
        SetD(1);
        if(chosenTop == 'times'){
            SetS(2);
        }
        else if(chosenTop == 'standings'){
            SetT(2);
        }
    }
    else if(chosenMid == 'times'){
        SetT(1);
        if(chosenTop == 'diffs'){
            SetS(2);
        }
        else if(chosenTop == 'standings'){
            SetD(2);
        }
    }
    else if(chosenMid == 'standings'){
        SetS(1);
        if(chosenTop == 'times'){
            SetD(2);
        }
        else if(chosenTop == 'diffs'){
            SetT(2);
        }
    }
}

//last dropdown shows only remaining option, but this ensures no duplicates between mid and last dropdowns
function LastPriority({chosenLast}){
    if(chosenLast == 'diffs'){
        SetD(2);
    }
    else if(chosenLast == 'times'){
        SetT(2);
    }
    else if(chosenLast == 'standings'){
        SetS(2);
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

export {TopPriority, MidPriority, LastPriority};