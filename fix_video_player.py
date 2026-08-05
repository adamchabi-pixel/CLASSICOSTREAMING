import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """    controlsTimeoutRef.current = setTimeout(() => {
      // Only hide controls if the video is playing
      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
      }
    }, 5000);"""
replacement = """    controlsTimeoutRef.current = setTimeout(() => {
      // Only hide controls if the video is playing
      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
        setShowSettingsMenu(false);
      }
    }, 5000);"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced timeout")

# Also add document click outside
click_target = """  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);"""
click_replacement = """  useEffect(() => {
    resetControlsTimeout();
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#player-settings-btn") && !target.closest("#player-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);"""

if click_target in content:
    content = content.replace(click_target, click_replacement)
    print("Replaced click handler")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
