const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace('className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-3">Filters</div>', 'className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 hidden md:block px-3">Filters</div>');
content = content.replace('className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-2 mb-1 hidden md:block px-3">Categories</div>', 'className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Categories</div>');
content = content.replace('className="w-full flex flex-col md:flex-row h-screen pt-[45px] md:pt-[45px]', 'className="w-full flex flex-col md:flex-row h-screen pt-[48px] md:pt-[48px]');

fs.writeFileSync('src/components/LibraryView.tsx', content);
