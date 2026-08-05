const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetTitle = `<div className="relative mb-2 mt-4 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-6xl md:text-7xl font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-1 md:bottom-2 left-[30%] md:left-[140px] text-4xl md:text-6xl text-amber-500 font-signature drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rotate-[-4deg]">
                     Movies
                 </span>
              </div>`;

const replacementTitle = `<div className="relative mb-6 mt-2 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-7xl md:text-[120px] font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-2 md:bottom-6 left-[45%] md:left-[280px] text-5xl md:text-7xl text-amber-500 font-signature drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] rotate-[-6deg]">
                     Movies
                 </span>
              </div>`;
content = content.replace(targetTitle, replacementTitle);

fs.writeFileSync('src/components/LibraryView.tsx', content);
