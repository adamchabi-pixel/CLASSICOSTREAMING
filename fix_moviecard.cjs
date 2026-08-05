const fs = require('fs');
let file = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

// 1. group -> group/card
file = file.replace('cursor-pointer group transition-all', 'cursor-pointer group/card transition-all');

// 2. remove glow & border hover
file = file.replace('shadow-lg group-hover:shadow-[0_0_25px_5px_var(--hover-glow)] group-hover:border-white/20 transition-all duration-300', 'shadow-lg transition-all duration-300');

// 3. remove img zoom
file = file.replace('group-hover:scale-[1.10]', '');

// 4. change remaining group-hover to group-hover/card
file = file.replace(/group-hover:/g, 'group-hover/card:');

fs.writeFileSync('src/components/MovieCard.tsx', file);
console.log("Fixed MovieCard.tsx");
