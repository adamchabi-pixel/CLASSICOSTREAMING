const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = 'export default function App() {';
const replacement = `export default function App() {
  const [asyncData, setAsyncData] = useState<{all: any[], imported: any[], hero: any} | null>(null);

  useEffect(() => {
    Promise.all([
      import('./data/all_movies'),
      import('./data/imported_movies'),
      import('./data/hero_movies')
    ]).then(([all, imported, hero]) => {
      setAsyncData({
        all: all.allMoviesData,
        imported: imported.importedMoviesData,
        hero: hero.heroMoviesData
      });
    });
  }, []);`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
console.log("Success");
