const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(
  `const globalServer = localStorage.getItem("classico_global_server_index");
      if (globalServer !== null) return parseInt(globalServer, 10);`,
  `const globalServer = localStorage.getItem("classico_global_server_index");
      if (globalServer !== null) {
          const parsed = parseInt(globalServer, 10);
          return isNaN(parsed) ? 0 : parsed;
      }`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
