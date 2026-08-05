import re

def process_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Replace Cast Button logic
    # Find the Cast button block
    cast_regex = re.compile(r'\{\/\* Cast Button \*\/\}[\s\S]*?<Cast className="w-5 h-5" \/>\s*<\/button>\s*(?:\}\s*\))?')
    
    new_cast = """{/* Cast Button */}
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
            </button>"""
    
    if cast_regex.search(content):
        content = cast_regex.sub(new_cast, content)
        print(f"Patched Cast in {filepath}")
        
    # Replace AirPlay Button logic
    airplay_regex = re.compile(r'\{\/\* AirPlay Control \*\/\}[\s\S]*?<Airplay className="w-5 h-5" \/>\s*<\/button>\s*(?:\}\s*\))?')
    
    new_airplay = """{/* AirPlay Control */}
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
            
    if airplay_regex.search(content):
        content = airplay_regex.sub(new_airplay, content)
        print(f"Patched AirPlay in {filepath}")

    with open(filepath, "w") as f:
        f.write(content)

process_file("src/components/VideoPlayer.tsx")
process_file("src/components/CinemaPlayerView.tsx")
