const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const helperStr = `const generateServers = (lang, isTv, tmdbId, season, episode, imdbId, timeParam) => {
  if (lang === "fr") {
    if (isTv && season && episode) {
      return [ { name: "FrEmbed", url: \`https://frembed.com/api/serie.php?id=\${tmdbId}&sa=\${season}&epi=\${episode}\`, stars: 3 } ];
    } else {
      return [ { name: "FrEmbed", url: \`https://frembed.com/api/film.php?id=\${tmdbId}\`, stars: 3 } ];
    }
  } else {
    if (isTv && season && episode) {
      return [
        { name: "CinemaOS", url: \`https://cinemaos.live/watch/tv/\${tmdbId}?season=\${season}&episode=\${episode}\${timeParam}\`, stars: 3 },
        { name: "Peachify", url: \`https://peachify.pro/embed/tv/\${tmdbId}/\${season}/\${episode}?accent=FF9900&servers=hide\${timeParam}\`, stars: 3 },
        { name: "VidSrc", url: \`https://vidsrc.sbs/embed/tv/\${tmdbId}/\${season}/\${episode}\`, stars: 3 },
        { name: "MultiEmbed VIP", url: \`https://multiembed.mov/directstream.php?video_id=\${tmdbId}&tmdb=1&s=\${season}&e=\${episode}\`, stars: 3 }
      ];
    } else {
      return [
        { name: "CinemaOS", url: \`https://cinemaos.live/watch/movie/\${tmdbId}?dummy=1\${timeParam}\`, stars: 3 },
        { name: "Peachify", url: \`https://peachify.pro/embed/movie/\${tmdbId}?accent=FF9900&servers=hide\${timeParam}\`, stars: 3 },
        { name: "VidSrc", url: \`https://vidsrc.sbs/embed/movie/\${tmdbId}\`, stars: 3 },
        { name: "MultiEmbed VIP", url: \`https://multiembed.mov/directstream.php?video_id=\${tmdbId}&tmdb=1\`, stars: 3 }
      ];
    }
  }
};
`;

// Insert the helper function at the top level, or inside the component.
// Let's just insert it outside the component at the top.
if (!content.includes('const generateServers')) {
  content = content.replace('export default function CinemaPlayerView', helperStr + '\nexport default function CinemaPlayerView');
}

// Now let's replace the three blocks manually.

// Block 1
const b1Start = '            let iframeUrlCinejoy = "";';
const b1End = '            setAvailableServers(newServers);';
if (content.includes(b1Start) && content.includes(b1End)) {
  let b1Index = content.indexOf(b1Start);
  let b1EndIndex = content.indexOf(b1End, b1Index) + b1End.length;
  content = content.substring(0, b1Index) +
            'const newServers = generateServers(language, isTv, cleanId, season, episode, imdbId, timeParam);\n            setAvailableServers(newServers);' +
            content.substring(b1EndIndex);
}

// Block 2
const b2Start = '                    let u1 = "", u2 = "", u3 = "", u4 = "";';
const b2End = '                    setAvailableServers(srvs);';
if (content.includes(b2Start) && content.includes(b2End)) {
  let b2Index = content.indexOf(b2Start);
  let b2EndIndex = content.indexOf(b2End, b2Index) + b2End.length;
  content = content.substring(0, b2Index) +
            'const srvs = generateServers(language, itemData.Type === "Episode", tmdbId, itemData.ParentIndexNumber, itemData.IndexNumber, imdbId, timeParam);\n                    setAvailableServers(srvs);' +
            content.substring(b2EndIndex);
}

// Block 3
const b3Start = '              let iframeUrlCinejoy = "";';
const b3End = '              ];'; // Wait, let's look for the newServers declaration
if (content.includes(b3Start)) {
  let b3Index = content.indexOf(b3Start);
  let b3EndIndex = content.indexOf('              ];', b3Index) + '              ];'.length;
  content = content.substring(0, b3Index) +
            'const newServers = generateServers(language, true, cleanId, season, episode, imdbId, timeParam);' +
            content.substring(b3EndIndex);
}

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("Replaced successfully!");
