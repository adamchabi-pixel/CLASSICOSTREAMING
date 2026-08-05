const fs = require('fs');
let file = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

const target = `  const isWatched = React.useMemo(() => {
    if (typeof progressPercent === "number") {
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
    return false;
  }, [movie.id, movie.isTv]);`;

const replacement = `  const progressState = React.useMemo(() => {
    if (typeof progressPercent === "number") {
      if (progressPercent >= 0.95) return 'watched';
      if (progressPercent > 0) return 'ongoing';
      return 'none';
    }
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? movie.id.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null;
      if (baseId && saved[baseId]) {
         if (movie.isTv) {
            return 'none';
         } else {
            const duration = saved[baseId].duration || 0;
            const current = saved[baseId].currentTime || 0;
            if (duration > 0) {
               if (current / duration >= 0.95) return 'watched';
               if (current / duration > 0) return 'ongoing';
            }
         }
      }
    } catch(e) {}
    return 'none';
  }, [movie.id, movie.isTv, progressPercent]);`;

file = file.replace(target, replacement);

const targetIcon = `          {isWatched && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-green-500/30">
               <CheckCircle className="w-4 h-4 text-green-500" />
             </div>
          )}`;

const replacementIcon = `          {progressState === 'watched' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-green-500/30" title="Watched">
               <CheckCircle className="w-4 h-4 text-green-500" />
             </div>
          )}
          {progressState === 'ongoing' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-amber-500/30" title="In progress">
               <Clock className="w-4 h-4 text-amber-500" />
             </div>
          )}`;

file = file.replace(targetIcon, replacementIcon);
fs.writeFileSync('src/components/MovieCard.tsx', file);
console.log("Success");
