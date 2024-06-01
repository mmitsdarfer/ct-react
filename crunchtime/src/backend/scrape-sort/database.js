import fs from 'fs';
const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

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
                    logo1: data[i][j].logo1,
                    team2: data[i][j].team2,
                    score2: data[i][j].score2,
                    logo2: data[i][j].logo2,
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
    fs.writeFile('../json/' + league.toLowerCase()+'.json', JSON.stringify(jsonData), function(err){
        if(err) throw err;
    }); 
}

export async function database(sorted, league, date){
    let leagueDate = new Date(Date.parse(date.replace(',',''))); //date scraped from espn.com, but temp so it doesn't change on page
    leagueDate = leagueDate.getFullYear() + '-' + (leagueDate.getMonth()+1) + '-' + leagueDate.getDate();

    let update = true;
    let id; //id of previous db entry

    //READ
    const loadLatest = async () => {
        let results = await fetch(`${baseUrl}/${league}/latest`).then(resp => resp.json());
        if(results[0] === undefined){
            update = false;
            return;
        }
        let dbDate = new Date (Date.parse(results[0].leagueDate)); //date of most recent db entry
        dbDate = dbDate.getFullYear() + '-' + (dbDate.getMonth()+1) + '-' + dbDate.getDate();
        if(leagueDate === dbDate) {
            id = results[0]._id;
        }
        else update = false;  
    }

   const createDb = async () => {
        await fetch(`${baseUrl}/${league}`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sorted, leagueDate
            })
        }).then(resp => resp.json());
    }

    /*
    const deleteDb = async () => {
        await fetch(`${baseUrl}/${league}/${id}`, {
          method: "DELETE"
        })
    } 
    */

    const updateDb = async () => {
        await fetch(`${baseUrl}/${league}/${id}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sorted, leagueDate
          })
        });
    }

    await loadLatest();
    if(update){ 
        await updateDb();
    }
    else{
        await createDb();
    }
    
    async function sendFinal(){
        toJson(sorted, league, date);
    }
    sendFinal();
}

export default database;