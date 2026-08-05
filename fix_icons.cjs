const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace("<span>Popular</span>", "<Compass className={`w-4 h-4 ${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}`} />\\n              <span>Popular</span>");
content = content.replace("<span>Top Rated</span>", "<Star className={`w-4 h-4 ${activeGenre === 'top_rated' ? 'text-amber-500' : 'text-zinc-500'}`} />\\n              <span>Top Rated</span>");
content = content.replace("<span>{g.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\\n                      <span>{g.name}</span>");

content = content.replace("<span>All Languages</span>", "<Globe className={`w-4 h-4 ${activeLanguage === null ? 'text-amber-500' : 'text-zinc-500'}`} />\\n              <span>All Languages</span>");
content = content.replace("<span>{l.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\\n                      <span>{l.name}</span>");

content = content.replace("<span>All Years</span>", "<Calendar className={`w-4 h-4 ${activeYear === null ? 'text-amber-500' : 'text-zinc-500'}`} />\\n              <span>All Years</span>");
content = content.replace("<span>{y.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\\n                      <span>{y.name}</span>");

fs.writeFileSync('src/components/LibraryView.tsx', content);
