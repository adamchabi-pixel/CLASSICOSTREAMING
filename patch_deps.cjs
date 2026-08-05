const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `  }, [playbackInfo?.streamUrl, isInitialized, isLoading]);`;
const replacement = `  }, [playbackInfo?.streamUrl, isInitialized, isLoading, activeServerIndex]);`;
content = content.replace(target, replacement);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("patched deps");
