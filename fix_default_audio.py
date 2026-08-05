import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = "const isChangingAudio = audioIndex !== null;"
replacement = """const defaultAudio = playbackInfo.audios.find((a: any) => a.isDefault) || playbackInfo.audios[0];
         const isChangingAudio = audioIndex !== null && (!defaultAudio || audioIndex !== defaultAudio.index);"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target2 = "if (playbackInfo.isDirect && changed) {"
replacement2 = """
      const defaultAudio = playbackInfo.audios.find((a: any) => a.isDefault) || playbackInfo.audios[0];
      const isChangingAudio = activeAudioIndex !== null && (!defaultAudio || activeAudioIndex !== defaultAudio.index);
      
      // Only convert to transcoding if we ACTUALLY need a non-default audio or burned in subtitles
      if (playbackInfo.isDirect && (isChangingAudio || needsBurnIn)) {"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Fixed CinemaPlayerView")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
