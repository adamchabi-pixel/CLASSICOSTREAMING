const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
content = content.replace(
  '<div className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center">',
  '<div className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">'
);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("patched iframe padding");
