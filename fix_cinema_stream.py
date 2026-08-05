import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Replace the previous useEffect with the new one
target_effect = """  // Handle Audio Track changes by reloading stream with correct AudioStreamIndex
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

replacement_effect = """  // Handle Audio & non-text Subtitle Track changes by reloading stream
  useEffect(() => {
    if (!playbackInfo || playbackInfo.isDirect) return;
    
    const currentUrl = playbackInfo.streamUrl;
    if (!currentUrl) return;

    let needsBurnIn = false;
    if (activeSubtitleIndex !== null && subtitlesOn) {
      const activeSub = playbackInfo.subtitles.find((s: any) => s.index === activeSubtitleIndex);
      if (activeSub && !isTextSubtitle(activeSub.codec)) {
        needsBurnIn = true;
      }
    }
    
    try {
      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(currentUrl, baseOrigin);
      
      let changed = false;

      if (activeAudioIndex !== null) {
        const currentAudioIndex = urlObj.searchParams.get("AudioStreamIndex");
        if (currentAudioIndex !== activeAudioIndex.toString()) {
          urlObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());
          changed = true;
        }
      }

      const currentSubIndex = urlObj.searchParams.get("SubtitleStreamIndex");
      if (needsBurnIn) {
        if (currentSubIndex !== activeSubtitleIndex!.toString()) {
          urlObj.searchParams.set("SubtitleStreamIndex", activeSubtitleIndex!.toString());
          urlObj.searchParams.set("SubtitleMethod", "Encode");
          changed = true;
        }
      } else {
        if (currentSubIndex !== null) {
          urlObj.searchParams.delete("SubtitleStreamIndex");
          urlObj.searchParams.delete("SubtitleMethod");
          changed = true;
        }
      }

      if (changed) {
        let newUrl = "";
        if (currentUrl.startsWith("/")) {
          newUrl = urlObj.pathname + urlObj.search;
        } else {
          newUrl = urlObj.toString();
        }
        
        console.log(`[STREAM RELOAD] AudioIndex=${activeAudioIndex}, SubtitleIndex=${needsBurnIn ? activeSubtitleIndex : 'Overlay'}`);
        
        if (videoRef.current && videoRef.current.currentTime > 0) {
            savedRestoreTimeRef.current = videoRef.current.currentTime;
        }
        
        setPlaybackInfo(prev => ({
            ...prev!,
            streamUrl: newUrl
        }));
      }
    } catch (e) {
      console.error("Error updating stream url params:", e);
    }
  }, [activeAudioIndex, activeSubtitleIndex, subtitlesOn, playbackInfo]);"""

if target_effect in content:
    content = content.replace(target_effect, replacement_effect)
else:
    print("Could not find target effect")

# Now modify the fetchSubtitles block
target_fetch = """    const activeTrack = playbackInfo.subtitles.find((t: any) => t.index === activeSubtitleIndex);
    if (!activeTrack || !activeTrack.url) return;

    let isSubscribed = true;"""

replacement_fetch = """    const activeTrack = playbackInfo.subtitles.find((t: any) => t.index === activeSubtitleIndex);
    if (!activeTrack || !activeTrack.url) return;
    
    // If it's not a text subtitle, we don't fetch VTT (it will be burned in via stream reload)
    if (!isTextSubtitle(activeTrack.codec)) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }

    let isSubscribed = true;"""

if target_fetch in content:
    content = content.replace(target_fetch, replacement_fetch)
else:
    print("Could not find target fetch")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)

print("Successfully updated stream params!")
