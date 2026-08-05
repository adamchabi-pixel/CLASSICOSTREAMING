import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# I want to add detailed logs inside onWaiting, onPlaying, and HLS events without changing other behavior.

waiting_code = """            onWaiting={() => {
              setIsBuffering(true);
              addLog("Buffering started");
            }}"""
waiting_code_new = """            onWaiting={(e) => {
              setIsBuffering(true);
              const video = e.currentTarget;
              let bufferEnd = 0;
              if (video.buffered.length > 0) {
                 bufferEnd = video.buffered.end(video.buffered.length - 1);
              }
              const bufferLevel = bufferEnd - video.currentTime;
              console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] ⚠️ STALL DETECTED ⚠️ | Spinner affiché !`);
              console.log(`[MICRO-BUFFERING DIAGNOSTIC] currentTime: ${video.currentTime}s, bufferEnd: ${bufferEnd}s, bufferLevel (restant): ${bufferLevel}s`);
              console.log(`[MICRO-BUFFERING DIAGNOSTIC] readyState: ${video.readyState}, networkState: ${video.networkState}`);
              
              if ((window as any)._microStallStart === undefined) {
                  (window as any)._microStallStart = performance.now();
              }
              addLog("Buffering started");
            }}"""
content = content.replace(waiting_code, waiting_code_new)

playing_code = """            onPlaying={(e) => {
              trackEventFired("playing", "Événement playing (Lecture active)");
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              setPlaying(true);
              addLog("Playback started");
            }}"""
playing_code_new = """            onPlaying={(e) => {
              trackEventFired("playing", "Événement playing (Lecture active)");
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              setPlaying(true);
              
              if ((window as any)._microStallStart !== undefined) {
                  const duration = performance.now() - (window as any)._microStallStart;
                  console.log(`[MICRO-BUFFERING DIAGNOSTIC] [${Date.now()}] ✅ STALL RESOLVED ✅ | Temps de stall: ${duration.toFixed(2)}ms`);
                  (window as any)._microStallStart = undefined;
              }
              addLog("Playback started");
            }}"""
content = content.replace(playing_code, playing_code_new)

hls_events = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Demande de fragment ${data.frag.sn} (début: ${data.frag.start}s)`);
          if (!ttfbTimeRef.current) {
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Attente de TTFB pour ce fragment...`);
          }
        });
        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Fragment ${data.frag.sn} reçu. Poids: ${data.frag.loaded} bytes`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });"""

hls_events_new = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
          (data.frag as any)._reqStart = performance.now();
          console.log(`[HLS DIAGNOSTIC] [${Date.now()}] 🚀 Demande Fragment ${data.frag.sn} (début: ${data.frag.start}s, URL: ${data.frag.url.split('/').pop()})`);
          if (!ttfbTimeRef.current) {
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Attente de TTFB pour ce fragment...`);
          }
        });
        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          const reqTime = performance.now() - (data.frag as any)._reqStart;
          console.log(`[HLS DIAGNOSTIC] [${Date.now()}] 📥 Fragment ${data.frag.sn} reçu en ${reqTime.toFixed(2)}ms | Poids: ${(data.frag.loaded / 1024).toFixed(2)} KB | Vitesse: ${((data.frag.loaded * 8) / (reqTime / 1000) / 1024 / 1024).toFixed(2)} Mbps`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });
        hls.on(Hls.Events.BUFFER_APPENDING, (event: any, data: any) => {
          // console.log(`[HLS DIAGNOSTIC] Appending data to ${data.type} buffer`);
        });
        hls.on(Hls.Events.BUFFER_APPENDED, (event: any, data: any) => {
          const ranges = data.timeRanges;
          if (ranges && Object.keys(ranges).length > 0 && ranges.video) {
              const b = ranges.video;
              if (b.length > 0) {
                  const bEnd = b.end(b.length - 1);
                  const current = video.currentTime;
                  console.log(`[HLS DIAGNOSTIC] Buffer Appended. Current bufferEnd: ${bEnd.toFixed(2)}s | Avance: ${(bEnd - current).toFixed(2)}s`);
              }
          }
        });"""

content = content.replace(hls_events, hls_events_new)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Added diagnostics")
