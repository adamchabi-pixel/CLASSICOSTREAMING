const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [isAppReady, setIsAppReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);`;

const replacement = `  const [isAppReady, setIsAppReady] = useState(true);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
