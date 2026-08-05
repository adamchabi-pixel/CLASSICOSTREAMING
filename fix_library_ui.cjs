const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetLayout = `    <motion.div
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

const replacementLayout = `    <motion.div
      key={"tab-collections-" + type}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col md:flex-row h-screen pt-[50px] md:pt-[55px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-4 md:gap-8"
    >
      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 h-auto md:h-full">`;

content = content.replace(targetLayout, replacementLayout);


const targetRightPaneTop = `      <div className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">
          <div className="flex flex-col gap-6">`;

const replacementRightPaneTop = `      <div className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">
          <div className="flex flex-col gap-4">
              {/* Title & Platforms Header */}
              <h2 className="text-5xl md:text-6xl text-[#f4ecd8] drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature pl-2 md:pl-0 pt-2">
                  {type === 'tv' ? 'Shows' : 'Movies'}
              </h2>
              
              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar w-full max-w-full pb-2">
                  {PLATFORMS.map(p => (
                      <button
                          key={p.id}
                          onClick={() => { setActivePlatform(p.id === activePlatform ? null : p.id); setPage(1); }}
                          className={\`flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-video bg-[#0a0a0a] border border-white/5 relative rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-[#1a1a1a]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100 hover:bg-[#1a1a1a]'}\`}
                          title={p.name}
                      >
                          <img src={p.logo} alt={p.name} className="w-[85%] h-[85%] object-contain" />
                      </button>
                  ))}
              </div>
          </div>`;

content = content.replace(targetRightPaneTop, replacementRightPaneTop);

fs.writeFileSync('src/components/LibraryView.tsx', content);
