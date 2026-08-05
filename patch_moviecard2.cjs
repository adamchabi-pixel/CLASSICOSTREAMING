const fs = require('fs');
let file = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

const target = `    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? movie.id.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null;
      if (baseId && saved[baseId]) {
         if (movie.isTv) {
            // Only show checkmark on series if ALL episodes are watched or it's a series card. Let's just say if it's watched at all.
            return !!saved[baseId].last_season_watched;
         } else {
            // For movies
            return (saved[baseId].currentTime && saved[baseId].currentTime > 0) || (saved[baseId].progress && saved[baseId].progress > 0); // If they started it, consider it 'vu' as requested.
         }
      }
    } catch(e) {}
    return false;`;

const replacement = `    if (typeof progressPercent === "number") {
      return progressPercent >= 0.95;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? movie.id.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null;
      if (baseId && saved[baseId]) {
         if (movie.isTv) {
            return false; // Hard to determine if entire TV show is watched, default to false
         } else {
            const duration = saved[baseId].duration || 0;
            const current = saved[baseId].currentTime || 0;
            if (duration > 0 && current / duration >= 0.95) return true;
         }
      }
    } catch(e) {}
    return false;`;

file = file.replace(target, replacement);
fs.writeFileSync('src/components/MovieCard.tsx', file);
console.log("Success");
