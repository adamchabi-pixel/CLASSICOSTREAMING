const fs = require('fs');
let content = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');

const target = `className="absolute top-16 md:top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"`;
const replacement = `className="absolute top-8 sm:top-10 md:top-6 left-4 sm:left-6 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/MovieModal.tsx', content);
