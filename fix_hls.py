import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    text = f.read()

old_code = """      if (Hls.isSupported()) {
        if (hlsRef.current) {"""

new_code = """      // Detect Apple devices to prioritize native HLS for AirPlay support
      const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const preferNativeHLS = (isApple || isSafari) && video.canPlayType("application/vnd.apple.mpegurl");

      if (preferNativeHLS) {
        // Native support (Safari iOS/macOS) prioritizes AirPlay compatibility
        console.log("[STREAM LOAD] Lecture native HLS activée (priorité Apple/Safari pour AirPlay)");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      } else if (Hls.isSupported()) {
        if (hlsRef.current) {"""

text = text.replace(old_code, new_code)

old_fallback = """      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native support (Safari iOS/macOS)
        console.log("[STREAM LOAD] Lecture native HLS activée (Safari)");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      } else {"""

new_fallback = """      } else {
        // Fallback Native HLS if Hls.js is not supported but native is
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[STREAM LOAD] Lecture native HLS activée (Fallback)");
            video.src = playbackInfo.streamUrl;
        } else {
            console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
            video.src = playbackInfo.streamUrl;
        }
        logChrono("Attribution du src vidéo");
        video.load();
      }"""

text = text.replace(old_fallback, new_fallback)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(text)
