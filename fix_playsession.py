import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """        const transcodeObj = new URL(transcodeUrl, baseOrigin);
        if (activeAudioIndex !== null) transcodeObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());"""
replacement = """        const transcodeObj = new URL(transcodeUrl, baseOrigin);
        transcodeObj.searchParams.set("PlaySessionId", Date.now().toString());
        if (activeAudioIndex !== null) transcodeObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed transcodeObj")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target2 = """             if (isNetlify) {
                 workingUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=ClassicoWebClient&MediaSourceId=${playbackInfo.id}`;
             } else {
                 // For internal API, append api_key and deviceId so they are proxied correctly if needed
                 workingUrl = `/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}&DeviceId=ClassicoWebClient`;
             }"""
replacement2 = """             if (isNetlify) {
                 workingUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=ClassicoWebClient&MediaSourceId=${playbackInfo.id}&PlaySessionId=${Date.now()}`;
             } else {
                 // For internal API, append api_key and deviceId so they are proxied correctly if needed
                 workingUrl = `/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}&DeviceId=ClassicoWebClient&PlaySessionId=${Date.now()}`;
             }"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Fixed VideoPlayer transcodeUrl")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
