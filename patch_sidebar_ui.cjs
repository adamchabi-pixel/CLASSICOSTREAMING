const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const sidebarTarget = `      {/* Sidebar Genres */}
      <div className="w-full md:w-40 xl:w-48 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[80px] md:max-h-[calc(100vh-100px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-3">Genres</div>
          
          <button
              onClick={() => setActiveGenre(null)}
              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              <Target className={\`w-4 h-4 \${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>All Genres</span>
              {activeGenre === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
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
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
                  </button>
              );
          })}
      </div>`;

const sidebarReplacement = `      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-3">Filters</div>
          
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-2 mb-1 hidden md:block px-3">Genres</div>
          <button
              onClick={() => setActiveGenre(null)}
              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
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
                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
                  >
                      <IconComp className={\`w-4 h-4 \${isActive ? 'text-amber-500' : 'text-zinc-500'}\`} />
                      <span>{g.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
                  </button>
              );
          })}

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-4" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Languages</div>
          
          <button
              onClick={() => setActiveLanguage(null)}
              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeLanguage === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              <Globe className={\`w-4 h-4 \${activeLanguage === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>All Languages</span>
              {activeLanguage === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
          </button>
          {LANGUAGES.map(l => {
              const IconComp = l.icon;
              const isActive = activeLanguage === l.id;
              return (
                  <button
                      key={l.id}
                      onClick={() => setActiveLanguage(l.id)}
                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
                  >
                      <IconComp className={\`w-4 h-4 \${isActive ? 'text-amber-500' : 'text-zinc-500'}\`} />
                      <span>{l.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
                  </button>
              );
          })}

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-4" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Release Years</div>
          
          <button
              onClick={() => setActiveYear(null)}
              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeYear === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              <Calendar className={\`w-4 h-4 \${activeYear === null ? 'text-amber-500' : 'text-zinc-500'}\`} />
              <span>All Years</span>
              {activeYear === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
          </button>
          {YEARS.map(y => {
              const IconComp = y.icon;
              const isActive = activeYear === y.id;
              return (
                  <button
                      key={y.id}
                      onClick={() => setActiveYear(y.id)}
                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
                  >
                      <IconComp className={\`w-4 h-4 \${isActive ? 'text-amber-500' : 'text-zinc-500'}\`} />
                      <span>{y.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block md:hidden" />}
                  </button>
              );
          })}
      </div>`;

content = content.replace(sidebarTarget, sidebarReplacement);

fs.writeFileSync('src/components/LibraryView.tsx', content);
