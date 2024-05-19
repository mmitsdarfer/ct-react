import { useEffect, useState } from "react";
const baseUrl = "http://localhost:5050";

export default function Test(){
    let [leagueData, setLeagueData] = useState('');

    async function updateLeague(){
        await fetch(`${baseUrl}/posts`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'Test': 'This is a test!'
            })
        }).then(resp => resp.json())
        .then(console.log('Success'));
    }

    let [posts, setPosts] = useState([]);
    useEffect(() => {
        const loadPosts = async () => {
            let results = await fetch(`${baseUrl}/posts/latest`).then(resp => resp.json());
            setPosts(results);
        }
        loadPosts();
    }, []);
    console.log(posts[0].date)

    return(
        <div>
            <h1>DB Tests</h1>
            <button type="submit" onClick={() => updateLeague()}>Click to test</button>
            <h2>{posts[0].date}</h2>
        </div>
    )

}
