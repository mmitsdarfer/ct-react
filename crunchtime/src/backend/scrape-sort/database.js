const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;

//write to league page based on previous sorts

export async function database(sorted, league, date){
    let leagueDate = new Date(Date.parse(date.replace(',',''))); //date scraped from espn.com, but temp so it doesn't change on page
    leagueDate = leagueDate.getFullYear() + '-' + (leagueDate.getMonth()+1) + '-' + leagueDate.getDate();

    let update = true;
    let id; //id of previous db entry

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

    async function dbFormat(){
        let jsonData = {};
        jsonData.table = [];
        let obj = {};
        for(let i = 0; i < sorted.length; i++){
            if(sorted[i] !== undefined){
                for(let j = 0; j < sorted[i].length; j++){
                    obj = {
                        team1: sorted[i][j].team1,
                        score1: sorted[i][j].score1,
                        logo1: sorted[i][j].logo1,
                        team2: sorted[i][j].team2,
                        score2: sorted[i][j].score2,
                        logo2: sorted[i][j].logo2,
                        progress: sorted[i][j].progress,
                        time: sorted[i][j].time,
                        network: sorted[i][j].network,
                        link: sorted[i][j].link
                    }
                    jsonData.table.push(obj);
                }
            }
            else{
                obj = {
                    team1: sorted[i].team1,
                    score1: sorted[i].score1,
                    team2: sorted[i].team2,
                    score2: sorted[i].score2,
                    progress: sorted[i].progress,
                    time: sorted[i].time,
                    network: sorted[i].network,
                    link: sorted[i].link
                }
                jsonData.table.push(obj);
            }      
        }
    
        let dbData = jsonData.table;
    
        const updateDb = async () => {
            await fetch(`${baseUrl}/${league}/${id}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                sorted: dbData, leagueDate
              })
            });
        }
        if(update){ 
            await updateDb();
        }
        else{
            await createDb();
        }
    }

    await loadLatest();    
    
    async function sendFinal(){
        dbFormat();
    }
    sendFinal();
}

export default database;

/*
Philadelphia Phillies
Baltimore Orioles
Cleveland Guardians
New York Yankees
Los Angeles Dodgers
Milwaukee Brewers
Atlanta Braves
Minnesota Twins
Boston Red Sox
Kansas City Royals
Houston Astros
St. Louis Cardinals
Seattle Mariners
New York Mets
Arizona Diamondbacks
Pittsburgh Pirates
San Diego Padres
Tampa Bay Rays
Detroit Tigers
San Francisco Giants
Cincinnati Reds
Chicago Cubs
Texas Rangers
Washington Nationals
Toronto Blue Jays
Los Angeles Angels
Oakland Athletics
Colorado Rockies
Miami Marlins
Chicago White Sox
*/