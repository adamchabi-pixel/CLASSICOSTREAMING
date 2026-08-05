const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `                       language: r.original_language,
                       isTv: false
                   } as Movie;`;

const replacement = `                       language: r.original_language,
                       isTv: false,
                       duration: "Unknown",
                       director: "Unknown",
                       cast: [],
                       genre: []
                   } as unknown as Movie;`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/LibraryView.tsx', content);
