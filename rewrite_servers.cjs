const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

function createHelperStr(indent) {
  return `${indent}const generateServers = (lang, isTv, tmdbId, season, episode, imdbId, timeParam) => {
${indent}  if (lang === "fr") {
${indent}    if (isTv && season && episode) {
${indent}      return [ { name: "FrEmbed", url: \`https://frembed.com/api/serie.php?id=\${tmdbId}&sa=\${season}&epi=\${episode}\`, stars: 3 } ];
${indent}    } else {
${indent}      return [ { name: "FrEmbed", url: \`https://frembed.com/api/film.php?id=\${tmdbId}\`, stars: 3 } ];
${indent}    }
${indent}  } else {
${indent}    if (isTv && season && episode) {
${indent}      return [
${indent}        { name: "CinemaOS", url: \`https://cinemaos.live/watch/tv/\${tmdbId}?season=\${season}&episode=\${episode}\${timeParam}\`, stars: 3 },
${indent}        { name: "Peachify", url: \`https://peachify.pro/embed/tv/\${tmdbId}/\${season}/\${episode}?accent=FF9900&servers=hide\${timeParam}\`, stars: 3 },
${indent}        { name: "VidSrc", url: \`https://vidsrc.sbs/embed/tv/\${tmdbId}/\${season}/\${episode}\`, stars: 2 },
${indent}        { name: "MultiEmbed VIP", url: \`https://multiembed.mov/directstream.php?video_id=\${tmdbId}&tmdb=1&s=\${season}&e=\${episode}\`, stars: 3 }
${indent}      ];
${indent}    } else {
${indent}      return [
${indent}        { name: "CinemaOS", url: \`https://cinemaos.live/watch/movie/\${tmdbId}?dummy=1\${timeParam}\`, stars: 3 },
${indent}        { name: "Peachify", url: \`https://peachify.pro/embed/movie/\${tmdbId}?accent=FF9900&servers=hide\${timeParam}\`, stars: 3 },
${indent}        { name: "VidSrc", url: \`https://vidsrc.sbs/embed/movie/\${tmdbId}\`, stars: 2 },
${indent}        { name: "MultiEmbed VIP", url: \`https://multiembed.mov/directstream.php?video_id=\${tmdbId}&tmdb=1\`, stars: 3 }
${indent}      ];
${indent}    }
${indent}  }
${indent}};`;
}

// Block 1 (around 850)
const block1Regex = /let iframeUrlCinejoy = "";[\s\S]*?const newServers = \[[\s\S]*?\];\s*setAvailableServers\(newServers\);/m;
const block1Replace = `${createHelperStr('            ')}
            const newServers = generateServers(language, isTv, cleanId, season, episode, imdbId, timeParam);
            setAvailableServers(newServers);`;
content = content.replace(block1Regex, block1Replace);

// Block 2 (around 958)
const block2Regex = /let u1 = "", u2 = "", u3 = "", u4 = "";[\s\S]*?const srvs = \[[\s\S]*?\];\s*setAvailableServers\(srvs\);/m;
const block2Replace = `${createHelperStr('                    ')}
                    const srvs = generateServers(language, itemData.Type === "Episode", tmdbId, itemData.ParentIndexNumber, itemData.IndexNumber, imdbId, timeParam);
                    setAvailableServers(srvs);`;
content = content.replace(block2Regex, block2Replace);

// Block 3 (around 1122)
const block3Regex = /let iframeUrlCinejoy = "";[\s\S]*?const newServers = \[[\s\S]*?\];\s*setAvailableServers\(newServers\);/m;
// wait, in block 3 we don't have setAvailableServers? Let's double check.
