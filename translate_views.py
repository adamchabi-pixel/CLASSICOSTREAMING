import re

files_to_translate = ["src/components/MovieDetailView.tsx", "src/components/MovieModal.tsx", "src/components/MovieCard.tsx"]

translations = {
    'Distribution': 'Cast',
    'Acteurs principaux :': 'Main Cast:',
    'Regarder': 'Play',
    "Plus d'infos": 'More Info',
    "Plus d'info": 'More Info',
    'BANDE ANNONCE': 'TRAILER',
    'RÉALISATEUR': 'DIRECTOR',
    'FILMS': 'MOVIES'
}

for filepath in files_to_translate:
    try:
        with open(filepath, "r") as f:
            content = f.read()
        
        for fr, en in translations.items():
            content = content.replace(fr, en)
            
        with open(filepath, "w") as f:
            f.write(content)
    except FileNotFoundError:
        pass

