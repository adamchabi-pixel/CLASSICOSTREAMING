import re

with open('src/data.ts', 'r') as f:
    text = f.read()

new_collection = """
  {
    id: "trending-now",
    title: "TRENDING NOW",
    description: "The most watched and highly anticipated movies right now.",
    movies: [
      {
        id: "obsession",
        title: "Obsession",
        year: 2025,
        duration: "115 min",
        rating: "8.1",
        director: "Unknown",
        cast: [],
        genre: ["Thriller"],
        description: "A gripping tale of obsession and consequence.",
        gradient: "from-slate-900 via-neutral-900 to-rose-950/40",
        accentColor: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        accentHex: "#f43f5e",
        symbol: "🔥",
        tagline: "Desire has a price."
      },
      {
        id: "devil-wears-prada-2",
        title: "Devil Wears Prada 2",
        year: 2026,
        duration: "120 min",
        rating: "7.8",
        director: "David Frankel",
        cast: ["Meryl Streep", "Anne Hathaway", "Emily Blunt"],
        genre: ["Comedy", "Drama"],
        description: "Miranda Priestly and Andy Sachs navigate a new media landscape.",
        gradient: "from-slate-900 via-neutral-900 to-amber-950/40",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "👠",
        tagline: "Fashion never dies."
      },
      {
        id: "backrooms",
        title: "Backrooms",
        year: 2025,
        duration: "105 min",
        rating: "7.5",
        director: "Kane Parsons",
        cast: [],
        genre: ["Horror", "Sci-Fi"],
        description: "Trapped in an endless maze of office rooms, survival is not guaranteed.",
        gradient: "from-slate-900 via-neutral-900 to-yellow-950/40",
        accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
        accentHex: "#eab308",
        symbol: "🚪",
        tagline: "Don't clip out of reality."
      },
      {
        id: "michael",
        title: "Michael",
        year: 2025,
        duration: "130 min",
        rating: "8.5",
        director: "Antoine Fuqua",
        cast: ["Jaafar Jackson"],
        genre: ["Biography", "Music", "Drama"],
        description: "The life and legacy of the King of Pop, Michael Jackson.",
        gradient: "from-slate-900 via-neutral-900 to-blue-950/40",
        accentColor: "text-blue-500 border-blue-500/30 bg-blue-500/10",
        accentHex: "#3b82f6",
        symbol: "🎤",
        tagline: "The King of Pop."
      }
    ]
  },
"""

# insert after export const COLLECTIONS: Collection[] = [
text = text.replace('export const COLLECTIONS: Collection[] = [', 'export const COLLECTIONS: Collection[] = [\n' + new_collection)

with open('src/data.ts', 'w') as f:
    f.write(text)
