const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `        const pages = [1, 2, 3];
        const fetchPage = async (page: number) => {
          const url = \`https://api.themoviedb.org/3/trending/all/day?language=en-US&page=\${page}\`;
          const response = await fetch(url, {
            headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
          });
          if (!response.ok) return [];
          const data = await response.json();
          return data.results || [];
        };
        const resultsByPage = await Promise.all(pages.map(fetchPage));
        const combinedResults = resultsByPage.flat();
        const validResults = combinedResults.filter((m: any) => (m.media_type === "movie" || m.media_type === "tv") && !isAnimeOrAdult(m));
        
        const results = validResults.slice(0, 60).map((m: any) => {`;

const replace1 = `        const response = await fetch('/api/trending');
        if (!response.ok) return;
        const data = await response.json();
        const results = (data.results || []).map((m: any) => {`;
file = file.replace(target1, replace1);

const target2 = `        const url = \`https://api.themoviedb.org/3/trending/all/day?language=en-US&page=1\`;
        const res = await fetch(url, { headers: { Authorization: \`Bearer \${tmdbToken}\`, Accept: "application/json" } });
        if (res.ok) {
          const m = await res.json();
          if (m.results) {`;

const replace2 = `        const res = await fetch('/api/trending');
        if (res.ok) {
          const m = await res.json();
          if (m.results) {`;
file = file.replace(target2, replace2);

fs.writeFileSync('src/App.tsx', file);
