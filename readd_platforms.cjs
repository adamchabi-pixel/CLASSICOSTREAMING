const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `      <div className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">
          {/* Grid */}`;

const replacement = `      <div className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">
          <div className="flex flex-col gap-4">
              {/* Title & Platforms Header */}
              <h2 className="text-5xl md:text-6xl text-[#f4ecd8] drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature pl-2 md:pl-0">
                  {type === 'tv' ? 'Shows' : 'Movies'}
              </h2>
              
              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar w-full max-w-full pb-2">
                  {PLATFORMS.map(p => (
                      <button
                          key={p.id}
                          onClick={() => { setActivePlatform(p.id === activePlatform ? null : p.id); setPage(1); }}
                          className={\`flex-shrink-0 w-16 sm:w-20 md:w-24 aspect-square relative rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                          title={p.name}
                      >
                          <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                  ))}
              </div>
          </div>
          {/* Grid */}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/LibraryView.tsx', content);
