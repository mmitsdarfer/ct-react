
export default function netLinks(nets, teams, progress, numGames, links){
    //make sure to log in first
    const tnt = 'https://www.tntdrama.com/watchtnt/east';
    const espn = 'https://www.espn.com/watch/';
    const nbcsp = 'https://www.nbc.com/live?brand=rsn-philadelphia&callsign=nbcsphiladelphia';
    const fox = 'https://www.foxsports.com/live';
    const abc = 'https://abc.com/watch-live/abc';
    const apple = 'https://tv.apple.com/us/room/apple-tv-major-league-baseball/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2';
    const mlbn = 'https://www.mlb.com/network/live?success=true';
    const tbs = 'https://www.tbs.com/watchtbs/east';
    const fs1 = 'https://www.foxsports.com/live/fs1';
    const locTeams = ['Flyers', 'Phillies', '76ers'];
    const channels = [];
    let notPlus = 0; //need non-ESPN+ links since I can get specific games just for ESPN+

    function localStream(i){
        for(let j = 0; j < locTeams.length; j++){
            if((locTeams[j] === teams[i*2] || locTeams[j] === teams[i*2+1]) && !(nets[j] === 'ABC' || nets[j] === 'TNT' || nets[j] === 'FOX' || nets[j] === 'Apple')){
                channels[i] = nbcsp;  
                nets[i] = 'NBCSP';
                notPlus++;
                return true;
            }
        }
        return false;
    }

    for(let i = 0; i < numGames; i++){
        if(progress[i] !== 'ended' && nets[i] !== undefined){
            if(i > 0){
                if(nets[i-1] == 'ESPN+' && nets[i] == 'Hulu'){
                    nets[i-1] = 'ESPN+/Hulu';
                    nets[i] = nets[i-1];
                }
            }
            if(nets[i] === 'TNT'){
                channels[i] = tnt;
            }
            else if(nets[i] === 'ESPN' || nets[i] === 'ESPN+' || nets[i] === 'NHLPP|ESPN+' || nets[i] === 'ESPN+/Hulu' || nets[i] === 'Hulu'){
                if(!localStream(i)){
                    if(links[i-notPlus] != null && links[i-notPlus] !== undefined) channels[i] = links[i-notPlus];
                    else channels[i] = espn;    
                }
            }
            else if(nets[i] === 'FOX'){
                channels[i] = fox;
                notPlus++;
            }
            else if(nets[i] === 'ABC'){
                channels[i] = abc;
                notPlus++;
            }
            else if(nets[i] === 'Apple TV+'){
                channels[i] = apple;
                notPlus++;
            }
            else if(nets[i] === 'MLBN'){
                if(!localStream(i)){
                    channels[i] = mlbn;
                    notPlus++;
                }
            }
            else if(nets[i] === 'TBS'){
                if(!localStream(i)){
                    channels[i] = tbs;
                    notPlus++;
                }
            }
            else if(nets[i] == 'FS1'){
                if(!localStream(i)){
                    channels[i] = fs1;
                    notPlus++;
                }
            }
            else{
                if(!localStream(i)){
                    channels[i] = '';
                    notPlus++;
                }
            }
        }
    }
    return channels;
}