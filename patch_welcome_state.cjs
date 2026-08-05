const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player">("accueil");`;
const replacementState = `  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player">("accueil");`;

content = content.replace(targetState, replacementState);

const targetEffect = `  useEffect(() => {
    const handleScroll = () => {`;
const replacementEffect = `  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("classico_welcome_seen");
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
      sessionStorage.setItem("classico_welcome_seen", "true");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {`;

content = content.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/App.tsx', content);
