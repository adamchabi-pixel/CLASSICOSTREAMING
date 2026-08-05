const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
code = code.replace(`    // Prevent destructive stream reset if the URL is already loaded (State Stabilization)
    if (loadedUrlRef.current === playbackInfo.streamUrl) {
    if (playbackInfo.isIframeEmbed) {
      setIsMetadataLoaded(true);
      setPlaying(true);
      setIsActuallyPlaying(true);
      setIsLoading(false);
      setIsStreamLoading(false);
      return;
    }
      return;
    }`, `    if (playbackInfo.isIframeEmbed) {
      setIsMetadataLoaded(true);
      setPlaying(true);
      setIsActuallyPlaying(true);
      setIsLoading(false);
      setIsStreamLoading(false);
      return;
    }

    // Prevent destructive stream reset if the URL is already loaded (State Stabilization)
    if (loadedUrlRef.current === playbackInfo.streamUrl) {
      return;
    }`);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
