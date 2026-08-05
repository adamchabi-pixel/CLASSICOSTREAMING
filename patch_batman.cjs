const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');

function emptyMovies(id) {
    const regex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?movies:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\n\\s*\\},|\\]\\s*\\n\\s*\\];)`);
    data = data.replace(regex, (match, p1, p2, p3) => {
        return p1 + "\n" + p3;
    });
}
emptyMovies('the-batman');

fs.writeFileSync('src/data.ts', data);
