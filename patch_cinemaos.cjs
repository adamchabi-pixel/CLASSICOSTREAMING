const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// Block 1 (around line 848)
file = file.replace(
  `let iframeUrlVideasy = "";`,
  `let iframeUrlVideasy = "";\n            let iframeUrlCinemaos = "";`
);

file = file.replace(
  `iframeUrlVideasy = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;`,
  `iframeUrlVideasy = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;\n              iframeUrlCinemaos = \`https://cinemaos.live/watch/tv/\${cleanId}?s=\${season}&e=\${episode}\${timeParam}\`;`
);

file = file.replace(
  `iframeUrlVideasy = \`https://player.videasy.net/movie/\${cleanId}?color=FF9900&overlay=true\${timeParam}\`;`,
  `iframeUrlVideasy = \`https://player.videasy.net/movie/\${cleanId}?color=FF9900&overlay=true\${timeParam}\`;\n              iframeUrlCinemaos = \`https://cinemaos.live/watch/movie/\${cleanId}?dummy=1\${timeParam}\`;`
);

file = file.replace(
  `{ name: "Server 3", url: iframeUrlPeach }`,
  `{ name: "Server 3", url: iframeUrlPeach },\n              { name: "Server 4 (CinemaOS)", url: iframeUrlCinemaos }`
);

// Block 2 (around line 963)
file = file.replace(
  `let u1 = "", u2 = "", u3 = "";`,
  `let u1 = "", u2 = "", u3 = "", u4 = "";`
);

file = file.replace(
  `u3 = \`https://player.videasy.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;`,
  `u3 = \`https://player.videasy.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;\n                        u4 = \`https://cinemaos.live/watch/tv/\${itemData.ProviderIds.Tmdb}?s=\${itemData.ParentIndexNumber}&e=\${itemData.IndexNumber}\${timeParam}\`;`
);

file = file.replace(
  `u3 = \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}?color=FF9900&overlay=true\${timeParam}\`;`,
  `u3 = \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}?color=FF9900&overlay=true\${timeParam}\`;\n                        u4 = \`https://cinemaos.live/watch/movie/\${itemData.ProviderIds.Tmdb}?dummy=1\${timeParam}\`;`
);

file = file.replace(
  `{ name: "Server 3", url: u1 }`,
  `{ name: "Server 3", url: u1 },\n                      { name: "Server 4 (CinemaOS)", url: u4 }`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Patched CinemaPlayerView with CinemaOS Server 4");
