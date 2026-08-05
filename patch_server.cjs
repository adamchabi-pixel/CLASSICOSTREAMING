const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

const discoverRoute = `app.get("/api/discover", async (req, res) => {
  try {
    const { type, page, activePlatform, activeGenre, activeLanguage, activeYear } = req.query;
    let url = \`https://api.themoviedb.org/3/trending/\${type || 'movie'}/day?language=en-US&page=\${page || 1}\`;
    
    if (activePlatform || activeGenre || activeLanguage || activeYear) {
       url = \`https://api.themoviedb.org/3/discover/\${type || 'movie'}?language=en-US&page=\${page || 1}&watch_region=US\`;
       
       if (activeGenre === 'top_rated') {
           url += \`&sort_by=vote_average.desc&vote_count.gte=300\`;
       } else {
           url += \`&sort_by=popularity.desc\`;
       }
       
       if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
       if (activeGenre && activeGenre !== 'top_rated') url += \`&with_genres=\${activeGenre}\`;
       if (activeLanguage) url += \`&with_original_language=\${activeLanguage}\`;
       if (activeYear) {
           if (activeYear === '2010') {
               url += \`&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31\`;
           } else if (activeYear === '2000') {
               url += \`&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31\`;
           } else {
               url += \`&primary_release_date.gte=\${activeYear}-01-01&primary_release_date.lte=\${activeYear}-12-31\`;
           }
       }
    }
    
    const response = await fetch(url, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    
    if (!response.ok) throw new Error("TMDB fetch failed");
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

`;

serverTs = serverTs.replace('app.get("/api/trending",', discoverRoute + 'app.get("/api/trending",');
fs.writeFileSync('server.ts', serverTs);
