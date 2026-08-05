const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// 1. Add page & totalPages states
const targetStates = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);`;
const replacementStates = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);`;
content = content.replace(targetStates, replacementStates);

// 2. Add dependencies and update URL
content = content.replace('let url = `https://api.themoviedb.org/3/trending/${type}/day?language=en-US&page=1`;', 'let url = `https://api.themoviedb.org/3/trending/${type}/day?language=en-US&page=${page}`;');
content = content.replace('url = `https://api.themoviedb.org/3/discover/${type}?language=en-US&page=1&watch_region=US`;', 'url = `https://api.themoviedb.org/3/discover/${type}?language=en-US&page=${page}&watch_region=US`;');
content = content.replace('}, [activePlatform, activeGenre, activeLanguage, activeYear]);', '}, [activePlatform, activeGenre, activeLanguage, activeYear, type, page]);');

// 3. Update setMovies and setTotalPages
const targetRes = `               setMovies(mapped);
           }`;
const replacementRes = `               setMovies(mapped);
               setTotalPages(Math.min(data.total_pages || 1, 500));
           }`;
content = content.replace(targetRes, replacementRes);

// 4. Update the layout
const targetLayout = `    <motion.div
      key="tab-collections"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col md:flex-row h-screen pt-[60px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8 overflow-hidden"
    >
      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 h-auto md:h-full">`;
      
const replacementLayout = `    <motion.div
      key={"tab-collections-" + type}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col h-screen pt-[60px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-4 md:gap-6"
    >
      {/* Title & Platforms Header */}
      <div className="flex flex-col gap-4 flex-shrink-0 mt-4 md:mt-0">
          <h2 className="text-5xl md:text-6xl text-[#f4ecd8] drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature pl-2 md:pl-0">
              {type === 'tv' ? 'Shows' : 'Movies'}
          </h2>
          
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar w-full max-w-full pb-2">
              {PLATFORMS.map(p => (
                  <button
                      key={p.id}
                      onClick={() => { setActivePlatform(p.id === activePlatform ? null : p.id); setPage(1); }}
                      className={\`flex-shrink-0 w-24 sm:w-32 aspect-video relative rounded-xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                      title={p.name}
                  >
                      <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden pb-16">
      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 h-auto md:h-full">`;
      
content = content.replace(targetLayout, replacementLayout);

// 5. Replace setActiveX calls to also reset page
content = content.replace(/onClick=\{\(\) \=\> setActiveGenre\(null\)\}/g, "onClick={() => { setActiveGenre(null); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveGenre\('top_rated'\)\}/g, "onClick={() => { setActiveGenre('top_rated'); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveGenre\(g\.id\)\}/g, "onClick={() => { setActiveGenre(g.id); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveLanguage\(null\)\}/g, "onClick={() => { setActiveLanguage(null); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveLanguage\(l\.id\)\}/g, "onClick={() => { setActiveLanguage(l.id); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveYear\(null\)\}/g, "onClick={() => { setActiveYear(null); setPage(1); }}");
content = content.replace(/onClick=\{\(\) \=\> setActiveYear\(y\.id\)\}/g, "onClick={() => { setActiveYear(y.id); setPage(1); }}");

// 6. Remove the old big title and platform band from the middle
const targetMiddle = `          <div className="flex flex-col gap-6">
              <div className="relative mb-6 mt-2 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-7xl md:text-[120px] font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-2 md:bottom-6 left-[45%] md:left-[280px] text-5xl md:text-7xl text-amber-500 font-signature drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] rotate-[-6deg]">
                     {type === 'tv' ? 'Shows' : 'Movies'}
                 </span>
              </div>
              
              {/* Platforms Band */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 w-full max-w-full pb-2">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`w-full aspect-video relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>
          </div>`;
content = content.replace(targetMiddle, "");

// 7. Add Pagination at the bottom, and close the new <div> wrapper
const targetBottom = `             )}
      </div>
    </motion.div>`;
const replacementBottom = `             )}
             
             {!loading && movies.length > 0 && totalPages > 1 && (
                 <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                     <button 
                         onClick={() => setPage(p => Math.max(1, p - 1))} 
                         disabled={page === 1} 
                         className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                     >
                         Previous
                     </button>
                     <span className="text-zinc-500 font-mono text-sm tracking-wider">
                         PAGE <span className="text-amber-500 font-bold">{page}</span> OF {totalPages}
                     </span>
                     <button 
                         onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                         disabled={page === totalPages} 
                         className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                     >
                         Next
                     </button>
                 </div>
             )}
      </div>
      </div>
    </motion.div>`;
content = content.replace(targetBottom, replacementBottom);

fs.writeFileSync('src/components/LibraryView.tsx', content);
