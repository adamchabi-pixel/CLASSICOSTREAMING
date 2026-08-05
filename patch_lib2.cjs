const fs = require('fs');
let file = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

file = file.replace(/let url = \`https:\/\/api\.tmdb\.org.*?const res = await fetch\(url, \{[\s\S]*?\}\);/m, `        let queryParams = new URLSearchParams({
            type: type || 'movie',
            page: (page || 1).toString()
        });
        if (activePlatform) queryParams.append('activePlatform', activePlatform.toString());
        if (activeGenre) queryParams.append('activeGenre', activeGenre.toString());
        if (activeLanguage) queryParams.append('activeLanguage', activeLanguage.toString());
        if (activeYear) queryParams.append('activeYear', activeYear.toString());
        
        const url = \`/api/discover?\${queryParams.toString()}\`;
        
        const res = await fetch(url);`);

fs.writeFileSync('src/components/LibraryView.tsx', file);
