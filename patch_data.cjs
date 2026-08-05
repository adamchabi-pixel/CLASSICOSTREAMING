const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');

// Helper to empty movies array for a given collection ID
function emptyMovies(id) {
    const regex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?movies:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\n\\s*\\},|\\]\\s*\\n\\s*\\];)`);
    data = data.replace(regex, (match, p1, p2, p3) => {
        return p1 + "\n" + p3;
    });
}

['tarantino-collection', 'christopher-nolan', 'star-wars', 'james-bond', 'the-batman'].forEach(emptyMovies);

const newCollections = `  },
  {
    id: "frank-darabont",
    title: "Frank Darabont",
    description: "The visionary director behind some of the greatest cinematic adaptations of our time.",
    movies: []
  },
  {
    id: "martin-scorsese",
    title: "Martin Scorsese",
    description: "Gritty, uncompromising and masterful storytelling from a cinematic legend.",
    movies: []
  },
  {
    id: "godzilla",
    title: "Godzilla",
    description: "The King of the Monsters. Epic destruction and awe-inspiring creature features.",
    movies: []
  },
  {
    id: "jurassic-park",
    title: "Jurassic Park",
    description: "An adventure 65 million years in the making. Life finds a way.",
    movies: []
  }
];`;

data = data.replace(/\}\s*,\s*\{\s*id:\s*"the-batman"[^\]]*\]\s*\}\s*\];/, (match) => {
    // Just replace the end of the array
    return match.replace(/\];$/, newCollections.substring(4));
});

if (data.includes("id: \"frank-darabont\"")) {
    fs.writeFileSync('src/data.ts', data);
    console.log("Success adding new collections");
} else {
    // Try appending manually
    data = data.replace(/\];\s*$/, newCollections);
    fs.writeFileSync('src/data.ts', data);
    console.log("Success appending new collections");
}

