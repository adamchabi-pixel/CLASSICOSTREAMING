const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `                          }
                          setShowServerMenu(false);
                        }}
                        className=\`px-4 py-3 text-sm flex items-center gap-3`;

const replacement = `                          }
                          localStorage.setItem("classico_global_server_index", String(idx));
                          setShowServerMenu(false);
                        }}
                        className=\`px-4 py-3 text-sm flex items-center gap-3`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
