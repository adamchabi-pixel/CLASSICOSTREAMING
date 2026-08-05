const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetRender = `      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-[80px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"
    >
      {/* Sidebar Genres */}
      <div className="w-full md:w-36 xl:w-44 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[80px] md:max-h-[calc(100vh-100px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-2">`;

const replacementRender = `      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-8 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"
    >
      {/* Sidebar Genres */}
      <div className="w-full md:w-40 xl:w-48 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:sticky md:top-[20px] md:max-h-[calc(100vh-100px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-2">`;

content = content.replace(targetRender, replacementRender);
fs.writeFileSync('src/components/LibraryView.tsx', content);
