const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetPop = `    const handlePopState = () => {
      const path = window.location.pathname;
      setRoutePath(path);`;

const replacePop = `    const handlePopState = () => {
      const path = window.location.pathname;
      setRoutePath(path);
      
      if (!path.startsWith("/player/")) {
        loadProgress();
        const savedHistory = localStorage.getItem("classico_history");
        if (savedHistory) {
          try {
            const h = JSON.parse(savedHistory);
            if (Array.isArray(h)) setHistory(h);
          } catch (e) {}
        }
      }`;

file = file.replace(targetPop, replacePop);

fs.writeFileSync('src/App.tsx', file);
