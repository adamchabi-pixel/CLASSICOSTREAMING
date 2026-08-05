import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsMetadataLoaded(true);
          const liveDur = video.duration;
          const jellyfinDur = playbackInfo?.duration || 0;
          validateAndSetDuration(liveDur, jellyfinDur);
          // Auto-play the HLS stream
          setPlaying(true);
        });"""

replacement = """        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsMetadataLoaded(true);
          const liveDur = video.duration;
          const jellyfinDur = playbackInfo?.duration || 0;
          validateAndSetDuration(liveDur, jellyfinDur);
          // Auto-play the HLS stream
          setPlaying(true);
          if (video.paused && !isAutoplayBlocked) {
             video.play().catch((err) => {
                 console.warn("Autoplay prevented:", err);
                 setIsAutoplayBlocked(true);
                 setPlaying(false);
             });
          }
        });"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed CinemaPlayerView autoplay")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target2 = """      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsMetadataLoaded(true);
        console.log(`[URL DEBUG LOG] [VIDEO PLAYER] HLS Manifest parsed. Duration: ${video.duration}`);
        if (savedRestoreTime.current > 0) {
          console.log(`[RESTORE SYSTEM] Applying saved time ${savedRestoreTime.current}s...`);
          video.currentTime = savedRestoreTime.current;
          savedRestoreTime.current = 0;
        }
      });"""

replacement2 = """      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsMetadataLoaded(true);
        console.log(`[URL DEBUG LOG] [VIDEO PLAYER] HLS Manifest parsed. Duration: ${video.duration}`);
        if (savedRestoreTime.current > 0) {
          console.log(`[RESTORE SYSTEM] Applying saved time ${savedRestoreTime.current}s...`);
          video.currentTime = savedRestoreTime.current;
          savedRestoreTime.current = 0;
        }
        if (videoState.playing && video.paused) {
           video.play().catch(e => console.warn("Restore play prevented:", e));
        }
      });"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Fixed VideoPlayer autoplay")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)

