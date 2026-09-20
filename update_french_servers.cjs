const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

content = content.replace(
  /https:\/\/frembed\.com/g,
  'https://frembed.pro'
);

// Add a second French player as fallback
content = content.replace(
  'return [ { name: "Lecteur 1 (FrEmbed)", url: `https://frembed.pro/api/serie.php?id=${tmdbId}&sa=${season}&epi=${episode}`, stars: 3 } ];',
  'return [ \n        { name: "Lecteur 1 (FrEmbed)", url: `https://frembed.pro/api/serie.php?id=${tmdbId}&sa=${season}&epi=${episode}`, stars: 3 },\n        { name: "Lecteur 2 (VidSrcFr)", url: `https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`, stars: 2 }\n      ];'
);

content = content.replace(
  'return [ { name: "Lecteur 1 (FrEmbed)", url: `https://frembed.pro/api/film.php?id=${tmdbId}`, stars: 3 } ];',
  'return [ \n        { name: "Lecteur 1 (FrEmbed)", url: `https://frembed.pro/api/film.php?id=${tmdbId}`, stars: 3 },\n        { name: "Lecteur 2 (VidSrcFr)", url: `https://vidsrc.me/embed/movie/${tmdbId}`, stars: 2 }\n      ];'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
