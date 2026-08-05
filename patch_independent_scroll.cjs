const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// 1. Update the motion.div wrapper
const targetWrapper = `      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-4 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"`;
const replacementWrapper = `      className="w-full flex flex-col md:flex-row md:h-[calc(100vh-80px)] pt-4 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"`;
content = content.replace(targetWrapper, replacementWrapper);

// 2. Update the sidebar container
const targetSidebar = `<div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)]">`;
const replacementSidebar = `<div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:h-full">`;
content = content.replace(targetSidebar, replacementSidebar);

// 3. Update the movies list container
const targetMovies = `<div className="flex-1 flex flex-col gap-8 w-full min-w-0">`;
const replacementMovies = `<div className="flex-1 flex flex-col gap-8 w-full min-w-0 md:overflow-y-auto md:pr-4 md:pb-20 no-scrollbar">`;
content = content.replace(targetMovies, replacementMovies);

// 4. Update the Platforms to use TMDB logos and flex row (horizontal bar)
const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { id: 1899, name: "Max", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg" },
  { id: 337, name: "Disney+", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" },
  { id: 15, name: "Hulu", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg" },
  { id: 9, name: "Prime Video", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" },
  { id: 350, name: "Apple TV+", logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg" },
  { id: 531, name: "Paramount+", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg" }
];`;

const replacementPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;
content = content.replace(targetPlatforms, replacementPlatforms);

// 5. Update the Platforms rendering (horizontal bar, no names, no 'All')
const targetPlatformsRender = `              {/* Platforms Band */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 w-full">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`flex flex-col items-center justify-center p-3 rounded-xl transition-all h-[50px] \${activePlatform === p.id ? 'bg-zinc-800 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-10 h-10 object-contain filter drop-shadow-md opacity-90 hover:opacity-100" />
                     </button>
                 ))}
              </div>`;

const replacementPlatformsRender = `              {/* Platforms Band */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center w-full max-w-full">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`flex-shrink-0 relative rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         style={{ width: '60px', height: '60px' }}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>`;
content = content.replace(targetPlatformsRender, replacementPlatformsRender);

fs.writeFileSync('src/components/LibraryView.tsx', content);
