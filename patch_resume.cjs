const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{Array.from(new Set([...history, ...Object.keys(progressData).map(k => k.replace("-tv", ""))]))
                          .filter(id => getProgress(id) > 0 && getProgress(id) < 0.95)
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))
                          .filter((m, idx, self) => !!m && self.findIndex(t => t?.id === m?.id) === idx)`;

const replace = `{Array.from(new Set([...history, ...Object.keys(progressData).map(k => k.replace("-tv", ""))]))
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))
                          .filter((m, idx, self) => !!m && self.findIndex(t => t?.id === m?.id) === idx)
                          .filter(m => {
                              const p = getProgress(m.id);
                              if (p <= 0) return false;
                              if (m.isTv) return true;
                              return p < 0.95;
                          })`;

file = file.replace(target, replace);
fs.writeFileSync('src/App.tsx', file);
