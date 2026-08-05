import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """  // Handle Audio & non-text Subtitle Track changes by reloading stream
  useEffect(() => {
    if (!playbackInfo || playbackInfo.isDirect) return;
    
    const currentUrl = playbackInfo.streamUrl;"""

replacement = """  // Handle Audio & non-text Subtitle Track changes by reloading stream
  useEffect(() => {
    if (!playbackInfo) return;
    
    let currentUrl = playbackInfo.streamUrl;"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched target 1")

target2 = """      if (changed) {
        let newUrl = "";
        if (currentUrl.startsWith("/")) {
          newUrl = urlObj.pathname + urlObj.search;
        } else {
          newUrl = urlObj.toString();
        }"""

replacement2 = """      
      // If we are DirectPlay but we NEED to change audio or burn-in subtitle, we must switch to Transcoding
      if (playbackInfo.isDirect && changed) {
        console.log("[STREAM CONVERSION] Converting DirectPlay to Transcoding to support Audio/Subtitle change.");
        const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
        const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
        const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
        const hlsParams = `Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
        
        let transcodeUrl = "";
        if (isNetlify) {
            transcodeUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=CinemaAppClient&MediaSourceId=${playbackInfo.id}`;
        } else {
            transcodeUrl = formatHlsUrl(`/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}`, playbackInfo.id, "CinemaAppClient", "");
        }
        
        const transcodeObj = new URL(transcodeUrl, baseOrigin);
        if (activeAudioIndex !== null) transcodeObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());
        if (needsBurnIn) {
            transcodeObj.searchParams.set("SubtitleStreamIndex", activeSubtitleIndex!.toString());
            transcodeObj.searchParams.set("SubtitleMethod", "Encode");
        }
        
        let newUrl = transcodeUrl.startsWith("/") ? transcodeObj.pathname + transcodeObj.search : transcodeObj.toString();
        
        if (videoRef.current && videoRef.current.currentTime > 0) {
            savedRestoreTimeRef.current = videoRef.current.currentTime;
        }
        
        setPlaybackInfo(prev => ({
            ...prev!,
            isDirect: false,
            streamUrl: newUrl
        }));
        return; // Early return to avoid setting it again below
      }

      if (changed) {
        let newUrl = "";
        if (currentUrl.startsWith("/")) {
          newUrl = urlObj.pathname + urlObj.search;
        } else {
          newUrl = urlObj.toString();
        }"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Patched target 2")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
