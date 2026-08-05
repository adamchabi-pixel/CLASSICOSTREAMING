const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `              {/* Platforms Band */}
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
                         <img src={p.logo} alt={p.name} className="w-6 h-6 object-contain" />
                         <span className="font-bold text-sm">{p.name}</span>
                     </button>
                 ))}
              </div>`;

const replacement = `              {/* Platforms Band */}
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

content = content.replace(target, replacement);

fs.writeFileSync('src/components/LibraryView.tsx', content);
