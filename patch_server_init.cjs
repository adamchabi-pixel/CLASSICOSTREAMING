const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `  const [activeServerIndex, setActiveServerIndex] = useState(0);`;
const replacement = `  const [activeServerIndex, setActiveServerIndex] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = isTv ? (movieId ? movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null) : movieId;
      if (baseId && saved[baseId] && saved[baseId].server_index !== undefined) {
          return saved[baseId].server_index;
      }
    } catch(e) {}
    return 0;
  });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("patched server init");
