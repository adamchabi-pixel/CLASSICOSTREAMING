import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target2 = """    fetchPlayback();

    return () => {
      active = false;
    };
  }, [movieId, forceTranscode, playbackAttempts, isLowQuality]);"""

replacement2 = """    fetchPlayback();

    return () => {
      active = false;
    };
  }, [movieId, forceTranscode, playbackAttempts, isLowQuality]);

  // Handle Audio Track changes by reloading stream with correct AudioStreamIndex
  useEffect(() => {
    if (!playbackInfo || activeAudioIndex === null || playbackInfo.isDirect) return;
    
    const currentUrl = playbackInfo.streamUrl;
    if (!currentUrl) return;
    
    try {
      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(currentUrl, baseOrigin);
      
      const currentAudioIndex = urlObj.searchParams.get("AudioStreamIndex");
      if (currentAudioIndex !== activeAudioIndex.toString()) {
        urlObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());
        
        let newUrl = "";
        if (currentUrl.startsWith("/")) {
          newUrl = urlObj.pathname + urlObj.search;
        } else {
          newUrl = urlObj.toString();
        }
        
        console.log(`[AUDIO TRACK CHANGE] Reloading stream with AudioStreamIndex=${activeAudioIndex}`);
        
        // Save current time before reload to resume
        if (videoRef.current && videoRef.current.currentTime > 0) {
            savedRestoreTimeRef.current = videoRef.current.currentTime;
        }
        
        setPlaybackInfo(prev => ({
            ...prev!,
            streamUrl: newUrl
        }));
      }
    } catch (e) {
      console.error("Error updating audio stream index in URL:", e);
    }
  }, [activeAudioIndex, playbackInfo]);"""

if target2 in content:
    content = content.replace(target2, replacement2)
    with open("src/components/CinemaPlayerView.tsx", "w") as f:
        f.write(content)
    print("Successfully patched CinemaPlayerView.tsx audio track change!")
else:
    print("Could not find target2")
