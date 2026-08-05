import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """  const getParameterizedStreamUrl = (
    url: string | null,
    subOn: boolean,
    subIndex: number | null,
    audioIndex: number | null
  ): string | null => {
    if (!url) return null;
    if (!isJellyfinMovie || !playbackInfo) return url;

    try {
      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(url, baseOrigin);"""

replacement = """  const getParameterizedStreamUrl = (
    url: string | null,
    subOn: boolean,
    subIndex: number | null,
    audioIndex: number | null
  ): string | null => {
    if (!url) return null;
    if (!isJellyfinMovie || !playbackInfo) return url;

    try {
      let isForcedTranscoding = false;
      let workingUrl = url;

      // Check if we need to force transcoding from Direct Play
      if (playbackInfo.isDirect) {
         let needsTranscodeForSub = false;
         if (subOn && subIndex !== null && playbackInfo.subtitles) {
            const activeSub = playbackInfo.subtitles.find((s: any) => s.index === subIndex);
            if (activeSub && !isTextSubtitle(activeSub.codec)) {
               needsTranscodeForSub = true;
            }
         }
         
         const isChangingAudio = audioIndex !== null;
         
         if (isChangingAudio || needsTranscodeForSub) {
             console.log("[STREAM CONVERSION] Converting DirectPlay to Transcoding for Audio/Subtitle.");
             isForcedTranscoding = true;
             
             // Construct Transcode URL
             const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
             const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
             const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
             const hlsParams = `Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
             
             if (isNetlify) {
                 workingUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=ClassicoWebClient&MediaSourceId=${playbackInfo.id}`;
             } else {
                 // For internal API, append api_key and deviceId so they are proxied correctly if needed
                 workingUrl = `/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}&DeviceId=ClassicoWebClient`;
             }
             
             // IMPORTANT: We must also update the playbackInfo so that downstream effects know it's no longer direct play!
             // However, modifying state inside this pure function is dangerous, but we can set a flag that triggers it if needed.
             // Actually, for VideoPlayer, the downstream HLS initialization checks `finalStreamUrl.includes(".m3u8")` rather than `isDirect`!
             // Let's verify that. Yes! `const isHls = finalStreamUrl.toLowerCase().includes(".m3u8");`
             // So just changing the URL is enough for VideoPlayer!
         }
      }

      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(workingUrl, baseOrigin);"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched VideoPlayer successfully")
else:
    print("Target not found in VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
