const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target3 = `                onClick={() => {
                  setActiveServerIndex(idx);
                  if (playbackInfo) {
                    setPlaybackInfo({
                      ...playbackInfo,
                      iframeSrc: server.url,
                      streamUrl: server.url
                    });
                  }
                  setServerSelected(true);
                    localStorage.setItem("classico_global_server_index", String(idx));
                  setIsIframeLoading(true);
                }}`;
const replace3 = `                onClick={() => {
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
                  setServerSelected(true);
                    localStorage.setItem("classico_global_server_index", String(idx));
                  setIsIframeLoading(true);
                }}`;
file = file.replaceAll(target3, replace3);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
