const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// 1. Remove icons from filters
content = content.replace(/<Compass[^>]*\/>\s*/g, '');
content = content.replace(/<Star[^>]*\/>\s*/g, '');
content = content.replace(/<Globe[^>]*\/>\s*/g, '');
content = content.replace(/<Calendar[^>]*\/>\s*/g, '');
content = content.replace(/<IconComp[^>]*\/>\s*/g, '');

// 2. Reduce the top padding to bring it closer to the navbar
// Old: className="w-full flex flex-col md:flex-row h-screen pt-[50px] md:pt-[55px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-4 md:gap-8"
// New: className="w-full flex flex-col md:flex-row h-screen pt-[45px] md:pt-[50px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-4 md:gap-8"
content = content.replace('pt-[50px] md:pt-[55px]', 'pt-[45px] md:pt-[45px]');

// 3. Fix the platform icons to be square, remove object-contain, use object-cover
// Old: \`flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-video bg-[#0a0a0a] border border-white/5 relative rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center ...
// New: \`flex-shrink-0 w-16 sm:w-20 md:w-24 aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ...
// Also change the img to object-cover and full size.
const targetPlatformButton = `                      <button
                          key={p.id}
                          onClick={() => { setActivePlatform(p.id === activePlatform ? null : p.id); setPage(1); }}
                          className={\`flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-video bg-[#0a0a0a] border border-white/5 relative rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-[#1a1a1a]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100 hover:bg-[#1a1a1a]'}\`}
                          title={p.name}
                      >
                          <img src={p.logo} alt={p.name} className="w-[85%] h-[85%] object-contain" />
                      </button>`;
const replacementPlatformButton = `                      <button
                          key={p.id}
                          onClick={() => { setActivePlatform(p.id === activePlatform ? null : p.id); setPage(1); }}
                          className={\`flex-shrink-0 w-16 sm:w-20 md:w-24 aspect-square relative rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                          title={p.name}
                      >
                          <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                      </button>`;
content = content.replace(targetPlatformButton, replacementPlatformButton);

// 4. Also remove pt-2 from the h2 title
content = content.replace(' font-signature pl-2 md:pl-0 pt-2">', ' font-signature pl-2 md:pl-0">');

fs.writeFileSync('src/components/LibraryView.tsx', content);
