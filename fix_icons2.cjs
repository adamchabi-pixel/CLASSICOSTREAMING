const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace(/<Compass[^>]*\/>\\n\s*<span>Popular<\/span>/g, "<span>Popular</span>");
content = content.replace(/<Star[^>]*\/>\\n\s*<span>Top Rated<\/span>/g, "<span>Top Rated</span>");
content = content.replace(/<IconComp[^>]*\/>\\n\s*<span>\{g.name\}<\/span>/g, "<span>{g.name}</span>");
content = content.replace(/<Globe[^>]*\/>\\n\s*<span>All Languages<\/span>/g, "<span>All Languages</span>");
content = content.replace(/<IconComp[^>]*\/>\\n\s*<span>\{l.name\}<\/span>/g, "<span>{l.name}</span>");
content = content.replace(/<Calendar[^>]*\/>\\n\s*<span>All Years<\/span>/g, "<span>All Years</span>");
content = content.replace(/<IconComp[^>]*\/>\\n\s*<span>\{y.name\}<\/span>/g, "<span>{y.name}</span>");

content = content.replace("<span>Popular</span>", "<Compass className={`w-4 h-4 ${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}`} />\n              <span>Popular</span>");
content = content.replace("<span>Top Rated</span>", "<Star className={`w-4 h-4 ${activeGenre === 'top_rated' ? 'text-amber-500' : 'text-zinc-500'}`} />\n              <span>Top Rated</span>");
content = content.replace("<span>{g.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\n                      <span>{g.name}</span>");

content = content.replace("<span>All Languages</span>", "<Globe className={`w-4 h-4 ${activeLanguage === null ? 'text-amber-500' : 'text-zinc-500'}`} />\n              <span>All Languages</span>");
content = content.replace("<span>{l.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\n                      <span>{l.name}</span>");

content = content.replace("<span>All Years</span>", "<Calendar className={`w-4 h-4 ${activeYear === null ? 'text-amber-500' : 'text-zinc-500'}`} />\n              <span>All Years</span>");
content = content.replace("<span>{y.name}</span>", "<IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />\n                      <span>{y.name}</span>");

fs.writeFileSync('src/components/LibraryView.tsx', content);
