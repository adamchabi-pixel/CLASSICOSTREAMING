const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const b3Start = '            let iframeUrlCinejoy = "";';
const b3End = '            ];'; // The array end
if (content.indexOf(b3Start, 1000) !== -1) {
  let b3Index = content.indexOf(b3Start, 1000);
  let b3EndIndex = content.indexOf('            ];', b3Index) + '            ];'.length;
  content = content.substring(0, b3Index) +
            'const tvState = isTv ? JSON.parse(safeStorage.getItem("classico_tv_state") || "{}")[movieId] || {} : {};\n' +
            '            const season = tvState.season || 1;\n' +
            '            const episode = tvState.episode || 1;\n' +
            '            const newServers = generateServers(language, isTv, cleanId, season, episode, cleanId, timeParam);' +
            content.substring(b3EndIndex);
}

// Add the UI
const uiStart = '<h3 className="text-white font-sans font-semibold text-base flex items-center gap-2 tracking-wide">';
const uiReplace = '<div className="flex items-center justify-between"><h3 className="text-white font-sans font-semibold text-base flex items-center gap-2 tracking-wide"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>Sources Disponibles</h3><div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-white/10"><button onClick={() => { setLanguage("en"); setServerSelected(false); setIsMetadataLoaded(false); }} className={"w-8 h-6 rounded flex items-center justify-center transition-all " + (language === "en" ? "bg-white/20 ring-1 ring-white/30" : "opacity-50 hover:opacity-100")} title="Anglais"><img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-6 h-4 object-cover rounded-sm" /></button><button onClick={() => { setLanguage("fr"); setServerSelected(false); setIsMetadataLoaded(false); }} className={"w-8 h-6 rounded flex items-center justify-center transition-all " + (language === "fr" ? "bg-white/20 ring-1 ring-white/30" : "opacity-50 hover:opacity-100")} title="Français"><img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-6 h-4 object-cover rounded-sm" /></button></div></div>';

content = content.replace(/<h3 className="text-white font-sans font-semibold text-base flex items-center gap-2 tracking-wide">\s*<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"><\/div>\s*Sources Disponibles\s*<\/h3>/m, uiReplace);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("Replaced block 3 and added UI successfully!");
