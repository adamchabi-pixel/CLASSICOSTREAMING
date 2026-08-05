const fs = require('fs');

const f1 = fs.readFileSync('src/data/imported_movies.ts', 'utf8');

// Use regex to find `null` as an element of an array, e.g. `[ ..., null, ... ]`
const match = f1.match(/,\s*null\s*[,\]]/);
if (match) {
    console.log("Found null element at index:", match.index);
    console.log(f1.substring(match.index - 50, match.index + 50));
} else {
    console.log("No null array elements found.");
}
