import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# Find the end of the COLLECTIONS array (look for the last "];")
match = re.search(r'\];\s*$', content)
if match:
    new_data = """  },
  {
    id: "mafia-movies",
    title: "Mafia & Gangsters",
    description: "Le monde de la pègre, des affranchis et des cartels. Des récits épiques de pouvoir, de loyauté et de trahison.",
    movies: [
      {
        id: "godfather-1",
        title: "The Godfather",
        year: 1972,
        duration: "175 min",
        rating: "9.2",
        director: "Francis Ford Coppola",
        cast: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
        genre: ["Crime", "Drama"],
        description: "Le patriarche vieillissant d'une dynastie du crime organisé transfère le contrôle de son empire clandestin à son fils réticent.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "Une offre qu'on ne peut pas refuser."
      },
      {
        id: "goodfellas",
        title: "Goodfellas",
        year: 1990,
        duration: "145 min",
        rating: "8.7",
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci", "Lorraine Bracco"],
        genre: ["Biography", "Crime", "Drama"],
        description: "L'histoire de Henry Hill et de sa vie au sein de la mafia, couvrant sa relation avec sa femme Karen Hill et ses partenaires mafieux Jimmy Conway et Tommy DeVito.",
        gradient: "from-red-950 via-neutral-900 to-stone-950",
        accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
        accentHex: "#ef4444",
        symbol: "🍝🔫🚁",
        tagline: "Aussi loin que je me souvienne, j'ai toujours voulu être un gangster."
      },
      {
        id: "scarface",
        title: "Scarface",
        year: 1983,
        duration: "170 min",
        rating: "8.3",
        director: "Brian De Palma",
        cast: ["Al Pacino", "Michelle Pfeiffer", "Steven Bauer", "Mary Elizabeth Mastrantonio"],
        genre: ["Crime", "Drama"],
        description: "En 1980, un immigrant cubain arrive à Miami sans rien et finit par devenir un puissant caïd de la drogue.",
        gradient: "from-slate-900 via-rose-950/40 to-black",
        accentColor: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        accentHex: "#f43f5e",
        symbol: "💰🌴🔫",
        tagline: "Le monde est à toi."
      },
      {
        id: "casino",
        title: "Casino",
        year: 1995,
        duration: "178 min",
        rating: "8.2",
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Sharon Stone", "Joe Pesci", "James Woods"],
        genre: ["Crime", "Drama"],
        description: "L'histoire de l'ambition aveugle et de la cupidité qui ont mené à la chute d'un empire du jeu mafieux.",
        gradient: "from-yellow-950 via-stone-900 to-black",
        accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
        accentHex: "#eab308",
        symbol: "🎰🎲💼",
        tagline: "Personne ne reste éternellement au sommet."
      }
    ]
  },
  {
    id: "mind-bending-mysteries",
    title: "Enquêtes & Mystères",
    description: "Des thrillers psychologiques glaçants, des meurtres sordides et des retournements de situation qui vous laisseront sans voix.",
    movies: [
      {
        id: "se7en",
        title: "Se7en",
        year: 1995,
        duration: "127 min",
        rating: "8.6",
        director: "David Fincher",
        cast: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow", "Kevin Spacey"],
        genre: ["Crime", "Drama", "Mystery"],
        description: "Deux détectives, un vétéran et une recrue, traquent un tueur en série dont les crimes sont basés sur les sept péchés capitaux.",
        gradient: "from-stone-900 via-yellow-950/20 to-black",
        accentColor: "text-stone-400 border-stone-400/30 bg-stone-400/10",
        accentHex: "#a8a29e",
        symbol: "📦🌧️🔍",
        tagline: "Qu'est-ce qu'il y a dans la boîte ?"
      },
      {
        id: "memento",
        title: "Memento",
        year: 2000,
        duration: "113 min",
        rating: "8.4",
        director: "Christopher Nolan",
        cast: ["Guy Pearce", "Carrie-Anne Moss", "Joe Pantoliano", "Mark Boone Junior"],
        genre: ["Mystery", "Thriller"],
        description: "Un homme souffrant d'amnésie antérograde (perte de la mémoire à court terme) utilise des notes et des tatouages pour traquer le meurtrier de sa femme.",
        gradient: "from-slate-900 via-indigo-950/30 to-black",
        accentColor: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
        accentHex: "#818cf8",
        symbol: "📸🖊️🧠",
        tagline: "Certains souvenirs sont meilleurs oubliés."
      },
      {
        id: "zodiac",
        title: "Zodiac",
        year: 2007,
        duration: "157 min",
        rating: "7.7",
        director: "David Fincher",
        cast: ["Jake Gyllenhaal", "Robert Downey Jr.", "Mark Ruffalo", "Anthony Edwards"],
        genre: ["Crime", "Drama", "Mystery"],
        description: "L'histoire vraie de la traque du tueur du Zodiaque, un meurtrier en série qui terrorisa la baie de San Francisco à la fin des années 60 et 70.",
        gradient: "from-stone-950 via-zinc-900 to-black",
        accentColor: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
        accentHex: "#a1a1aa",
        symbol: "🗞️🕵️‍♂️✉️",
        tagline: "Il n'y a pas de fin à l'obsession."
      },
      {
        id: "prisoners",
        title: "Prisoners",
        year: 2013,
        duration: "153 min",
        rating: "8.1",
        director: "Denis Villeneuve",
        cast: ["Hugh Jackman", "Jake Gyllenhaal", "Viola Davis", "Maria Bello"],
        genre: ["Crime", "Drama", "Mystery"],
        description: "Lorsque la fille de Keller Dover est kidnappée avec son amie, il prend les choses en main alors que la police explore de multiples pistes sans succès.",
        gradient: "from-neutral-950 via-stone-900 to-black",
        accentColor: "text-stone-300 border-stone-300/30 bg-stone-300/10",
        accentHex: "#d6d3d1",
        symbol: "❄️🚐🔎",
        tagline: "Chaque moment compte."
      }
    ]
];"""
    
    # replace the last "];" with our new content
    new_content = content[:match.start()] + new_data + content[match.end():]
    
    with open('src/data.ts', 'w') as f:
        f.write(new_content)
    print("Successfully added new collections!")
else:
    print("Could not find the end of COLLECTIONS array.")
