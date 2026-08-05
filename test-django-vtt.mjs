import fs from "fs";

async function run() {
    const url = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
    const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";
    const res = await fetch(`${url}/Users?api_key=${apiKey}`);
    const users = await res.json();
    const userId = users[0].Id;
    
    const itemsRes = await fetch(`${url}/Users/${userId}/Items?IncludeItemTypes=Movie&Recursive=true&Limit=100&api_key=${apiKey}`);
    const items = await itemsRes.json();
    
    const movie = items.Items.find(i => i.Name.toLowerCase().includes("django"));
    const movieId = movie.Id;
    
    const pbRes = await fetch(`${url}/Items/${movieId}/PlaybackInfo?api_key=${apiKey}&userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
    const pb = await pbRes.json();
    const source = pb.MediaSources[0];
    const subs = source.MediaStreams.filter(s => s.Type === 'Subtitle');
    const subIdx = subs[0].Index;
    console.log("Sub Index:", subIdx);
    
    const vttReq = await fetch(`http://localhost:3000/api/jellyfin/subtitles/${movieId}/${movieId}/${subIdx}.vtt`);
    const text = await vttReq.text();
    console.log(text.substring(0, 300));
}
run();
