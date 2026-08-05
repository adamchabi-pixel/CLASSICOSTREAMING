const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// Update pt and sticky top
content = content.replace('className="w-full flex flex-col md:flex-row min-h-screen pt-[100px] pb-20 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"', 'className="w-full flex flex-col md:flex-row min-h-screen pt-[75px] pb-20 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"');
content = content.replace('md:sticky md:top-[100px] md:max-h-[calc(100vh-120px)]', 'md:sticky md:top-[75px] md:max-h-[calc(100vh-95px)]');

// Update title
const targetTitle = `<h2 className="text-5xl md:text-6xl text-[#f4ecd8] drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature pl-2 md:pl-0 mt-4 md:mt-0">Movies</h2>`;
const replacementTitle = `<div className="relative mb-2 mt-4 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-6xl md:text-7xl font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-1 md:bottom-2 left-[30%] md:left-[140px] text-4xl md:text-6xl text-amber-500 font-signature drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rotate-[-4deg]">
                     Movies
                 </span>
              </div>`;
content = content.replace(targetTitle, replacementTitle);

fs.writeFileSync('src/components/LibraryView.tsx', content);
