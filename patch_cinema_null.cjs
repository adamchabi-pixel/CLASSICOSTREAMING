const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(
  /const saved = JSON\.parse\(savedStr\);/g,
  `const saved = JSON.parse(savedStr) || {};`
);

// Also in App.tsx just to be safe
let appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace(
  /const parsed = JSON\.parse\(savedProgress\);/g,
  `const parsed = JSON.parse(savedProgress) || {};`
);
fs.writeFileSync('src/App.tsx', appFile);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
