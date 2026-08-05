const fs = require('fs');
let content = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');

content = content.replace('className="fixed inset-0 z-50 flex items-center justify-center', 'className="fixed inset-0 z-[10000] flex items-center justify-center');

fs.writeFileSync('src/components/MovieModal.tsx', content);
