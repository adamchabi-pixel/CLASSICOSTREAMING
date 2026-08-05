const fs = require('fs');

let srvContent = fs.readFileSync('server.ts', 'utf8');

// replace the fetching part
const target = `const data = await response.json();`;
const replacement = `const data = await response.json();
    if (data && data.results && type === "tv") {
        data.results = data.results.filter((r: any) => !r.genre_ids || !r.genre_ids.includes(16));
    }`;
srvContent = srvContent.replace(target, replacement);

fs.writeFileSync('server.ts', srvContent);
