const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
content = content.replace('pt-[max(env(safe-area-inset-top),24px)]', 'pt-[max(env(safe-area-inset-top),44px)]');
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
