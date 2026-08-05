import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target_fetch = """    const activeTrack = playbackInfo.subtitles?.find(s => s.index === activeSubtitleIndex);
    if (!activeTrack) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }"""

replacement_fetch = """    const activeTrack = playbackInfo.subtitles?.find(s => s.index === activeSubtitleIndex);
    if (!activeTrack || !isTextSubtitle(activeTrack.codec)) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }"""

if target_fetch in content:
    content = content.replace(target_fetch, replacement_fetch)
    with open("src/components/CinemaPlayerView.tsx", "w") as f:
        f.write(content)
    print("Successfully updated fetch params!")
else:
    print("Could not find target fetch")
