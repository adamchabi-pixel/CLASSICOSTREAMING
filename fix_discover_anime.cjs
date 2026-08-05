const fs = require('fs');
let srvContent = fs.readFileSync('server.ts', 'utf8');

const target = `    if (data && data.results && type === "tv") {
        data.results = data.results.filter((r: any) => !r.genre_ids || !r.genre_ids.includes(16));
    }`;
const replacement = `    if (data && data.results) {
        data.results = data.results.filter((r: any) => !isAnimeOrAdult(r));
    }`;
srvContent = srvContent.replace(target, replacement);

fs.writeFileSync('server.ts', srvContent);
