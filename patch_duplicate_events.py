import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

bad_dup = """            onSeeked={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après seeked event : ${video.currentTime}s`);
              console.log(`[SEEK EVENT] seeked - Valeur réelle finale dans le player : ${seekOffset + video.currentTime}s (currentTime locale : ${video.currentTime}s)`);
              setIsBuffering(false);
            }}
            onSeeking={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après seeking event : ${video.currentTime}s`);
              console.log(`[SEEK EVENT] seeking - Valeur cible demandée : ${progress}s (currentTime actuelle : ${video.currentTime}s)`);
              setIsBuffering(true);
            }}"""

content = content.replace(bad_dup, "")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Removed duplicates")
