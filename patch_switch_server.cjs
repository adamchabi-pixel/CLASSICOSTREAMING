const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `        if (currentTime !== undefined) {
          try {
            const saved = (JSON.parse(localStorage.getItem("classico_progress") || "{}") || {});`;
const replace1 = `        if (currentTime !== undefined) {
          try {
            savedRestoreTimeRef.current = currentTime;
            const saved = (JSON.parse(localStorage.getItem("classico_progress") || "{}") || {});`;
file = file.replace(target1, replace1);

const target2 = `                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveServerIndex(idx);
                          if (playbackInfo) {
                            setPlaybackInfo({
                              ...playbackInfo,
                              iframeSrc: server.url,
                              streamUrl: server.url
                            });
                          }
                          localStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);
                          setShowServerMenu(false);
                        }}`;
const replace2 = `                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveServerIndex(idx);
                          
                          let targetUrl = server.url.replace(/&t=\\d+/, "");
                          if (savedRestoreTimeRef.current > 0) {
                              targetUrl += \`&t=\${Math.floor(savedRestoreTimeRef.current)}\`;
                          }
                          
                          if (playbackInfo) {
                            setPlaybackInfo({
                              ...playbackInfo,
                              iframeSrc: targetUrl,
                              streamUrl: targetUrl
                            });
                          }
                          localStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);
                          setShowServerMenu(false);
                        }}`;
                        
// There are two buttons like this (one is for mobile UI maybe, or one for availableServers directly) Let's replace globally just in case.
file = file.replaceAll(target2, replace2);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
