const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `<img src={p.logo} alt={p.name} className="w-8 h-8 object-cover rounded-full shadow-sm bg-black" />`;
const replacement = `<img src={p.logo} alt={p.name} className="w-6 h-6 object-contain" />`;
content = content.replace(target, replacement);

fs.writeFileSync('src/components/LibraryView.tsx', content);
