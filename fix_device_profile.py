with open('server.ts', 'r') as f:
    text = f.read()

import re

# Replace the DirectPlayProfiles and TranscodingProfiles to be highly restrictive for browsers
replacement = """      DirectPlayProfiles: [
        {
          Container: "mp4,m4v,webm",
          Type: "Video",
          VideoCodec: "h264,vp8,vp9",
          AudioCodec: "aac,mp3,opus"
        },
        {
          Container: "webm",
          Type: "Video",
          VideoCodec: "vp8,vp9",
          AudioCodec: "opus,vorbis"
        },
        {
          Container: "aac,mp3,opus",
          Type: "Audio"
        }
      ],
      TranscodingProfiles: [
        {
          Container: "ts",
          Type: "Video",
          AudioCodec: "aac,mp3",
          VideoCodec: "h264",
          Context: "Streaming",
          Protocol: "hls"
        },
        {
          Container: "mp4",
          Type: "Video",
          AudioCodec: "aac,mp3",
          VideoCodec: "h264",
          Context: "Static",
          Protocol: "http"
        }
      ],"""

# Find the start of DirectPlayProfiles and end of TranscodingProfiles
pattern = re.compile(r'      DirectPlayProfiles: \[.*?      \],.*?TranscodingProfiles: \[.*?      \],', re.DOTALL)
text = pattern.sub(replacement, text)

with open('server.ts', 'w') as f:
    f.write(text)

