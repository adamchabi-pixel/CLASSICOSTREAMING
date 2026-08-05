const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `  const [activeServerIndex, setActiveServerIndex] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = isTv ? (movieId ? movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null) : movieId;
      if (baseId && saved[baseId] && saved[baseId].server_index !== undefined) {
          return saved[baseId].server_index;
      }
    } catch(e) {}
    return 0;
  });
  const [serverSelected, setServerSelected] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = isTv ? (movieId ? movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null) : movieId;
      if (baseId && saved[baseId] && saved[baseId].server_index !== undefined) {
          return true;
      }
    } catch(e) {}
    return false;
  });`;

const replacement1 = `  const [activeServerIndex, setActiveServerIndex] = useState(() => {
    try {
      const globalServer = localStorage.getItem("classico_global_server_index");
      if (globalServer !== null) return parseInt(globalServer, 10);
    } catch(e) {}
    return 0;
  });
  const [serverSelected, setServerSelected] = useState(() => {
    try {
      if (localStorage.getItem("classico_global_server_index") !== null) {
          return true;
      }
    } catch(e) {}
    return false;
  });`;

content = content.replace(target1, replacement1);

// When they select a server, we should save it.
const target2 = `setServerSelected(true);`;
const replacement2 = `setServerSelected(true);\n                    localStorage.setItem("classico_global_server_index", String(idx));`;
content = content.replace(/setServerSelected\(true\);/g, replacement2);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
