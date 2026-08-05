const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `                saved[baseId].last_season_watched = season;
                saved[baseId].last_episode_watched = episode;`;
const replacement1 = `                saved[baseId].last_season_watched = season;
                saved[baseId].last_episode_watched = episode;
                saved[baseId].server_index = activeServerIndex;`;

content = content.replace(target1, replacement1);

const target2 = `              saved[movieId] = { 
                currentTime: video.currentTime, 
                timestamp: now,
                duration: video.duration || playbackInfo?.duration || 0
              };`;
const replacement2 = `              saved[movieId] = { 
                currentTime: video.currentTime, 
                timestamp: now,
                duration: video.duration || playbackInfo?.duration || 0,
                server_index: activeServerIndex
              };`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("patched timeupdate");
