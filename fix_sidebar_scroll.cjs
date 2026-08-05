const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// 1. Remove the fixed height from the wrapper so it can scroll naturally with the page
const targetWrapper = `      className="w-full flex flex-col md:flex-row md:h-[calc(100vh-80px)] pt-4 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"`;
const replacementWrapper = `      className="w-full flex flex-col md:flex-row min-h-screen pt-[100px] pb-20 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"`;
content = content.replace(targetWrapper, replacementWrapper);

// 2. Make the sidebar sticky
const targetSidebar = `      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:h-full">`;
const replacementSidebar = `      {/* Sidebar Filters */}
      <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:sticky md:top-[100px] md:max-h-[calc(100vh-120px)]">`;
content = content.replace(targetSidebar, replacementSidebar);

// 3. Revert movies container to normal
const targetMovies = `<div className="flex-1 flex flex-col gap-8 w-full min-w-0 md:overflow-y-auto md:pr-4 md:pb-20 no-scrollbar">`;
const replacementMovies = `<div className="flex-1 flex flex-col gap-8 w-full min-w-0">`;
content = content.replace(targetMovies, replacementMovies);

fs.writeFileSync('src/components/LibraryView.tsx', content);
