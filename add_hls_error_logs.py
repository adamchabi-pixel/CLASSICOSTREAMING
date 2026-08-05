import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

error_old = """        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.details === "bufferSeekOverHole") {
            // Ignore completely in silence
            return;
          }
          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            hls.recoverMediaError();
            return;
          }"""

error_new = """        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log(`[HLS ERROR DIAGNOSTIC] [${Date.now()}] Type: ${data.type}, Details: ${data.details}, Fatal: ${data.fatal}`);
          if (data.details === "bufferStalledError") {
             const video = videoRef.current;
             let bufferEnd = 0;
             if (video && video.buffered.length > 0) {
                 for (let i = 0; i < video.buffered.length; i++) {
                     if (video.buffered.start(i) <= video.currentTime && video.buffered.end(i) > video.currentTime) {
                         bufferEnd = video.buffered.end(i);
                     }
                 }
             }
             console.log(`[HLS ERROR DIAGNOSTIC] bufferStalledError - currentTime: ${video?.currentTime}s, bufferEnd: ${bufferEnd}s`);
          }
          if (data.details === "bufferSeekOverHole") {
            // Ignore completely in silence
            return;
          }
          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            hls.recoverMediaError();
            return;
          }"""
          
content = content.replace(error_old, error_new)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Added HLS error logs")
