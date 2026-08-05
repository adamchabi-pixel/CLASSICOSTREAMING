const fs = require('fs');

// Fix LibraryView.tsx
let libContent = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');
libContent = libContent.replace(/id: String\(r\.id\),/, 'id: (type === "tv" || r.media_type === "tv") ? String(r.id) + "-tv" : String(r.id),');
libContent = libContent.replace(/isTv: false,/, 'isTv: type === "tv" || r.media_type === "tv",');
fs.writeFileSync('src/components/LibraryView.tsx', libContent);

// Fix server.ts discover API
let srvContent = fs.readFileSync('server.ts', 'utf8');
if (!srvContent.includes('if (type === "tv") url += `&without_genres=16`;')) {
    srvContent = srvContent.replace(/if \(activeYear\) \{/g, 'if (type === "tv") url += `&without_genres=16`;\n       if (activeYear) {');
}
// Also for the trending endpoint
if (!srvContent.includes('?language=en-US&page=${page || 1}&without_genres=16`')) {
    srvContent = srvContent.replace(/const \{ type, page, activePlatform, activeGenre, activeLanguage, activeYear \} = req\.query;\n    let url = \`https:\/\/api\.themoviedb\.org\/3\/trending\/\$\{type \|\| 'movie'\}\/day\?language=en-US&page=\$\{page \|\| 1\}\`;/g, 'const { type, page, activePlatform, activeGenre, activeLanguage, activeYear } = req.query;\n    let url = `https://api.themoviedb.org/3/trending/${type || \'movie\'}/day?language=en-US&page=${page || 1}`;\n    if (type === "tv") url += "&without_genres=16";');
}
fs.writeFileSync('server.ts', srvContent);
