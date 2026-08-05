const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `                          setShowServerMenu(false);`;
const replacement = `                          localStorage.setItem("classico_global_server_index", String(idx));\n                          setShowServerMenu(false);`;
// note we only want to replace the one inside the menu click, but replacing all is probably fine since the other one is for clicking outside which shouldn't happen or we just replace the exact match. Wait, there is a document click handler too.

content = content.replace(`                          setShowServerMenu(false);\n                        }}\n                        className=\`px-4 py-3`, `                          localStorage.setItem("classico_global_server_index", String(idx));\n                          setShowServerMenu(false);\n                        }}\n                        className=\`px-4 py-3`);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
