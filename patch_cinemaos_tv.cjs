const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(
  `iframeUrlCinemaos = \`https://cinemaos.live/watch/tv/\${cleanId}?s=\${season}&e=\${episode}\${timeParam}\`;`,
  `iframeUrlCinemaos = \`https://cinemaos.live/watch/tv/\${cleanId}?season=\${season}&episode=\${episode}\${timeParam}\`;`
);

file = file.replace(
  `u4 = \`https://cinemaos.live/watch/tv/\${itemData.ProviderIds.Tmdb}?s=\${itemData.ParentIndexNumber}&e=\${itemData.IndexNumber}\${timeParam}\`;`,
  `u4 = \`https://cinemaos.live/watch/tv/\${itemData.ProviderIds.Tmdb}?season=\${itemData.ParentIndexNumber}&episode=\${itemData.IndexNumber}\${timeParam}\`;`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Patched TV show URLs for CinemaOS");
