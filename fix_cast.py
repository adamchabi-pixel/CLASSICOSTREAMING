with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    text = f.read()

old_buttons = """            {/* Cast Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current && (videoRef.current as any).remote && (videoRef.current as any).remote.prompt) {
                  (videoRef.current as any).remote.prompt().catch((err: any) => {
                    console.log("Cast prompt error:", err);
                    alert("Impossible de démarrer le casting. Veuillez vérifier votre appareil.");
                  });
                } else {
                  alert("Le casting (Chromecast) n'est pas supporté directement sur ce navigateur ou aucune cible n'est disponible.");
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Caster l'écran"
            >
              <Cast className="w-5 h-5" />
            </button>

            {/* AirPlay Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
                  (videoRef.current as any).webkitShowPlaybackTargetPicker();
                } else {
                  alert("AirPlay n'est pas supporté sur ce navigateur (nécessite Safari).");
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="AirPlay"
            >
              <Airplay className="w-5 h-5" />
            </button>"""

new_button = """            {/* Cast / AirPlay Unified Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const video = videoRef.current as any;
                if (!video) return;
                
                if (video.webkitShowPlaybackTargetPicker) {
                  video.webkitShowPlaybackTargetPicker();
                } else if (video.remote && video.remote.prompt) {
                  video.remote.prompt().catch((err: any) => {
                    console.log("Cast prompt error:", err);
                    alert("Impossible de démarrer le casting. Veuillez vérifier votre appareil.");
                  });
                } else {
                  alert("Le casting n'est pas supporté directement sur ce navigateur.");
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Caster l'écran"
            >
              <Cast className="w-5 h-5" />
            </button>"""

text = text.replace(old_buttons, new_button)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(text)
