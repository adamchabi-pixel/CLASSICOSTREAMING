import re

with open("src/data.ts", "r") as f:
    text = f.read()

replacements = {
    # Genres
    '"Science-Fiction"': '"Science Fiction"',
    '"Drame"': '"Drama"',
    '"Aventure"': '"Adventure"',
    '"Guerre"': '"War"',
    '"Histoire"': '"History"',
    '"Espionnage"': '"Espionage"',
    '"Comédie"': '"Comedy"',
    '"Biopic"': '"Biography"',
    '"Guerre"': '"War"',
    '"Famille"': '"Family"',
    
    # Collections titles
    'title: "La Saga Matrix"': 'title: "The Matrix Saga"',
    'title: "Le Parrain"': 'title: "The Godfather"',
    
    # Titles already done in previous script but let's add some missing ones
    'title: "John Wick: Chapitre 2"': 'title: "John Wick: Chapter 2"',
    'title: "John Wick: Parabellum"': 'title: "John Wick: Chapter 3 - Parabellum"',
    'title: "John Wick: Chapitre 4"': 'title: "John Wick: Chapter 4"',
    'title: "Les Aventuriers de l\'arche perdue"': 'title: "Raiders of the Lost Ark"',
    'title: "Les Aventuriers de l\'Arche perdue"': 'title: "Raiders of the Lost Ark"',
    
    # Tarantino
    'title: "Pulp Fiction"': 'title: "Pulp Fiction"',
    'title: "Kill Bill : Volume 1"': 'title: "Kill Bill: Vol. 1"',
    'title: "Kill Bill : Volume 2"': 'title: "Kill Bill: Vol. 2"',
    'title: "Inglourious Basterds"': 'title: "Inglourious Basterds"',
    'title: "Django Unchained"': 'title: "Django Unchained"',
    'title: "Les Huit Salopards"': 'title: "The Hateful Eight"',
    'title: "Reservoir Dogs"': 'title: "Reservoir Dogs"',
}

for fr, en in replacements.items():
    text = text.replace(fr, en)

with open("src/data.ts", "w") as f:
    f.write(text)
