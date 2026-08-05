import re
with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

seek_events = """          onPlaying={(e) => {"""
seek_events_new = """          onSeeking={(e) => {
            console.log(`[PERF DIAGNOSTIC] [${Date.now()}] video.onSeeking. Cible: ${e.currentTarget.currentTime}s`);
            ttfbTimeRef.current = 0; // reset to measure TTFB after seek
          }}
          onSeeked={(e) => {
            console.log(`[PERF DIAGNOSTIC] [${Date.now()}] video.onSeeked. Atteint: ${e.currentTarget.currentTime}s`);
          }}
          onPlaying={(e) => {"""

if "video.onSeeking." not in content:
    content = content.replace(seek_events, seek_events_new)
    
hls_frag_loading = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {"""
hls_frag_loading_new = """        hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Demande de fragment ${data.frag.sn} (début: ${data.frag.start}s)`);
          if (!ttfbTimeRef.current) {
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Attente de TTFB pour ce fragment...`);
          }
        });"""

if "HLS.js: Demande de fragment" not in content:
    content = content.replace(hls_frag_loading, hls_frag_loading_new)

hls_frag_loaded = """        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {"""
hls_frag_loaded_new = """        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Fragment ${data.frag.sn} reçu. Poids: ${data.frag.loaded} bytes`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });"""

if "HLS.js: Fragment" not in content:
    content = content.replace(hls_frag_loaded, hls_frag_loaded_new)
    
with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Added seek logs")
