import re

with open('server.ts', 'r') as f:
    content = f.read()

bad_params = """    BreakOnNonKeyFrames: "true",
    SegmentLength: "3", // Segments de 3 secondes pour minimiser la fréquence des requêtes et les coupures
    MinSegments: "1","""
content = content.replace(bad_params, "")

bad_inject = """  // Injecter dynamiquement SegmentLength=2 et MinSegments=1 pour optimiser tout flux HLS (transcodage)
  if (chosenPath.includes(".m3u8") || chosenPath.includes("hls")) {
    if (!chosenPath.includes("SegmentLength=")) {
      chosenPath += `${chosenPath.includes("?") ? "&" : "?"}SegmentLength=2`;
    }
    if (!chosenPath.includes("MinSegments=")) {
      chosenPath += `${chosenPath.includes("?") ? "&" : "?"}MinSegments=1`;
    }
  }"""
content = content.replace(bad_inject, "")

# also fix the fallback in server.ts
content = content.replace("BreakOnNonKeyFrames=true&SegmentLength=2&MinSegments=1", "")
content = content.replace("BreakOnNonKeyFrames=true", "")
content = content.replace("SegmentLength=2", "")
content = content.replace("MinSegments=1", "")
# clean up any && or ?&
content = re.sub(r'&+', '&', content)
content = re.sub(r'\?&', '?', content)

with open('server.ts', 'w') as f:
    f.write(content)

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace("BreakOnNonKeyFrames=true&SegmentLength=2&MinSegments=1", "")
content2 = content2.replace("BreakOnNonKeyFrames=true", "")
content2 = content2.replace("SegmentLength=2", "")
content2 = content2.replace("MinSegments=1", "")
content2 = re.sub(r'&+', '&', content2)
content2 = re.sub(r'\?&', '?', content2)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content2)

print("Removed BreakOnNonKeyFrames and SegmentLength")
