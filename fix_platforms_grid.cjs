const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetRender = `              {/* Platforms Band */}
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

const replacementRender = `              {/* Platforms Band */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 w-full max-w-full pb-2">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>`;

content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/components/LibraryView.tsx', content);
