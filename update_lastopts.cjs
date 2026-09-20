const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

content = content.replace(
  'lastOpts.isLowQuality === isLowQuality && lastOpts.activeServerIndex === activeServerIndex',
  'lastOpts.isLowQuality === isLowQuality && lastOpts.activeServerIndex === activeServerIndex && lastOpts.language === language'
);

content = content.replace(
  /lastFetchedParamsRef.current = \{ movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex \};/g,
  'lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex, language };'
);

// We need to add language to the ref initialization too
content = content.replace(
  'const lastFetchedParamsRef = useRef<any>({});',
  'const lastFetchedParamsRef = useRef<any>({ language: "en" });'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
console.log("Updated lastOpts successfully!");
