export interface Movie {
  trailerUrl?: string;
  originalLanguage?: string;
  similar?: any[];
  hasLogo?: boolean;
  logoUrl?: string;
  id: string;
  isIframeEmbed?: boolean;
  iframeSrc?: string;
  title: string;
  year: number;
  duration: string;
  voteAverage?: number;
  rating: string;
  director: string;
  cast: string[];
  castDetails?: { id: string; name: string; role?: string; imageUrl?: string; }[];
  genre: string[];
  description?: string;
  gradient?: string; // Tailwind gradient colors e.g., 'from-slate-900 to-indigo-950'
  accentColor?: string; // Tailwind text/border e.g., 'text-indigo-400 font-bold border-indigo-400'
  accentHex?: string; // Hex code for custom badges and glows
  symbol?: string; // Emoji symbols reflecting theme for graphic poster layout
  tagline?: string;
  streamUrl?: string;
  posterUrl?: string;
  backdropUrl?: string;
  isJellyfin?: boolean;
  customCategory?: string;
  tmdbId?: string;
  imdbId?: string;
  originalTitle?: string;
  studios?: string[];
  providerIds?: Record<string, string>;
  isTv?: boolean;
  seasons?: { season_number: number, name: string, episode_count: number, posterUrl?: string }[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  movies: Movie[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: "comedy-gold",
    title: "Best Comedy Gold",
    description: "The most hilarious, iconic, and rewatchable comedy masterpieces of all time.",
    movies: [
      {
        id: "21-jump-street",
        title: "21 Jump Street",
        posterUrl: "https://image.tmdb.org/t/p/w500/q3UeqQ2I3L1m6K0rL6W3d8wP9E1.jpg",
        year: 2012,
        duration: "109 min",
        rating: "7.2",
        director: "Phil Lord, Christopher Miller",
        cast: ["Jonah Hill", "Channing Tatum", "Ice Cube"],
        genre: ["Action", "Comedy", "Crime"],
      },
      {
        id: "22-jump-street",
        title: "22 Jump Street",
        posterUrl: "https://image.tmdb.org/t/p/w500/40wV3Y8JbT97U0oF9R5TiyA4LqA.jpg",
        year: 2014,
        duration: "112 min",
        rating: "7.0",
        director: "Phil Lord, Christopher Miller",
        cast: ["Jonah Hill", "Channing Tatum", "Ice Cube"],
        genre: ["Action", "Comedy", "Crime"],
      },
      {
        id: "superbad",
        title: "Superbad",
        posterUrl: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2VNqjv6V1W1J3iA.jpg",
        year: 2007,
        duration: "113 min",
        rating: "7.6",
        director: "Greg Mottola",
        cast: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse"],
        genre: ["Comedy"],
      },
      {
        id: "grown-ups",
        title: "Grown Ups",
        posterUrl: "https://image.tmdb.org/t/p/w500/q7k7eJ7ZkYk5E9Zf8D4bZ6fP6O5.jpg",
        year: 2010,
        duration: "102 min",
        rating: "5.9",
        director: "Dennis Dugan",
        cast: ["Adam Sandler", "Kevin James", "Chris Rock"],
        genre: ["Comedy"],
      },
      {
        id: "white-chicks",
        title: "White Chicks",
        posterUrl: "https://image.tmdb.org/t/p/w500/vXvU2wB5T7u2i6E5F8M4b0u4Q5Q.jpg",
        year: 2004,
        duration: "109 min",
        rating: "5.8",
        director: "Keenen Ivory Wayans",
        cast: ["Marlon Wayans", "Shawn Wayans", "Busy Philipps"],
        genre: ["Comedy", "Crime"],
      }
    ]
  },


  {
    id: "trending-now",
    title: "TRENDING NOW",
    description: "The most watched and highly anticipated movies right now.",
    movies: [
      {
        id: "df874a8ad2ee97ac6649de109d956ecc",
        tmdbId: "238",
        imdbId: "tt0068646",
        title: "The Godfather",
        originalTitle: "The Godfather",
        description: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
        posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
        year: 1972,
        duration: "175 min",
        rating: "8.7",
        voteAverage: 8.7,
        director: "Francis Ford Coppola",
        cast: ["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"],
        genre: ["Drama", "Crime"],
        gradient: "from-slate-900 via-neutral-900 to-amber-950/40",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹",
        tagline: "An offer you can't refuse.",
        hasLogo: true,
        logoUrl: "https://image.tmdb.org/t/p/w500/kysDTCloxUPJ1BILI4f8gs74fcr.png"
      },
      {
        id: "1e8fe32397616349200d205fb3817f32",
        tmdbId: "11423",
        imdbId: "tt0353969",
        title: "Memories of Murder",
        originalTitle: "살인의 추억",
        description: "A sadistic serial rapist and murderer of young women terrorizes a small province in 1980s South Korea. To prevent further crimes, three increasingly desperate detectives with conflicting methods race against time to unravel the violent mind of the killer in a futile effort to solve the case.",
        posterUrl: "https://image.tmdb.org/t/p/w500/jcgUjx1QcupGzjntTVlnQ15lHqy.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/6Kn6qW3an3DkPl3MahWemTzrjCt.jpg",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        voteAverage: 8.1,
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roi-ha", "Song Jae-ho"],
        genre: ["Crime", "Drama", "Thriller"],
        gradient: "from-slate-900 via-neutral-900 to-emerald-950/40",
        accentColor: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
        accentHex: "#10b981",
        symbol: "🔍",
        tagline: "The worst of them will stay with you... forever.",
        hasLogo: true,
        logoUrl: "https://image.tmdb.org/t/p/w500/uzVGePBZLsdzeMUJArknO5TsB78.png"
      },
      {
        id: "37f36d9baf5cf8ab24ae1777871b9d3b",
        tmdbId: "807",
        imdbId: "tt0114369",
        title: "Se7en",
        originalTitle: "Se7en",
        description: "Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the \"seven deadly sins\" in this dark and haunting film that takes viewers from the tortured remains of one victim to the next. The seasoned Det. Somerset researches each sin in an effort to get inside the killer's mind, while his novice partner, Mills, scoffs at his efforts to unravel the case.",
        posterUrl: "https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/i5H7zusQGsysGQ8i6P361Vnr0n2.jpg",
        year: 1995,
        duration: "127 min",
        rating: "8.4",
        voteAverage: 8.4,
        director: "David Fincher",
        cast: ["Morgan Freeman", "Brad Pitt", "Gwyneth Paltrow", "John Cassini"],
        genre: ["Crime", "Mystery", "Thriller"],
        gradient: "from-slate-900 via-neutral-900 to-red-950/40",
        accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
        accentHex: "#ef4444",
        symbol: "📦",
        tagline: "Gluttony. Greed. Sloth. Envy. Wrath. Pride. Lust.",
        hasLogo: true,
        logoUrl: "https://image.tmdb.org/t/p/w500/zVyZvT1zVO7GIk65RlcOx5KdAN.png"
      },
      {
        id: "tt22084616",
        tmdbId: "969681",
        imdbId: "tt22084616",
        title: "Spider-Man: Brand New Day",
        originalTitle: "Spider-Man: Brand New Day",
        description: "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        posterUrl: "https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/vjMvFSmGUxEtqVdaZgvFee9XkZl.jpg",
        year: 2026,
        duration: "145 min",
        rating: "8.1",
        voteAverage: 8.1,
        director: "Destin Daniel Cretton",
        cast: ["Tom Holland", "Zendaya", "Sadie Sink", "Jacob Batalon"],
        genre: ["Science Fiction", "Action", "Adventure"],
        gradient: "from-slate-900 via-neutral-900 to-blue-950/40",
        accentColor: "text-blue-500 border-blue-500/30 bg-blue-500/10",
        accentHex: "#3b82f6",
        symbol: "🕷️",
        tagline: "A brand new day begins.",
        hasLogo: true,
        logoUrl: "https://image.tmdb.org/t/p/w500/vbZcDHC5IFylYuRnp3eyOs5rTV1.png",
        isIframeEmbed: true,
        iframeSrc: "https://player.videasy.to/movie/tt22084616"
      },
      {
        id: "e2fb5ddd828a899024cfba73f4d5b5c9",
        tmdbId: "111",
        imdbId: "tt0086250",
        title: "Scarface",
        originalTitle: "Scarface",
        description: "After getting a green card in exchange for assassinating a Cuban government official, Tony Montana stakes a claim on the drug trade in Miami. Viciously murdering anyone who stands in his way, Tony eventually becomes the biggest drug lord in the state, controlling nearly all the cocaine that comes through Miami. But increased pressure from the police, wars with Colombian drug cartels and his own drug-fueled paranoia serve to fuel the flames of his eventual downfall.",
        posterUrl: "https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/1qM2BYNE11Viby8ImC9LC00DgDr.jpg",
        year: 1983,
        duration: "170 min",
        rating: "8.2",
        voteAverage: 8.2,
        director: "Brian De Palma",
        cast: ["Al Pacino", "Steven Bauer", "Michelle Pfeiffer", "Mary Elizabeth Mastrantonio"],
        genre: ["Action", "Crime", "Drama"],
        gradient: "from-slate-900 via-neutral-900 to-rose-950/40",
        accentColor: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        accentHex: "#f43f5e",
        symbol: "🔫",
        tagline: "He loved the American Dream. With a vengeance.",
        hasLogo: true,
        logoUrl: "https://image.tmdb.org/t/p/w500/zQGDFzjfXC47foVucagHYIxRUfW.png"
      },
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

  
  {
    id: "indiana-jones",
    title: "Indiana Jones",
    description: "The whip, the hat and the mysteries of history. Follow the greatest archaeologist-adventurer of all time.",
    movies: [
      {
        id: "indy-1",
        title: "Raiders of the Lost Ark",
        year: 1981,
        duration: "115 min",
        rating: "8.4",
        director: "Steven Spielberg",
        cast: ["Harrison Ford", "Karen Allen", "Paul Freeman", "John Rhys-Davies"],
        genre: ["Adventure", "Action"],
        description: "Indy is tasked with a perilous mission by US intelligence: to find the Ark of the Covenant, a chest containing the Tablets of the Law, coveted by the Nazis for its supposed military invincibility.",
        gradient: "from-neutral-900 via-amber-950/30 to-amber-950/40",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🤠📜🏺",
        tagline: "The quest for the impossible starts here."
      },
      {
        id: "indy-2",
        title: "Indiana Jones and the Temple of Doom",
        year: 1984,
        duration: "118 min",
        rating: "7.5",
        director: "Steven Spielberg",
        cast: ["Harrison Ford", "Kate Capshaw", "Ke Huy Quan", "Amrish Puri"],
        genre: ["Adventure", "Action"],
        description: "In India, Indiana Jones, a clever young boy named Short Round, and a cabaret singer find themselves in an impoverished village. The locals beg them to retrieve a sacred mystical stone stolen by a bloodthirsty cult.",
        gradient: "from-neutral-900 via-red-950/30 to-amber-950/40",
        accentColor: "text-red-400 border-red-400/30 bg-red-400/10",
        accentHex: "#f87171",
        symbol: "🏮🛒💎",
        tagline: "An adventure of absolute mystical darkness."
      },
      {
        id: "indy-3",
        title: "Indiana Jones and the Last Crusade",
        year: 1989,
        duration: "127 min",
        rating: "8.2",
        director: "Steven Spielberg",
        cast: ["Harrison Ford", "Sean Connery", "Alison Doody", "Denholm Elliott"],
        genre: ["Adventure", "Action"],
        description: "Indiana Jones sets out on the trail of his father, Professor Henry Jones, who mysteriously disappeared while searching for the legendary Holy Grail. Together, father and son unite to overcome millennial trials.",
        gradient: "from-neutral-900 via-amber-950/30 to-yellow-950/40",
        accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
        accentHex: "#eab308",
        symbol: "🏆🛡️⚔️",
        tagline: "The Grail only awaits pure hearts."
      },
      {
        id: "indy-4",
        title: "Indiana Jones et le Royaume du Crâne de Cristal",
        year: 2008,
        duration: "122 min",
        rating: "6.2",
        director: "Steven Spielberg",
        cast: ["Harrison Ford", "Cate Blanchett", "Shia LaBeouf", "Karen Allen"],
        genre: ["Adventure", "Science Fiction"],
        description: "In 1957, during the Cold War, Indiana Jones becomes entangled in a Soviet plot to uncover the secret behind a mysterious crystal skull discovered in the Amazon.",
        gradient: "from-neutral-900 via-emerald-950/30 to-teal-950/40",
        accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
        accentHex: "#34d399",
        symbol: "👽💀🌴",
        tagline: "The secret of the Amazon transcends our world."
      },
      {
        id: "indy-5",
        title: "Indiana Jones et le Cadran de la Destinée",
        year: 2023,
        duration: "154 min",
        rating: "6.6",
        director: "James Mangold",
        cast: ["Harrison Ford", "Phoebe Waller-Bridge", "Mads Mikkelsen", "Antonio Banderas"],
        genre: ["Adventure", "Action"],
        description: "In 1969, against the backdrop of the space race, the famous archaeologist prepares to retire. But the appearance of his goddaughter Helena and a former Nazi working for NASA plunges him back into a race against time.",
        gradient: "from-neutral-900 via-yellow-950/20 to-stone-900",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#ca8a04",
        symbol: "⚙️🕰️✈️",
        tagline: "Against time, the ultimate journey begins."
      }
    ]
  },
  {
    id: "tarantino-collection",
    title: "Quentin Tarantino",
    description: "Punchy dialogue, stylized violence and unforgettable soundtracks. The unique work of master Quentin Tarantino.",
    movies: [
]
  },
  {
    id: "christopher-nolan",
    title: "Christopher Nolan",
    description: "Distorted time, fragmented reality and visions of unparalleled scale. The conceptual cinema of Christopher Nolan.",
    movies: [
]
  },
  {
    id: "star-wars",
    title: "Star Wars",
    description: "The legendary space saga. An eternal struggle between the Force and the Dark Side across the galaxy.",
    movies: [
]
  },
  {
    id: "james-bond",
    title: "James Bond",
    description: "British composure, high-tech gadgets and a license to kill. The greatest missions of the iconic spy.",
    movies: [
]
  },
  {
    id: "rocky",
    title: "Rocky",
    description: "The fight of a lifetime. The inspiring rise of the Italian Stallion from a humble Philadelphia neighborhood to the top of the world.",
    movies: [
      {
        id: "rocky-1",
        title: "Rocky",
        year: 1976,
        duration: "120 min",
        rating: "8.1",
        director: "John G. Avildsen",
        cast: ["Sylvester Stallone", "Talia Shire", "Burt Young", "Carl Weathers"],
        genre: ["Sport", "Drama"],
        description: "Rocky Balboa, a boxer from a seedy Philadelphia club accumulating debts, is offered by a stroke of destiny to face the undefeated world champion Apollo Creed for a historic main event.",
        gradient: "from-neutral-900 via-amber-950/30 to-zinc-900",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🥊🏃🥩",
        tagline: "Everyone deserves a chance at glory."
      },
      {
        id: "rocky-2",
        title: "Rocky II",
        year: 1979,
        duration: "119 min",
        rating: "7.3",
        director: "Sylvester Stallone",
        cast: ["Sylvester Stallone", "Talia Shire", "Burt Young", "Carl Weathers"],
        genre: ["Sport", "Drama"],
        description: "After heroically going the distance against world champion Apollo Creed, the public demands a spectacular rematch. Rocky Balboa first tries to settle down with his family before returning to the ring.",
        gradient: "from-neutral-900 via-stone-900 to-amber-950/20",
        accentColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
        accentHex: "#facc15",
        symbol: "💍🦁👊",
        tagline: "A rematch the whole world was waiting for."
      },
      {
        id: "rocky-3",
        title: "Rocky III",
        year: 1982,
        duration: "99 min",
        rating: "6.9",
        director: "Sylvester Stallone",
        cast: ["Sylvester Stallone", "Talia Shire", "Burt Young", "Mr. T"],
        genre: ["Sport", "Drama"],
        description: "Rocky has rested on his laurels and suffers a crushing knockout defeat to the fierce and arrogant Clubber Lang. Apollo Creed, his former rival, steps up as an unexpected mentor to give him back the 'eye of the tiger'.",
        gradient: "from-neutral-900 via-amber-950/30 to-neutral-950",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#ca8a04",
        symbol: "🐯🏆⚡",
        tagline: "Rediscover the will to win."
      },
      {
        id: "rocky-4",
        title: "Rocky IV",
        year: 1985,
        duration: "91 min",
        rating: "6.9",
        director: "Sylvester Stallone",
        cast: ["Sylvester Stallone", "Talia Shire", "Carl Weathers", "Dolph Lundgren"],
        genre: ["Sport", "Drama"],
        description: "When his lifelong friend Apollo Creed dies tragically in the ring killed by the ruthless Soviet colossus Ivan Drago, Rocky Balboa decides to train hard in the heart of the wild Siberia to face him in Moscow.",
        gradient: "from-blue-950/40 via-red-950/30 to-neutral-900",
        accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
        accentHex: "#ef4444",
        symbol: "🧥❄️🇷🇺",
        tagline: "A fight that transcends geopolitical borders."
      },
      {
        id: "rocky-5",
        title: "Rocky V",
        year: 1990,
        duration: "104 min",
        rating: "5.3",
        director: "John G. Avildsen",
        cast: ["Sylvester Stallone", "Talia Shire", "Burt Young", "Tommy Morrison"],
        genre: ["Sport", "Drama"],
        description: "Financially ruined and forced to retire from boxing due to physical aftereffects, Rocky returns to the Philadelphia suburbs and trains a fiery young prodigy named Tommy Gunn.",
        gradient: "from-neutral-900 via-zinc-950 to-stone-900",
        accentColor: "text-neutral-400 border-neutral-400/30 bg-neutral-400/10",
        accentHex: "#94a3b8",
        symbol: "🏚️👦🏼🧥",
        tagline: "The real fight isn't in the ring."
      },
      {
        id: "rocky-6",
        title: "Rocky Balboa",
        year: 2006,
        duration: "102 min",
        rating: "7.1",
        director: "Sylvester Stallone",
        cast: ["Sylvester Stallone", "Burt Young", "Antonio Tarver", "Geraldine Hughes"],
        genre: ["Sport", "Drama"],
        description: "Owning a modest restaurant, Rocky still suffers from Adrian's death. When a TV simulation declares him the virtual winner of the current champion, Rocky agrees to don the gloves again for a final rematch of honor.",
        gradient: "from-stone-950 via-neutral-900 to-amber-950/15",
        accentColor: "text-amber-400 border-amber-400/30 bg-amber-400/10",
        accentHex: "#fbbf24",
        symbol: "🍽️🐕🏟️",
        tagline: "It's about how hard you can get hit and keep moving forward."
      }
    ]
  },
  {
    id: "terminator",
    title: "Terminator",
    description: "Human resistance against the uprising of Skynet and cyborgs. A time loop of pure cybernetic action.",
    movies: [
      {
        id: "terminator-1",
        title: "Terminator",
        year: 1984,
        duration: "107 min",
        rating: "8.1",
        director: "James Cameron",
        cast: ["Arnold Schwarzenegger", "Linda Hamilton", "Michael Biehn"],
        genre: ["Science Fiction", "Action"],
        description: "In 1984, a cold cybernetic assassin created by Skynet - the T-800 - is sent from 2029 to kill Sarah Connor, whose unborn son John will lead humanity to victory in a future war against the machines.",
        gradient: "from-blue-950/50 via-neutral-900 to-slate-900",
        accentColor: "text-blue-400 border-blue-400/30 bg-blue-400/10",
        accentHex: "#60a5fa",
        symbol: "🕶️🏍️🚨",
        tagline: "I'll be back."
      },
      {
        id: "terminator-2",
        title: "Terminator 2: Judgment Day",
        year: 1991,
        duration: "137 min",
        rating: "8.6",
        director: "James Cameron",
        cast: ["Arnold Schwarzenegger", "Linda Hamilton", "Edward Furlong", "Robert Patrick"],
        genre: ["Science Fiction", "Action"],
        description: "A reprogrammed muscular T-800 is sent by the human resistance to protect a young John Connor from a highly advanced and nearly indestructible liquid metal cyborg: the T-1000.",
        gradient: "from-blue-950 via-zinc-900 to-amber-950/10",
        accentColor: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
        accentHex: "#22d3ee",
        symbol: "🕶️🧪⛓️",
        tagline: "Hasta la vista, baby."
      },
      {
        id: "terminator-3",
        title: "Terminator 3: Rise of the Machines",
        year: 2003,
        duration: "109 min",
        rating: "6.3",
        director: "Jonathan Mostow",
        cast: ["Arnold Schwarzenegger", "Nick Stahl", "Claire Danes", "Kristanna Loken"],
        genre: ["Science Fiction", "Action"],
        description: "John Connor now lives off the grid to avoid detection. Unfortunately, Skynet manages to send the formidable T-X, a superpowered assassin, while an aging T-850 attempts to protect him.",
        gradient: "from-neutral-900 via-stone-900 to-red-950/30",
        accentColor: "text-red-400 border-red-400/30 bg-red-400/10",
        accentHex: "#f87171",
        symbol: "🔌💥👩‍🎤",
        tagline: "The awakening of the end of the world."
      },
      {
        id: "terminator-4",
        title: "Terminator Salvation",
        year: 2009,
        duration: "115 min",
        rating: "6.5",
        director: "McG",
        cast: ["Christian Bale", "Sam Worthington", "Moon Bloodgood", "Helena Bonham Carter"],
        genre: ["Science Fiction", "Action", "War"],
        description: "In 2018, after the cataclysm of Judgment Day, John Connor relentlessly leads the human resistance. He is confronted by Marcus Wright, a mysterious cybernetic death row inmate who believes he is still human.",
        gradient: "from-neutral-900 via-stone-950 to-neutral-800",
        accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
        accentHex: "#34d399",
        symbol: "🛩️⚙️🤖",
        tagline: "The beginning of the end for Skynet."
      },
      {
        id: "terminator-5",
        title: "Terminator Genisys",
        year: 2015,
        duration: "126 min",
        rating: "6.3",
        director: "Alan Taylor",
        cast: ["Arnold Schwarzenegger", "Jason Clarke", "Emilia Clarke", "Jai Courtney"],
        genre: ["Science Fiction", "Action"],
        description: "By sending Kyle Reese back to 1984 to save Sarah, John triggers a temporal distortion. Reese arrives in a fractured past where Sarah Connor, raised by a protective T-800, is already a seasoned fighter.",
        gradient: "from-indigo-950/30 via-neutral-900 to-slate-950",
        accentColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
        accentHex: "#c084fc",
        symbol: "🧭🌀🛡️",
        tagline: "Reset the future."
      },
      {
        id: "terminator-6",
        title: "Terminator: Dark Fate",
        year: 2019,
        duration: "128 min",
        rating: "6.2",
        director: "Tim Miller",
        cast: ["Linda Hamilton", "Arnold Schwarzenegger", "Mackenzie Davis", "Natalia Reyes"],
        genre: ["Science Fiction", "Action"],
        description: "Nearly thirty years after Sarah Connor saved the world, an augmented human arrives to protect a young Mexican factory worker hunted by a highly advanced, separable Terminator prototype, the Rev-9.",
        gradient: "from-zinc-900 via-neutral-900 to-rose-950/20",
        accentColor: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        accentHex: "#f43f5e",
        symbol: "🌪️💀🔫",
        tagline: "Welcome to the day after Judgment Day."
      }
    ]
  },
  
  {
    id: "mafia-movies",
    title: "Mafia",
    description: "The world of the underworld, goodfellas and cartels. Epic tales of power, loyalty and betrayal.",
    movies: [
      {
        id: "godfather-1",
        tmdbId: "238",
        imdbId: "tt0068646",
        title: "The Godfather",
        year: 1972,
        duration: "175 min",
        rating: "9.2",
        director: "Francis Ford Coppola",
        cast: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
        genre: ["Crime", "Drama"],
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "An offer you can't refuse."
      },
      {
        id: "bronx-tale",
        tmdbId: "1607",
        imdbId: "tt0106489",
        title: "A Bronx Tale",
        originalTitle: "A Bronx Tale",
        year: 1993,
        duration: "121 min",
        rating: "7.8",
        director: "Robert De Niro",
        cast: ["Robert De Niro", "Chazz Palminteri", "Lillo Brancato"],
        genre: ["Crime", "Drama"],
      },
      {
        id: "goodfellas",
        tmdbId: "769",
        imdbId: "tt0099685",
        title: "Goodfellas",
        year: 1990,
        duration: "145 min",
        rating: "8.7",
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci", "Lorraine Bracco"],
        genre: ["Biography", "Crime", "Drama"],
        description: "The story of Henry Hill and his life in the mafia, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
        gradient: "from-red-950 via-neutral-900 to-stone-950",
        accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
        accentHex: "#ef4444",
        symbol: "🍝🔫🚁",
        tagline: "As far back as I can remember, I always wanted to be a gangster."
      },
      {
        id: "scarface",
        tmdbId: "111",
        imdbId: "tt0086250",
        title: "Scarface",
        year: 1983,
        duration: "170 min",
        rating: "8.3",
        director: "Brian De Palma",
        cast: ["Al Pacino", "Michelle Pfeiffer", "Steven Bauer", "Mary Elizabeth Mastrantonio"],
        genre: ["Crime", "Drama"],
        description: "In 1980, a Cuban immigrant arrives in Miami with nothing and eventually becomes a powerful drug kingpin.",
        gradient: "from-slate-900 via-rose-950/40 to-black",
        accentColor: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        accentHex: "#f43f5e",
        symbol: "💰🌴🔫",
        tagline: "The world is yours."
      },
    {
        id: "godfather-2",
        tmdbId: "240",
        imdbId: "tt0071562",
        title: "The Godfather Part II",
        year: 1974,
        duration: "202 min",
        rating: "9.0",
        director: "Francis Ford Coppola",
        cast: ["Al Pacino", "Robert De Niro", "Robert Duvall", "Diane Keaton"],
        genre: ["Crime", "Drama"],
        description: "The story of the Corleone family continues with Vito Corleone building his empire and Michael Corleone managing it in the 1950s.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "Keep your friends close, but your enemies closer."
      },
      {
        id: "godfather-3",
        tmdbId: "242",
        imdbId: "tt0099674",
        title: "The Godfather Part III",
        year: 1990,
        duration: "162 min",
        rating: "7.6",
        director: "Francis Ford Coppola",
        cast: ["Al Pacino", "Diane Keaton", "Andy Garcia", "Talia Shire"],
        genre: ["Crime", "Drama"],
        description: "Michael Corleone attempts to legitimize his family's business but is pulled back in by the sins of his past.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "Just when I thought I was out... they pull me back in."
      },
      {
        id: "irishman",
        title: "The Irishman",
        year: 2019,
        duration: "209 min",
        rating: "7.8",
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Al Pacino", "Joe Pesci", "Harvey Keitel"],
        genre: ["Biography", "Crime", "Drama"],
        description: "Frank Sheeran, a WWII veteran, hustler, and hitman, looks back on his past.",
        gradient: "from-zinc-900 via-neutral-900 to-stone-950",
        accentColor: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
        accentHex: "#a1a1aa",
        symbol: "🇮🇪🔫👴",
        tagline: "I heard you paint houses."
      },
      {
        id: "american-gangster",
        title: "American Gangster",
        year: 2007,
        duration: "157 min",
        rating: "7.8",
        director: "Ridley Scott",
        cast: ["Denzel Washington", "Russell Crowe", "Chiwetel Ejiofor", "Josh Brolin"],
        genre: ["Biography", "Crime", "Drama"],
        description: "A New York cop is tasked with taking down the city's biggest drug lord.",
        gradient: "from-stone-900 via-neutral-900 to-black",
        accentColor: "text-stone-400 border-stone-400/30 bg-stone-400/10",
        accentHex: "#a8a29e",
        symbol: "🚔❄️💰",
        tagline: "There are dirty cops, and honest gangsters."
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
        description: "The story of the blind ambition and greed that led to the fall of a mafia gambling empire.",
        gradient: "from-yellow-950 via-stone-900 to-black",
        accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
        accentHex: "#eab308",
        symbol: "🎰🎲💼",
        tagline: "No one stays at the top forever."
      }
    ]
  },
  {
    id: "mind-bending-mysteries",
    title: "Mysteries",
    description: "Chilling psychological thrillers, sordid murders and twists that will leave you speechless.",
    movies: [
      {
        id: "memories-of-murder",
        title: "Memories of Murder",
        posterUrl: "https://image.tmdb.org/t/p/w500/q3uYq9b2z3GZq2D5O9E5Q8O5O5O.jpg",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
      },
      {
        id: "se7en",
        title: "Se7en",
        year: 1995,
        duration: "127 min",
        rating: "8.6",
        director: "David Fincher",
        cast: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow", "Kevin Spacey"],
        genre: ["Crime", "Drama", "Mystery"],
        description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
        gradient: "from-stone-900 via-yellow-950/20 to-black",
        accentColor: "text-stone-400 border-stone-400/30 bg-stone-400/10",
        accentHex: "#a8a29e",
        symbol: "📦🌧️🔍",
        tagline: "What's in the box?"
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
        description: "A man suffering from anterograde amnesia uses notes and tattoos to hunt for the man he thinks killed his wife.",
        gradient: "from-slate-900 via-indigo-950/30 to-black",
        accentColor: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
        accentHex: "#818cf8",
        symbol: "📸🖊️🧠",
        tagline: "Some memories are best forgotten."
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
        description: "The true story of the hunt for the Zodiac Killer, a serial killer who terrorized the San Francisco Bay Area in the late 1960s and 70s.",
        gradient: "from-stone-950 via-zinc-900 to-black",
        accentColor: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
        accentHex: "#a1a1aa",
        symbol: "🗞️🕵️‍♂️✉️",
        tagline: "There is no end to obsession."
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
        description: "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts.",
        gradient: "from-neutral-950 via-stone-900 to-black",
        accentColor: "text-stone-300 border-stone-300/30 bg-stone-300/10",
        accentHex: "#d6d3d1",
        symbol: "❄️🚐🔎",
        tagline: "Every moment counts."
      }
    ]
  },
  {
    id: "the-batman",
    title: "The Batman",
    description: "The Dark Knight defends Gotham City against crime and corruption.",
    movies: [
]
  },
  {
    id: "frank-darabont",
    title: "Frank Darabont",
    description: "The visionary director behind some of the greatest cinematic adaptations of our time.",
    movies: []
  },
  {
    id: "martin-scorsese",
    title: "Martin Scorsese",
    description: "Gritty, uncompromising and masterful storytelling from a cinematic legend.",
    movies: []
  },
  {
    id: "godzilla",
    title: "Godzilla",
    description: "The King of the Monsters. Epic destruction and awe-inspiring creature features.",
    movies: []
  },
  {
    id: "jurassic-park",
    title: "Jurassic Park",
    description: "An adventure 65 million years in the making. Life finds a way.",
    movies: []
  }
];