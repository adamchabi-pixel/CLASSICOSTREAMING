const fs = require('fs');
let file = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetUrlLogic = `        let url = \`https://api.themoviedb.org/3/trending/\${type || 'movie'}/day?language=en-US&page=\${page || 1}\`;
        if (type === "tv") url += "&without_genres=16";
        
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
           if (type === "tv") url += \`&without_genres=16\`;
           if (activeYear) {
               const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
               if (activeYear === 2010) {
                   url += \`&\${dateField}.gte=2010-01-01&\${dateField}.lte=2019-12-31\`;
               } else if (activeYear === 2000) {
                   url += \`&\${dateField}.gte=2000-01-01&\${dateField}.lte=2009-12-31\`;
               } else if (activeYear === 1990) {
                   url += \`&\${dateField}.gte=1990-01-01&\${dateField}.lte=1999-12-31\`;
               } else if (activeYear === 1980) {
                   url += \`&\${dateField}.gte=1980-01-01&\${dateField}.lte=1989-12-31\`;
               } else {
                   url += \`&\${dateField}.gte=\${activeYear}-01-01&\${dateField}.lte=\${activeYear}-12-31\`;
               }
           }
        }
        
        const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
        const res = await fetch(url, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
        });`;

const replacement = `        let queryParams = new URLSearchParams({
            type: type || 'movie',
            page: (page || 1).toString()
        });
        if (activePlatform) queryParams.append('activePlatform', activePlatform.toString());
        if (activeGenre) queryParams.append('activeGenre', activeGenre.toString());
        if (activeLanguage) queryParams.append('activeLanguage', activeLanguage.toString());
        if (activeYear) queryParams.append('activeYear', activeYear.toString());
        
        const url = \`/api/discover?\${queryParams.toString()}\`;
        
        const res = await fetch(url);`;

file = file.replace(targetUrlLogic, replacement);
fs.writeFileSync('src/components/LibraryView.tsx', file);
