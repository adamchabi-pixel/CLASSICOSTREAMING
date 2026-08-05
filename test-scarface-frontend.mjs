import fs from "fs";

async function run() {
    const res = await fetch(`http://localhost:3000/api/playback/e2fb5ddd828a899024cfba73f4d5b5c9`);
    const pb = await res.json();
    console.log(pb.subtitles.slice(0, 5));
}
run();
