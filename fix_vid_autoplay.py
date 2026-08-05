import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsMetadataLoaded(true);
        console.trace("[PLAYER STATE CHANGE]", {"""

replacement = """      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsMetadataLoaded(true);
        if (videoState.playing && videoRef.current && videoRef.current.paused) {
           videoRef.current.play().catch(e => console.warn("Restore play prevented:", e));
        }
        console.trace("[PLAYER STATE CHANGE]", {"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed VideoPlayer autoplay")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
