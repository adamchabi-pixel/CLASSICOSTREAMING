const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');

const replacement = `  },
  {
    id: "frank-darabont",
    title: "Frank Darabont",
    description: "The visionary director behind some of the greatest cinematic adaptations of our time.",
    movies: []
  },
  {
    id: "martin-scorsese",`;

data = data.replace(`  },
  {
    id: "martin-scorsese",`, replacement);

fs.writeFileSync('src/data.ts', data);
