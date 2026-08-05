const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const oldStr = `  const [serverSelected, setServerSelected] = useState(false);`;
const newStr = `  const [serverSelected, setServerSelected] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = isTv ? (movieId ? movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null) : movieId;
      if (baseId && saved[baseId] && saved[baseId].server_index !== undefined) {
          return true;
      }
    } catch(e) {}
    return false;
  });`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
