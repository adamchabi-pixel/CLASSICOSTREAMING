const fs = require('fs');

function replaceInFile(filePath) {
    if (fs.existsSync(filePath)) {
        let file = fs.readFileSync(filePath, 'utf8');
        file = file.replace(/api\.themoviedb\.org/g, 'api.tmdb.org');
        fs.writeFileSync(filePath, file);
    }
}

['src/main.tsx', 'src/App.tsx', 'src/components/LibraryView.tsx', 'src/components/MovieModal.tsx', 'server.ts'].forEach(replaceInFile);

console.log("Patched api.themoviedb.org to api.tmdb.org");
