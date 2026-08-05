import re

with open("src/App.tsx", "r") as f:
    text = f.read()

replacements = {
    'description: "Séquences spectaculaires, combats intenses et adrénaline pure."': 'description: "Spectacular sequences, intense fights and pure adrenaline."',
    'description: "Explorations lointaines, quêtes épiques et mystères de l\'histoire."': 'description: "Distant explorations, epic quests and mysteries of history."',
    'description: "Futurs extraordinaires, technologies avancées et voyages stellaires."': 'description: "Extraordinary futures, advanced technologies and stellar journeys."',
    'description: "Hommes de l\'ombre, enquêtes sombres et destins coupables."': 'description: "Men in the shadows, dark investigations and guilty fates."',
    'description: "Suspense psychologique, mystères insolubles et tension dramatique."': 'description: "Psychological suspense, unsolvable mysteries and dramatic tension."',
    'description: "Histoires humaines poignantes, relations complexes et destins bouleversants."': 'description: "Poignant human stories, complex relationships and life-changing destinies."',
    'description: "Humour décapant, situations rocambolesques et rires garantis."': 'description: "Dark humor, incredible situations and guaranteed laughs."',
    'description: "Merveilleux univers dessinés, aventures fantastiques pour tous les âges."': 'description: "Wonderful drawn universes, fantastic adventures for all ages."',
    'description: `Rétrospective consacrée à l\'œuvre d\'exception du réalisateur : ${directorName}.`': 'description: `Retrospective dedicated to the exceptional work of director: ${directorName}.`'
}

for fr, en in replacements.items():
    text = text.replace(fr, en)

with open("src/App.tsx", "w") as f:
    f.write(text)
