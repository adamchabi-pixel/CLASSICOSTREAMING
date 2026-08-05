const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const importTarget = `import { Search, Film as FilmIcon, Target, Compass, Sparkles, Smile, Shield, Video, Activity, Users, Wand2, Landmark, Ghost, Heart, Rocket, Eye, Star } from "lucide-react";`;
const importReplacement = `import { Search, Film as FilmIcon, Target, Compass, Sparkles, Smile, Shield, Video, Activity, Users, Wand2, Landmark, Ghost, Heart, Rocket, Eye, Star, Globe, Calendar, ChevronRight } from "lucide-react";`;
content = content.replace(importTarget, importReplacement);

const genresTarget = `const GENRES = [`;
const genresReplacement = `const LANGUAGES = [
  { id: "en", name: "English", icon: Globe },
  { id: "fr", name: "French", icon: Globe },
  { id: "ja", name: "Japanese", icon: Globe },
  { id: "es", name: "Spanish", icon: Globe },
  { id: "ko", name: "Korean", icon: Globe },
  { id: "it", name: "Italian", icon: Globe },
  { id: "de", name: "German", icon: Globe }
];

const YEARS = [
  { id: 2024, name: "2024", icon: Calendar },
  { id: 2023, name: "2023", icon: Calendar },
  { id: 2022, name: "2022", icon: Calendar },
  { id: 2021, name: "2021", icon: Calendar },
  { id: 2020, name: "2020", icon: Calendar },
  { id: 2010, name: "2010s", icon: Calendar },
  { id: 2000, name: "2000s", icon: Calendar }
];

const GENRES = [`;
content = content.replace(genresTarget, genresReplacement);

const stateTarget = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);`;
const stateReplacement = `  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);`;
content = content.replace(stateTarget, stateReplacement);

const fetchTarget = `        if (activePlatform || activeGenre) {
           url = \`https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&sort_by=popularity.desc&watch_region=US\`;
           if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
           if (activeGenre) url += \`&with_genres=\${activeGenre}\`;
        }`;
const fetchReplacement = `        if (activePlatform || activeGenre || activeLanguage || activeYear) {
           url = \`https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&sort_by=popularity.desc&watch_region=US\`;
           if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
           if (activeGenre) url += \`&with_genres=\${activeGenre}\`;
           if (activeLanguage) url += \`&with_original_language=\${activeLanguage}\`;
           if (activeYear) {
               if (activeYear === 2010) {
                   url += \`&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31\`;
               } else if (activeYear === 2000) {
                   url += \`&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31\`;
               } else {
                   url += \`&primary_release_year=\${activeYear}\`;
               }
           }
        }`;
content = content.replace(fetchTarget, fetchReplacement);

const depsTarget = `  }, [activePlatform, activeGenre]);`;
const depsReplacement = `  }, [activePlatform, activeGenre, activeLanguage, activeYear]);`;
content = content.replace(depsTarget, depsReplacement);

fs.writeFileSync('src/components/LibraryView.tsx', content);
