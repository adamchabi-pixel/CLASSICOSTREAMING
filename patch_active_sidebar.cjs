const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// For Genres
const targetActiveGenreNull = `              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveGenreNull = `              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveGenreNull, replacementActiveGenreNull);

const targetActiveGenreID = `                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveGenreID = `                      className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveGenreID, replacementActiveGenreID);

// For Languages
const targetActiveLangNull = `              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeLanguage === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveLangNull = `              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeLanguage === null ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveLangNull, replacementActiveLangNull);

const targetActiveLangID = `                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveLangID = `                      className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveLangID, replacementActiveLangID);

// For Years
const targetActiveYearNull = `              className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${activeYear === null ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveYearNull = `              className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${activeYear === null ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveYearNull, replacementActiveYearNull);

const targetActiveYearID = `                      className={\`relative flex items-center gap-2 px-3 py-2 rounded-none md:rounded-lg text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white md:bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}`;
const replacementActiveYearID = `                      className={\`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap \${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}\`}`;
content = content.replace(targetActiveYearID, replacementActiveYearID);

// Let's refine the golden line style
const goldenLineTarget = `bg-gradient-to-r from-transparent via-amber-400 to-transparent block`;
const goldenLineReplacement = `bg-gradient-to-r from-transparent via-amber-400 to-transparent block`; // I already replaced 'block md:hidden' with 'block'. Wait, let's just make it a clean amber-500 line? The user said "comme quand tes dans un onglet de la navbar". 

// The navbar active tab line looks like this:
// className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"

fs.writeFileSync('src/components/LibraryView.tsx', content);
