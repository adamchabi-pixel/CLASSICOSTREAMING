const fs = require('fs');
let content = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf8');

if (!content.includes('import { Download,')) {
    content = content.replace('import { Play, Plus, Info, X, Film, Search, History, Volume2, Maximize2, Settings, MessageSquare, List, ChevronDown, Monitor, CheckCircle, Smartphone } from "lucide-react";', 'import { Play, Plus, Info, X, Film, Search, History, Volume2, Maximize2, Settings, MessageSquare, List, ChevronDown, Monitor, CheckCircle, Smartphone, Download } from "lucide-react";');
    if (!content.includes('Download')) {
        content = content.replace('import {', 'import { Download, CheckCircle as CheckCircle2,');
    }
}

// Add state for watchedEpisodes
const stateHook = `
  const [watchedEpisodes, setWatchedEpisodes] = React.useState<Record<string, boolean>>({});
  
  React.useEffect(() => {
     try {
        const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
        const baseId = fullMovie.id.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "");
        if (saved[baseId] && saved[baseId].show_progress) {
            const we: Record<string, boolean> = {};
            for (const key in saved[baseId].show_progress) {
                // key is like 's1e1'
                if (saved[baseId].show_progress[key].progress && saved[baseId].show_progress[key].progress.watched > 0) {
                    we[key] = true;
                }
            }
            setWatchedEpisodes(we);
        }
     } catch(e) {}
  }, [fullMovie.id, isSeasonDropdownOpen, episodes]);

  const getDownloadUrl = () => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = tmdbId.replace('-tv', '');
    if (fullMovie.isTv) {
       const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
       const e = lastWatched ? lastWatched.episode : 1;
       return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
    }
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}\`;
  };

  const getEpisodeDownloadUrl = (s: number, e: number) => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = tmdbId.replace('-tv', '');
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
  };
`;

if (!content.includes('const getDownloadUrl')) {
    content = content.replace('const formatDuration', stateHook + '\n  const formatDuration');
}

// Add download button to top
const topDownloadButton = `
                <a href={getDownloadUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-[#BF953F]/20 hover:bg-[#BF953F]/40 text-[#FCF6BA] px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-[#BF953F]/50">
                  <Download className="w-4 h-4" />
                  {fullMovie.isTv ? (lastWatched ? \`DL S\${String(lastWatched.season).padStart(2, '0')}E\${String(lastWatched.episode).padStart(2, '0')}\` : \`DL S\${String(selectedSeason || 1).padStart(2, '0')}E01\`) : 'DL'}
                </a>
`;

content = content.replace(/(<button onClick=\{[^}]+?\} className="inline-flex items-center justify-center w-12 h-12[^>]+>\s*<Plus className="w-5 h-5[^>]+>\s*<\/button>)/, topDownloadButton + '\n$1');

// Add episode download button and watched text
// We need to change the map
const episodeReplacementRegex = /<h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">\s*\{ep\.episode_number\}\. \{ep\.name\}\s*<\/h4>/;
const episodeReplacementHtml = `
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        <span className="truncate">{ep.episode_number}. {ep.name}</span>
                        {watchedEpisodes[\`s\${selectedSeason}e\${ep.episode_number}\`] && (
                            <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded border border-green-500/30 flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3"/> Vu</span>
                        )}
                      </h4>
`;

content = content.replace(episodeReplacementRegex, episodeReplacementHtml);

// And the download button next to the episode
const epDescRegex = /(<p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-1">\s*\{ep\.overview \|\| "No description available\."\}\s*<\/p>)/;
const epDescReplacementHtml = `
                    $1
                  </div>
                  <div className="shrink-0 pl-2">
                    <a 
                      href={getEpisodeDownloadUrl(selectedSeason, ep.episode_number)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 text-amber-500 hover:text-white transition-all flex items-center justify-center border border-amber-500/20 hover:scale-110"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </a>
`;

content = content.replace(epDescRegex, epDescReplacementHtml);

// Remove the </div> from before it to avoid double closing
content = content.replace(/<\/div>\s*<\/button>/g, '</button>');
// Wait that might break it! Let's carefully inject it inside the button
fs.writeFileSync('src/components/MovieDetailView.tsx.mod', content);
