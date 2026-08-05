const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `<h2 className="text-3xl font-bold text-white tracking-wider uppercase font-cinzel">Popular Movies</h2>`;
const replacement = `<h2 className="text-5xl md:text-6xl text-[#f4ecd8] drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature pl-2 md:pl-0 mt-4 md:mt-0">Movies</h2>`;
content = content.replace(target, replacement);

fs.writeFileSync('src/components/LibraryView.tsx', content);
