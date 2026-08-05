const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `export default function App() {`;
const replacement = `export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);`;
content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
