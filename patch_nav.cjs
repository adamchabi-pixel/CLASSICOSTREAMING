const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  `if (path === "/" || path.startsWith("/movie/")) {
      loadProgress();
    }`,
  `if (!path.startsWith("/player/")) {
      loadProgress();
    }`
);

// We also need to reload history! 
// When in profil, we want history updated too.
const historyTarget = `    if (!path.startsWith("/player/")) {
      loadProgress();
    }`;
const historyReplace = `    if (!path.startsWith("/player/")) {
      loadProgress();
      
      // Also reload history/watchlist just in case
      const savedHistory = localStorage.getItem("classico_history");
      if (savedHistory) {
        try {
          const h = JSON.parse(savedHistory);
          if (Array.isArray(h)) setHistory(h);
        } catch (e) {}
      }
    }`;
file = file.replace(historyTarget, historyReplace);

fs.writeFileSync('src/App.tsx', file);
