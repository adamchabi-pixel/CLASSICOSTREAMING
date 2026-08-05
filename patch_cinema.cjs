const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const targetIframe = `<div className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <iframe`;
const replacementIframe = `<div className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center pt-[max(env(safe-area-inset-top),24px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <iframe`;

content = content.replace(targetIframe, replacementIframe);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
