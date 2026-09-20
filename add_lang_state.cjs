const fs = require('fs');
const content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const updated = content.replace(
  /const \[serverSelected, setServerSelected\] = useState\(true\);/,
  'const [serverSelected, setServerSelected] = useState(true);\n  const [language, setLanguage] = useState<"en" | "fr">("en");'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', updated);
