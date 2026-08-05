import re

with open("src/data.ts", "r") as f:
    content = f.read()

# Titles translations
translations = {
    'title: "Épisode I : La Menace fantôme"': 'title: "Episode I: The Phantom Menace"',
    'title: "Épisode II : L\'Attaque des clones"': 'title: "Episode II: Attack of the Clones"',
    'title: "Épisode III : La Revanche des Sith"': 'title: "Episode III: Revenge of the Sith"',
    'title: "Épisode IV : Un nouvel espoir"': 'title: "Episode IV: A New Hope"',
    'title: "Épisode V : L\'Empire contre-attaque"': 'title: "Episode V: The Empire Strikes Back"',
    'title: "Épisode VI : Le Retour du Jedi"': 'title: "Episode VI: Return of the Jedi"',
    'title: "Épisode VII : Le Réveil de la Force"': 'title: "Episode VII: The Force Awakens"',
    'title: "Épisode VIII : Les Derniers Jedi"': 'title: "Episode VIII: The Last Jedi"',
    'title: "Épisode IX : L\'Ascension de Skywalker"': 'title: "Episode IX: The Rise of Skywalker"',
    
    'title: "Terminator Renaissance"': 'title: "Terminator Salvation"',
    'title: "Terminator Le Jugement Dernier"': 'title: "Terminator 2: Judgment Day"',
    'title: "Terminator 2: Le Jugement Dernier"': 'title: "Terminator 2: Judgment Day"',
    'title: "Le Soulèvement des Machines"': 'title: "Terminator 3: Rise of the Machines"',
    'title: "Terminator Genisys"': 'title: "Terminator Genisys"',
    'title: "Terminator Dark Fate"': 'title: "Terminator: Dark Fate"',
    
    'title: "Rocky III, l\'œil du tigre"': 'title: "Rocky III"',
    'title: "Rocky 3 la revanche"': 'title: "Rocky III"',
    'title: "Rocky IV"': 'title: "Rocky IV"',
    'title: "Rocky V"': 'title: "Rocky V"',
    'title: "Rocky Balboa"': 'title: "Rocky Balboa"',
    
    'title: "Les Aventuriers de l\'arche perdue"': 'title: "Raiders of the Lost Ark"',
    'title: "Indiana Jones et le Temple maudit"': 'title: "Indiana Jones and the Temple of Doom"',
    'title: "Indiana Jones et la Dernière Croisade"': 'title: "Indiana Jones and the Last Crusade"',
    'title: "Indiana Jones et le Royaume du crâne de cristal"': 'title: "Indiana Jones and the Kingdom of the Crystal Skull"',
    'title: "Indiana Jones et le Cadran de la destinée"': 'title: "Indiana Jones and the Dial of Destiny"',
    
    'title: "Mourir peut attendre"': 'title: "No Time to Die"',
    'title: "Casino Royale"': 'title: "Casino Royale"',
    'title: "Quantum of Solace"': 'title: "Quantum of Solace"',
    'title: "Skyfall"': 'title: "Skyfall"',
    'title: "007 Spectre"': 'title: "Spectre"',
    'title: "Spectre"': 'title: "Spectre"',
    
    'title: "Dunkerque"': 'title: "Dunkirk"',
    'title: "Le Parrain"': 'title: "The Godfather"',
    'title: "Le Parrain, 2ème partie"': 'title: "The Godfather Part II"',
    'title: "Le Parrain, 3ème partie"': 'title: "The Godfather Part III"',
    
    'title: "Django Unchained"': 'title: "Django Unchained"',
    'title: "Inglourious Basterds"': 'title: "Inglourious Basterds"',
    'title: "Pulp Fiction"': 'title: "Pulp Fiction"',
    'title: "Kill Bill : Volume 1"': 'title: "Kill Bill: Vol. 1"',
    'title: "Kill Bill : Volume 2"': 'title: "Kill Bill: Vol. 2"',
    'title: "Les Huit Salopards"': 'title: "The Hateful Eight"',
    'title: "Reservoir Dogs"': 'title: "Reservoir Dogs"',
}

for fr, en in translations.items():
    content = content.replace(fr, en)

with open("src/data.ts", "w") as f:
    f.write(content)
