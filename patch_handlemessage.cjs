const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `                saved[pTmdbId].last_season_watched = pSeason;
                saved[pTmdbId].last_episode_watched = pEpisode;`;
const replacement1 = `                saved[pTmdbId].last_season_watched = pSeason;
                saved[pTmdbId].last_episode_watched = pEpisode;
                saved[pTmdbId].server_index = activeServerIndex;`;

content = content.replace(target1, replacement1);

const target2 = `            } else if (movieId) {
                saved[movieId] = { 
                  currentTime: currentTime, 
                  timestamp: Date.now(),
                  duration: durationValue
                };`;
const replacement2 = `            } else if (movieId) {
                saved[movieId] = { 
                  currentTime: currentTime, 
                  timestamp: Date.now(),
                  duration: durationValue,
                  server_index: activeServerIndex
                };`;

content = content.replace(target2, replacement2);

const target3 = `    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playbackInfo, movieId]);`;
const replacement3 = `    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playbackInfo, movieId, activeServerIndex]);`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("patched handlemessage");
