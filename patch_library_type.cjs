const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

// Update props interface
content = content.replace('const LibraryView = ({ onSelectMovie, onPlayMovie }: any) => {', 'const LibraryView = ({ onSelectMovie, onPlayMovie, type = "movie" }: { onSelectMovie: (m: any) => void; onPlayMovie: (m: any) => void; type?: "movie" | "tv" }) => {');

// Update API call
content = content.replace('url = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&watch_region=US`;', 'url = `https://api.themoviedb.org/3/discover/${type}?language=en-US&page=1&watch_region=US`;');
content = content.replace('url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=1`;', 'url = `https://api.themoviedb.org/3/trending/${type}/day?language=en-US&page=1`;');

// Also need to handle mapping, TV shows have `name` instead of `title`, and `first_air_date` instead of `release_date`.
const targetMapping = `const mapped = data.results.filter((r: any) => !r.adult).map((r: any) => {
                   return {
                       id: r.id.toString(),
                       title: r.title || r.name,
                       posterUrl: r.poster_path ? \`https://image.tmdb.org/t/p/w780\${r.poster_path}\` : "",
                       backdropUrl: r.backdrop_path ? \`https://image.tmdb.org/t/p/original\${r.backdrop_path}\` : "",
                       year: r.release_date ? parseInt(r.release_date.split("-")[0]) : undefined,
                       duration: "120 min", // Placeholder
                       rating: "PG-13", // Placeholder
                       score: r.vote_average ? Math.round(r.vote_average * 10) : undefined,
                       quality: "4K",
                       match: Math.round(Math.random() * 20 + 80),
                       genres: r.genre_ids.map((id: number) => GENRES.find(g => g.id === id)?.name).filter(Boolean),
                       description: r.overview
                   };
               });`;

const replacementMapping = `const mapped = data.results.filter((r: any) => !r.adult).map((r: any) => {
                   return {
                       id: r.id.toString(),
                       title: r.title || r.name,
                       posterUrl: r.poster_path ? \`https://image.tmdb.org/t/p/w780\${r.poster_path}\` : "",
                       backdropUrl: r.backdrop_path ? \`https://image.tmdb.org/t/p/original\${r.backdrop_path}\` : "",
                       year: r.release_date ? parseInt(r.release_date.split("-")[0]) : (r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : undefined),
                       duration: type === 'tv' ? "45 min/ep" : "120 min", // Placeholder
                       rating: "PG-13", // Placeholder
                       score: r.vote_average ? Math.round(r.vote_average * 10) : undefined,
                       quality: "4K",
                       match: Math.round(Math.random() * 20 + 80),
                       genres: r.genre_ids.map((id: number) => GENRES.find(g => g.id === id)?.name).filter(Boolean),
                       description: r.overview
                   };
               });`;

content = content.replace(targetMapping, replacementMapping);

// Update title
const targetTitle = `<div className="relative mb-6 mt-2 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-7xl md:text-[120px] font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-2 md:bottom-6 left-[45%] md:left-[280px] text-5xl md:text-7xl text-amber-500 font-signature drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] rotate-[-6deg]">
                     Movies
                 </span>
              </div>`;
const replacementTitle = `<div className="relative mb-6 mt-2 md:mt-0 pl-2 md:pl-0">
                 <h2 className="text-7xl md:text-[120px] font-black text-white/5 tracking-tighter uppercase font-cinzel leading-none select-none">
                     LIBRARY
                 </h2>
                 <span className="absolute bottom-2 md:bottom-6 left-[45%] md:left-[280px] text-5xl md:text-7xl text-amber-500 font-signature drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] rotate-[-6deg]">
                     {type === 'tv' ? 'Series' : 'Movies'}
                 </span>
              </div>`;
content = content.replace(targetTitle, replacementTitle);


// Update layout classes to allow independent scrolling
content = content.replace('className="w-full flex flex-col md:flex-row min-h-screen pt-[75px] pb-20 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8"', 'className="w-full flex flex-col md:flex-row h-screen pt-[75px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto gap-4 md:gap-8 overflow-hidden"');

// Fix sidebar height and remove sticky (since the parent is h-screen and hidden)
content = content.replace('className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 md:sticky md:top-[75px] md:max-h-[calc(100vh-95px)]"', 'className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 h-auto md:h-full"');

// Fix movies container scroll
content = content.replace('className="flex-1 flex flex-col gap-8 w-full min-w-0"', 'className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32"');

fs.writeFileSync('src/components/LibraryView.tsx', content);
