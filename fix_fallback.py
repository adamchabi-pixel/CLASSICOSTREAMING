import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Fix fallbackPath where it's missing in ERROR event handler
missing_var = "const fallbackUrl = isNetlify ? `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&VideoBitrate=1500000&MaxVideoBitrate=1500000&MaxWidth=1280&MaxHeight=720&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy${fallbackPath}&DeviceId=${deviceId}&MediaSourceId=${movieId}`, movieId, deviceId, apiKey);"

fix = """const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&VideoBitrate=1500000&MaxVideoBitrate=1500000&MaxWidth=1280&MaxHeight=720`;
                const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy${fallbackPath}&DeviceId=${deviceId}&MediaSourceId=${movieId}`, movieId, deviceId, apiKey);"""

content = content.replace(missing_var, fix)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Fixed fallbackPath")
