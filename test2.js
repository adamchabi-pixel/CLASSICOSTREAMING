const fs = require('fs');
const code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
const lines = code.split('\n');
const uIdx = lines.findIndex(l => l.includes('console.log("loader state:", {'));
if (uIdx !== -1) {
  lines.splice(uIdx, 1);
  fs.writeFileSync('src/components/CinemaPlayerView.tsx', lines.join('\n'));
}
