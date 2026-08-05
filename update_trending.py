import re

with open('src/data.ts', 'r') as f:
    text = f.read()

michael_match = r'''        symbol: "🎤",
        tagline: "The King of Pop."
      }'''

addition = r''',
      {
        id: "devil-wears-prada-2",
        title: "The Devil Wears Prada 2",
        year: 2025,
        duration: "120 min",
        rating: "N/A",
        director: "Unknown",
        cast: [],
        genre: ["Comedy", "Drama"],
        description: "The highly anticipated sequel.",
        gradient: "from-slate-900 via-neutral-900 to-fuchsia-950/40",
        accentColor: "text-fuchsia-500 border-fuchsia-500/30 bg-fuchsia-500/10",
        accentHex: "#d946ef",
        symbol: "👠",
        tagline: "She's back."
      },
      {
        id: "the-matrix",
        title: "The Matrix",
        year: 1999,
        duration: "136 min",
        rating: "8.7",
        director: "The Wachowskis",
        cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        genre: ["Sci-Fi", "Action"],
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        gradient: "from-slate-900 via-neutral-900 to-green-950/40",
        accentColor: "text-green-500 border-green-500/30 bg-green-500/10",
        accentHex: "#22c55e",
        symbol: "💊",
        tagline: "Welcome to the Real World."
      }'''

text = text.replace(michael_match, michael_match + addition)

with open('src/data.ts', 'w') as f:
    f.write(text)
