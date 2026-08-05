const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// 1. Update imports
const importTarget = `import { Search, Film as FilmIcon } from "lucide-react";`;
const importReplacement = `import { Search, Film as FilmIcon, Target, Compass, Sparkles, Smile, Shield, Video, Activity, Users, Wand2, Landmark, Ghost, Heart, Rocket, Eye, Star } from "lucide-react";`;
content = content.replace(importTarget, importReplacement);

// 2. Update GENRES
const genresTarget = `const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10749, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];`;

const genresReplacement = `const GENRES = [
  { id: 28, name: "Action", icon: Target },
  { id: 12, name: "Adventure", icon: Compass },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 14, name: "Fantasy", icon: Wand2 },
  { id: 36, name: "History", icon: Landmark },
  { id: 27, name: "Horror", icon: Ghost },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10749, name: "Romance", icon: Heart },
  { id: 878, name: "Sci-Fi", icon: Rocket },
  { id: 53, name: "Thriller", icon: Eye },
  { id: 10752, name: "War", icon: Target },
  { id: 37, name: "Western", icon: Star }
];`;
content = content.replace(genresTarget, genresReplacement);

// 3. Update the container pt and sidebar styles
const renderTarget1 = `      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-[90px] px-4 sm:px-8 max-w-[2000px] mx-auto gap-6 sm:gap-10"
    >
      {/* Sidebar Genres */}
      <div className="w-full md:w-40 xl:w-48 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-3">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-2">Genres</div>
          <button
              onClick={() => setActiveGenre(null)}
              className={\`px-4 py-2.5 text-left rounded-xl text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              All Genres
          </button>
          {GENRES.map(g => (
              <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id)}
                  className={\`px-4 py-2.5 text-left rounded-xl text-sm font-medium transition-all whitespace-nowrap \${activeGenre === g.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
              >
                  {g.name}
              </button>
          ))}
      </div>`;

const renderReplacement1 = `      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-[80px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"
    >
      {/* Sidebar Genres */}
      <div className="w-full md:w-36 xl:w-44 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[80px] md:max-h-[calc(100vh-100px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-3">Genres</div>
          
          <button
              onClick={() => setActiveGenre(null)}
              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              <Target className={\`w-4 h-4 \${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>All Genres</span>
              {activeGenre === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
          </button>
          {GENRES.map(g => {
              const IconComp = g.icon;
              const isActive = activeGenre === g.id;
              return (
                  <button
                      key={g.id}
                      onClick={() => setActiveGenre(g.id)}
                      className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
                  >
                      <IconComp className={\`w-4 h-4 \${isActive ? 'text-amber-500' : 'text-zinc-500'}\`} />
                      <span>{g.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
                  </button>
              );
          })}
      </div>`;

content = content.replace(renderTarget1, renderReplacement1);

// 4. Update Platforms band
const platformTarget = `              {/* Platforms Band */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center">
                 <button 
                     onClick={() => setActivePlatform(null)}
                     className={\`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all \${activePlatform === null ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 text-white hover:bg-zinc-800'}\`}
                 >
                     All
                 </button>
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id)}
                         className={\`flex-shrink-0 relative rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20'}\`}
                         style={{ width: '50px', height: '50px' }}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-contain bg-zinc-900" />
                     </button>
                 ))}
              </div>`;

const platformReplacement = `              {/* Platforms Band */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 items-center w-full">
                 <button 
                     onClick={() => setActivePlatform(null)}
                     className={\`flex items-center justify-center px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex-shrink-0 h-[60px] \${activePlatform === null ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 text-white hover:bg-zinc-800'}\`}
                 >
                     All Platforms
                 </button>
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id)}
                         className={\`flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all flex-shrink-0 h-[60px] \${activePlatform === p.id ? 'bg-zinc-800 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}
                     >
                         <img src={p.logo} alt={p.name} className="w-8 h-8 object-cover rounded-full shadow-sm bg-black" />
                         <span className="font-bold text-sm">{p.name}</span>
                     </button>
                 ))}
              </div>`;

content = content.replace(platformTarget, platformReplacement);
fs.writeFileSync('src/components/LibraryView.tsx', content);
