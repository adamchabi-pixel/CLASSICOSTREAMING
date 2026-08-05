import sys

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """        <button
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            onClose();
          }}
          className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>"""

replacement = """        <button
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            onClose();
          }}
          className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              alert("Pour partager l'écran sur votre TV :\\n\\n• Chrome (PC/Mac) : Cliquez sur le menu (⋮) puis 'Caster...'\\n• iPhone/iPad : Utilisez la recopie de l'écran depuis le Centre de contrôle\\n• Android : Utilisez 'Smart View' ou 'Diffuser l\\'écran'");
            }}
            className="pointer-events-auto px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer flex items-center justify-center backdrop-blur-md gap-2"
            title="Caster sur la TV"
          >
            <Cast className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Caster</span>
          </button>
        </div>
      </div>"""

content = content.replace(target, replacement)

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
