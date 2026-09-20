const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
console.log(content.includes('const targetSeason'));
