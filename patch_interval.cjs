const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(/if \(now - lastSaveTime > 5000\)/g, 'if (now - lastSaveTime > 1000)');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
