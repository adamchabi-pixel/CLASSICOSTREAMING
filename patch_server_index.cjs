const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// Update activeServerIndex initialization to first check per-movie progress, then global
const newServerIndexInit = `  const [activeServerIndex, setActiveServerIndex] = useState(() => {
    try {
      // Check for per-movie/show server preference
      const savedStr = localStorage.getItem("classico_progress");
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        let baseId = movieId;
        if (movieId && movieId.endsWith('-tv')) {
            baseId = movieId.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "");
        }
        if (saved[baseId] && typeof saved[baseId].server_index === 'number') {
            return saved[baseId].server_index;
        }
        if (movieId && saved[movieId] && typeof saved[movieId].server_index === 'number') {
            return saved[movieId].server_index;
        }
      }
      
      const globalServer = localStorage.getItem("classico_global_server_index");
      if (globalServer !== null) return parseInt(globalServer, 10);
    } catch(e) {}
    return 0;
  });`;

content = content.replace(/const \[activeServerIndex, setActiveServerIndex\] = useState\(\(\) => \{[\s\S]*?return 0;\s*\}\);/, newServerIndexInit);

// Update dropdown menu click handler to save the choice globally
const dropdownOnClick = `                        onClick={(e) => {
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

content = content.replace(/onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setActiveServerIndex\(idx\);\s*if \(playbackInfo\) \{\s*setPlaybackInfo\(\{\s*\.\.\.playbackInfo,\s*iframeSrc: server\.url,\s*streamUrl: server\.url\s*\}\);\s*\}\s*setShowServerMenu\(false\);\s*\}\}/, dropdownOnClick);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
