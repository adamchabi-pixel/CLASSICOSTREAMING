import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);"""
replacement = """  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed state")
else:
    print("State not found!")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
