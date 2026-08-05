const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetState = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);`;
const replacementState = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | string | null>(null);`;
content = content.replace(targetState, replacementState);

const targetFetch = `        if (activePlatform || activeGenre || activeLanguage || activeYear) {
           url = \`https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&sort_by=popularity.desc&watch_region=US\`;
           if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
           if (activeGenre) url += \`&with_genres=\${activeGenre}\`;`;
const replacementFetch = `        if (activePlatform !== null || activeGenre !== null || activeLanguage !== null || activeYear !== null) {
           url = \`https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&watch_region=US\`;
           
           if (activeGenre === 'top_rated') {
               url += \`&sort_by=vote_average.desc&vote_count.gte=300\`;
           } else {
               url += \`&sort_by=popularity.desc\`;
           }
           
           if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
           if (activeGenre && activeGenre !== 'top_rated') url += \`&with_genres=\${activeGenre}\`;`;
content = content.replace(targetFetch, replacementFetch);

const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;
const replacementPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { id: 1899, name: "Max", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg" },
  { id: 337, name: "Disney+", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" },
  { id: 15, name: "Hulu", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg" },
  { id: 9, name: "Prime Video", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" },
  { id: 350, name: "Apple TV+", logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg" },
  { id: 531, name: "Paramount+", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg" }
];`;
content = content.replace(targetPlatforms, replacementPlatforms);

const targetSidebarDiv = `<div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4">`;
const replacementSidebarDiv = `<div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)]">`;
content = content.replace(targetSidebarDiv, replacementSidebarDiv);

const targetSidebarGenres = `          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-2 mb-1 hidden md:block px-3">Genres</div>
          <button
              onClick={() => setActiveGenre(null)}
              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}
          >
              <Target className={\`w-4 h-4 \${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>All Genres</span>
              {activeGenre === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>
          {GENRES.map(g => {`;

const replacementSidebarGenres = `          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-2 mb-1 hidden md:block px-3">Categories</div>
          <button
              onClick={() => setActiveGenre(null)}
              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}
          >
              <Compass className={\`w-4 h-4 \${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>Popular</span>
              {activeGenre === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>
          <button
              onClick={() => setActiveGenre('top_rated')}
              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeGenre === 'top_rated' ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}
          >
              <Star className={\`w-4 h-4 \${activeGenre === 'top_rated' ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>Top Rated</span>
              {activeGenre === 'top_rated' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-3" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Genres</div>
          
          {GENRES.map(g => {`;
content = content.replace(targetSidebarGenres, replacementSidebarGenres);

const targetPlatformsUI = `              {/* Platforms Band */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2 w-full">
                 <button 
                     onClick={() => setActivePlatform(null)}
                     className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all h-[70px] \${activePlatform === null ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800/50'}\`}
                 >
                     <span className="text-xs uppercase tracking-wider">All</span>
                 </button>
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id)}
                         className={\`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all h-[70px] \${activePlatform === p.id ? 'bg-zinc-800 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/50'}\`}
                     >
                         <img src={p.logo} alt={p.name} className="w-8 h-8 object-contain filter drop-shadow-md" />
                         <span className="font-bold text-[10px] uppercase tracking-wider">{p.name}</span>
                     </button>
                 ))}
              </div>`;

const replacementPlatformsUI = `              {/* Platforms Band */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 w-full">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`flex flex-col items-center justify-center p-3 rounded-xl transition-all h-[70px] \${activePlatform === p.id ? 'bg-zinc-800 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-10 h-10 object-contain filter drop-shadow-md opacity-90 hover:opacity-100" />
                     </button>
                 ))}
              </div>`;
content = content.replace(targetPlatformsUI, replacementPlatformsUI);

fs.writeFileSync('src/components/LibraryView.tsx', content);
