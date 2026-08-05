const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetImports = `import { motion } from "framer-motion";
import { SiNetflix, SiPrimevideo, SiAppletv, SiDisneyplus, SiHulu, SiHbo, SiParamountplus } from "@icons-pack/react-simple-icons";`;
const replacementImports = `import { motion } from "framer-motion";`;
content = content.replace(targetImports, replacementImports);

const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", icon: SiNetflix, color: "#E50914" },
  { id: 9, name: "Prime Video", icon: SiPrimevideo, color: "#00A8E1" },
  { id: 350, name: "Apple TV+", icon: SiAppletv, color: "#FFFFFF" },
  { id: 337, name: "Disney+", icon: SiDisneyplus, color: "#FFFFFF" },
  { id: 15, name: "Hulu", icon: SiHulu, color: "#1CE783" },
  { id: 1899, name: "Max", icon: SiHbo, color: "#FFFFFF" },
  { id: 531, name: "Paramount+", icon: SiParamountplus, color: "#0064FF" }
];`;
const replacementPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg" }
];`;
content = content.replace(targetPlatforms, replacementPlatforms);

const targetRender = `              {/* Platforms Band */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 w-full max-w-full pb-2">
                 {PLATFORMS.map(p => {
                     const Icon = p.icon;
                     return (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`w-full h-14 sm:h-16 relative rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 bg-[#111] \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         title={p.name}
                     >
                         <Icon color={p.color} size={40} />
                     </button>
                 )})}
              </div>`;
const replacementRender = `              {/* Platforms Band */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 w-full max-w-full pb-2">
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id === activePlatform ? null : p.id)}
                         className={\`w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}\`}
                         title={p.name}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>`;
content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/components/LibraryView.tsx', content);
