const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

content = content.replace(/const timeParam = savedRestoreTimeRef\.current > 0 \? \`\?t=\\$\\{Math\.floor\(savedRestoreTimeRef\.current\)\\}\` : "";/g, 'const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
