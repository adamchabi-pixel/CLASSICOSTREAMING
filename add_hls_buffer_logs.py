import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

buffer_event = """        hls.on(Hls.Events.BUFFER_APPENDING, (event: any, data: any) => {
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Appending buffer (type: ${data.type}). Range: [${data.timeOffset}, ${data.timeOffset + (data.chunkMeta?.duration || 0)}]`);
        });"""

if "Hls.Events.BUFFER_APPENDING" not in content:
    # insert it after FRAG_LOADED
    insert_after = """        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          const duration = fragLoadStartTimeRef.current ? performance.now() - fragLoadStartTimeRef.current : 0;
          console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: Fragment ${data.frag.sn} reçu. Poids: ${data.frag.loaded} bytes. Temps de chargement total: ${duration.toFixed(2)}ms`);
          if (!ttfbTimeRef.current) {
             ttfbTimeRef.current = performance.now();
             console.log(`[PERF DIAGNOSTIC] [${Date.now()}] HLS.js: TTFB accompli (fragment reçu) !`);
          }
        });"""
    content = content.replace(insert_after, insert_after + "\n" + buffer_event)
    with open('src/components/CinemaPlayerView.tsx', 'w') as f:
        f.write(content)
print("Added buffer logs")
