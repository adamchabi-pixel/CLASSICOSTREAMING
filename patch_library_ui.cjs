const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetRender = `      {/* Sidebar Genres */}
      <div className="w-full md:w-48 xl:w-56 flex-shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar pb-4 md:pb-0 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4">`;

const replacementRender = `      {/* Sidebar Genres */}
      <div className="w-full md:w-40 xl:w-48 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-3">`;

content = content.replace(targetRender, replacementRender);

const targetButtons = `                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id)}
                         className={\`flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-2 hover:ring-white/30'}\`}
                         style={{ width: '56px', height: '56px' }}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>`;

const replacementButtons = `                 {PLATFORMS.map(p => (
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

content = content.replace(targetButtons, replacementButtons);
fs.writeFileSync('src/components/LibraryView.tsx', content);
