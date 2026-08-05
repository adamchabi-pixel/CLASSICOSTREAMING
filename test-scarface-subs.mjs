import fs from "fs";

async function run() {
    const url = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
    const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";
    const res = await fetch(`${url}/Users?api_key=${apiKey}`);
    const users = await res.json();
    const userId = users[0].Id;
    
    const itemsRes = await fetch(`${url}/Users/${userId}/Items?IncludeItemTypes=Movie&Recursive=true&Limit=100&api_key=${apiKey}`);
    const items = await itemsRes.json();
    
    const movie = items.Items.find(i => i.Name.toLowerCase().includes("scarface"));
    const movieId = movie.Id;
    
    const pbRes = await fetch(`${url}/Items/${movieId}/PlaybackInfo?api_key=${apiKey}&userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            DeviceProfile: {
                MaxStreamingBitrate: 15000000,
                SubtitleProfiles: [
                    { Format: "vtt", Method: "External" },
                    { Format: "srt", Method: "External" }
                ]
            }
        })
    });
    const pb = await pbRes.json();
    const source = pb.MediaSources[0];
    const subs = source.MediaStreams.filter(s => s.Type === 'Subtitle');
    console.log(subs.map(s => `[${s.Index}] Codec: ${s.Codec}, Lang: ${s.Language}, Title: ${s.Title}, Default: ${s.IsDefault}`).join('\n'));
}
run();
