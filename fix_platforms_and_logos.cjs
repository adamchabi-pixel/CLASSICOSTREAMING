const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// Fix PLATFORMS to TMDB
const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://cdn.simpleicons.org/netflix/E50914" },
  { id: 1899, name: "Max", logo: "https://cdn.simpleicons.org/hbo/ffffff" },
  { id: 337, name: "Disney+", logo: "https://cdn.simpleicons.org/disneyplus/ffffff" },
  { id: 15, name: "Hulu", logo: "https://cdn.simpleicons.org/hulu/1ce783" },
  { id: 9, name: "Prime Video", logo: "https://cdn.simpleicons.org/primevideo/00A8E1" },
  { id: 350, name: "Apple TV+", logo: "https://cdn.simpleicons.org/appletv/ffffff" },
  { id: 531, name: "Paramount+", logo: "https://cdn.simpleicons.org/paramountplus/0064FF" }
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

const targetRender = `              {/* Platforms Band */}
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

const replacementRender = `              {/* Platforms Band */}
              <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 items-center w-full max-w-full justify-between">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`flex-1 min-w-[50px] max-w-[100px] sm:max-w-[120px] aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>`;

content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/components/LibraryView.tsx', content);
