const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const newServerSelectedInit = `  const [serverSelected, setServerSelected] = useState(() => {
    try {
      if (localStorage.getItem("classico_global_server_index") !== null) {
          return true;
      }
      const savedStr = localStorage.getItem("classico_progress");
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        let baseId = movieId;
        if (movieId && movieId.endsWith('-tv')) {
            baseId = movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "");
        }
        if (saved[baseId] && typeof saved[baseId].server_index === 'number') {
            return true;
        }
        if (movieId && saved[movieId] && typeof saved[movieId].server_index === 'number') {
            return true;
        }
      }
    } catch(e) {}
    return false;
  });`;

content = content.replace(/const \[serverSelected, setServerSelected\] = useState\(\(\) => \{[\s\S]*?return false;\s*\}\);/, newServerSelectedInit);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
