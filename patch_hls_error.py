import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

bad_rec = """              if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
                hls.recoverMediaError();
                return;
              }"""
good_rec = """              if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
                console.log(`[HLS DIAGNOSTIC] [${Date.now()}] ⚠️ Erreur HLS récupérable détectée : ${data.details} (${data.type})`);
                hls.recoverMediaError();
                return;
              }"""
content = content.replace(bad_rec, good_rec)

bad_rec2 = """          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            hls.recoverMediaError();
            return;
          }"""
good_rec2 = """          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            console.log(`[HLS DIAGNOSTIC] [${Date.now()}] ⚠️ Erreur HLS récupérable détectée : ${data.details} (${data.type})`);
            hls.recoverMediaError();
            return;
          }"""
content = content.replace(bad_rec2, good_rec2)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Added diagnostic to HLS error recovery")
