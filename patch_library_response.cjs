const fs = require('fs');
let file = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

file = file.replace(
  `data = await res.json();`,
  `const j = await res.json();
               data = j.data || j;`
);

fs.writeFileSync('src/components/LibraryView.tsx', file);
