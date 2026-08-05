import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

playing_code = """          onPlaying={(e) => {
              trackEventFired("playing", "Événement playing (Lecture active)");
              if (rebufferStartTimeRef.current) {
                 const duration = performance.now() - rebufferStartTimeRef.current;
                 console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] onPlaying. Rebuffering duration: ${duration.toFixed(2)}ms.`);
                 rebufferStartTimeRef.current = 0;
              }
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              setPlaying(true);
              addLog("Playback started");
            }}"""
playing_code_new = """          onPlaying={(e) => {
              trackEventFired("playing", "Événement playing (Lecture active)");
              if (rebufferStartTimeRef.current) {
                 const duration = performance.now() - rebufferStartTimeRef.current;
                 console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] ✅ STALL RESOLVED ✅ | Temps de stall: ${duration.toFixed(2)}ms`);
                 rebufferStartTimeRef.current = 0;
              }
              if ((window as any)._microStallStart !== undefined) {
                  const duration = performance.now() - (window as any)._microStallStart;
                  console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] ✅ STALL RESOLVED ✅ | Temps de stall (fallback): ${duration.toFixed(2)}ms`);
                  (window as any)._microStallStart = undefined;
              }
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              setPlaying(true);
              addLog("Playback started");
            }}"""
content = content.replace(playing_code, playing_code_new)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Patched onPlaying")
