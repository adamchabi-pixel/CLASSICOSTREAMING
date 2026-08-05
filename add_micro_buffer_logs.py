import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Add the new refs near other refs (around line 230)
if "rebufferStartTimeRef" not in content:
    refs_insert = """  const isInitialAutoplayRef = useRef<boolean>(true);
  const rebufferStartTimeRef = useRef<number>(0);
  const fragLoadStartTimeRef = useRef<number>(0);"""
    content = content.replace("  const isInitialAutoplayRef = useRef<boolean>(true);", refs_insert)

# Modify onWaiting
on_waiting_old = """            onWaiting={() => {
              setIsBuffering(true);
              addLog("Buffering started");
            }}"""
on_waiting_new = """            onWaiting={(e) => {
              const video = e.currentTarget;
              let bufferEnd = 0;
              if (video.buffered.length > 0) {
                 for (let i = 0; i < video.buffered.length; i++) {
                     if (video.buffered.start(i) <= video.currentTime && video.buffered.end(i) > video.currentTime) {
                         bufferEnd = video.buffered.end(i);
                     }
                 }
              }
              console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] onWaiting. currentTime: ${video.currentTime}s, bufferEnd: ${bufferEnd}s. Amount buffered ahead: ${bufferEnd - video.currentTime}s.`);
              rebufferStartTimeRef.current = performance.now();
              setIsBuffering(true);
              addLog("Buffering started");
            }}"""
content = content.replace(on_waiting_old, on_waiting_new)

# Modify onPlaying
on_playing_old = """          onPlaying={(e) => {
              trackEventFired("playing", "Événement playing (Lecture active)");
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              setPlaying(true);
              addLog("Playback started");
            }}"""
on_playing_new = """          onPlaying={(e) => {
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
content = content.replace(on_playing_old, on_playing_new)

# Modify Hls.Events.FRAG_LOADING / LOADED
frag_loading_old = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Demande de fragment ${data.frag.sn} (début: ${data.frag.start}s)`);
          if (!ttfbTimeRef.current) {
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Attente de TTFB pour ce fragment...`);
          }
        });"""
frag_loading_new = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Demande de fragment ${data.frag.sn} (début: ${data.frag.start}s)`);
          fragLoadStartTimeRef.current = performance.now();
          if (!ttfbTimeRef.current) {
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Attente de TTFB pour ce fragment...`);
          }
        });"""
content = content.replace(frag_loading_old, frag_loading_new)

frag_loaded_old = """        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Fragment ${data.frag.sn} reçu. Poids: ${data.frag.loaded} bytes`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });"""
frag_loaded_new = """        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          const duration = fragLoadStartTimeRef.current ? performance.now() - fragLoadStartTimeRef.current : 0;
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Fragment ${data.frag.sn} reçu. Poids: ${data.frag.loaded} bytes. Temps de chargement total: ${duration.toFixed(2)}ms`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });"""
content = content.replace(frag_loaded_old, frag_loaded_new)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Added micro-buffering logs")
