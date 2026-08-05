const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `        if (event.data.type === 'PLAYER_EVENT' && event.data.data.currentTime !== undefined) {
            currentTime = event.data.data.currentTime;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        } else if (event.data.type === 'MEDIA_DATA' && event.data.data.watched !== undefined) {
            currentTime = event.data.data.watched;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        }`;

const replacement1 = `        if (event.data.type === 'PLAYER_EVENT' && event.data.data && event.data.data.currentTime !== undefined) {
            currentTime = event.data.data.currentTime;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        } else if (event.data.type === 'MEDIA_DATA' && event.data.data && event.data.data.watched !== undefined) {
            currentTime = event.data.data.watched;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        }`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log('done nulls cinema');
