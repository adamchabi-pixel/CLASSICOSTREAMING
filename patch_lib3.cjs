const fs = require('fs');
let file = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const startIndex = file.indexOf('let url = `https://api.tmdb.org');
if (startIndex !== -1) {
    const endIndex = file.indexOf('});', file.indexOf('fetch(url')) + 3;
    const replacement = `let queryParams = new URLSearchParams({
            type: type || 'movie',
            page: (page || 1).toString()
        });
        if (activePlatform) queryParams.append('activePlatform', activePlatform.toString());
        if (activeGenre) queryParams.append('activeGenre', activeGenre.toString());
        if (activeLanguage) queryParams.append('activeLanguage', activeLanguage.toString());
        if (activeYear) queryParams.append('activeYear', activeYear.toString());
        
        const res = await fetch(\`/api/discover?\${queryParams.toString()}\`);`;
    file = file.slice(0, startIndex) + replacement + file.slice(endIndex);
    fs.writeFileSync('src/components/LibraryView.tsx', file);
    console.log("Replaced");
} else {
    console.log("Not found");
}
