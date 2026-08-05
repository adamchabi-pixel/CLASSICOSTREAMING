with open("src/App.tsx", "r") as f:
    content = f.read()

translations = {
    'title: "Le Seigneur des Anneaux"': 'title: "The Lord of the Rings"',
    "description: \"L'adaptation légendaire de l'œuvre d'heroic fantasy de J.R.R. Tolkien par Peter Jackson.\"": 'description: "The legendary adaptation of J.R.R. Tolkien\'s heroic fantasy by Peter Jackson."',
    
    "description: \"Suivez le parcours légendaire du jeune sorcier à lunettes à l'école de magie de Poudlard.\"": 'description: "Follow the legendary journey of the young bespectacled wizard at the Hogwarts School of Witchcraft and Wizardry."',
    
    'title: "Le Parrain"': 'title: "The Godfather"',
    "description: \"La trilogie mythique de Francis Ford Coppola sur l'ascension et la chute de la dynastie mafieuse Corleone.\"": 'description: "Francis Ford Coppola\'s mythical trilogy on the rise and fall of the Corleone mafia dynasty."',
    
    "description: \"Les cascades les plus folles du cinéma d'action et d'espionnage menées par Tom Cruise.\"": 'description: "The craziest stunts in action and spy cinema, led by Tom Cruise."',
    
    "description: \"Les aventures de l'homme-araignée de New York à travers différentes époques et dimensions.\"": 'description: "The adventures of the New York spider-man across different eras and dimensions."',
    
    "description: \"Le summum du survival horrifique spatial et de la science-fiction d'épouvante.\"": 'description: "The pinnacle of space survival horror and sci-fi terror."',
    
    'title: "Retour vers le Futur"': 'title: "Back to the Future"',
    "description: \"Le voyage dans le temps mythique de Marty McFly et Doc Brown à bord de la légendaire DeLorean.\"": 'description: "The mythical time travel of Marty McFly and Doc Brown aboard the legendary DeLorean."',
    
    'title: "(fast and Furious)"': 'title: "Fast and Furious"',
    "description: \"Vitesse, grosses cylindrées, famille et cascades spectaculaires. L'intégrale de la saga légendaire d'action propulsée par Justin Lin.\"": 'description: "Speed, big engines, family and spectacular stunts. The entire legendary action saga driven by Justin Lin."',
    
    "description: `Sélection de films d'auteur catalogués sous la thématique ${genreName}.`": "description: `Selection of auteur films cataloged under the ${genreName} theme.`"
}

for fr, en in translations.items():
    content = content.replace(fr, en)

with open("src/App.tsx", "w") as f:
    f.write(content)
