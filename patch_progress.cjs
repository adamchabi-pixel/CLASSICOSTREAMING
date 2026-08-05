const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  return (
    <div className="min-h-screen bg-black text-stone-100 font-sans`;

const replacement1 = `  const getProgress = (id: string) => {
    let pct = progressData[id] || 0;
    if (pct === 0) {
      const m = allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", ""));
      if (m && m.tmdbId && progressData[m.tmdbId]) {
         pct = progressData[m.tmdbId];
      }
    }
    return pct;
  };

  return (
    <div className="min-h-screen bg-black text-stone-100 font-sans`;

content = content.replace(target1, replacement1);

const target2 = `{(history.filter(id => progressData[id] > 0 && progressData[id] < 0.95).map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", ""))).filter(m => !!m).length > 0) && (`;
const replacement2 = `{(history.filter(id => getProgress(id) > 0 && getProgress(id) < 0.95).map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", ""))).filter(m => !!m).length > 0) && (`;
content = content.replace(target2, replacement2);

const target3 = `.filter(id => progressData[id] > 0 && progressData[id] < 0.95)`;
const replacement3 = `.filter(id => getProgress(id) > 0 && getProgress(id) < 0.95)`;
content = content.replace(target3, replacement3);

const target4 = `progressPercent={progressData[movie.id]}`;
const replacement4 = `progressPercent={getProgress(movie.id)}`;
content = content.replace(target4, replacement4); // wait, there might be multiple! we can replace all

fs.writeFileSync('src/App.tsx', content);
console.log("patched App.tsx");
