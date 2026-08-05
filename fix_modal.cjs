const fs = require('fs');
let content = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');

content = content.replace('className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"', 'className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"');
content = content.replace('className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"', 'className="absolute top-16 md:top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"');

fs.writeFileSync('src/components/MovieModal.tsx', content);
