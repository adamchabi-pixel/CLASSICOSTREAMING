const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I'll check how it reads history. It's stored in local storage.
// We can't access local storage directly from node, but let's check the code of handleAddToHistory and what happens to "-tv"
