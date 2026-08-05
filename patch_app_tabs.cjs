const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update activeTab type
content = content.replace('useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player">("accueil");', 'useState<"accueil" | "collections" | "series" | "profil" | "collection-detail" | "movie" | "player">("accueil");');

// Update navbar array (Desktop)
const targetDesktopNav = `{[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Library", icon: FilmIcon },
                
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {`;
const replacementDesktopNav = `{[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Movies", icon: FilmIcon },
                { id: "series", label: "Series", icon: Tv },
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {`;
content = content.replace(targetDesktopNav, replacementDesktopNav);

// Update navbar array (Mobile)
const targetMobileNav = `{[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Library", icon: FilmIcon },
                  
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {`;
const replacementMobileNav = `{[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Movies", icon: FilmIcon },
                  { id: "series", label: "Series", icon: Tv },
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {`;
content = content.replace(targetMobileNav, replacementMobileNav);

// Update URL pathing
content = content.replace('else if (path === "/collections") setActiveTab("collections");', 'else if (path === "/collections") setActiveTab("collections");\n    else if (path === "/series") setActiveTab("series");');

// Fix rendering to add series tab
const targetRendering = `) : activeTab === "collections" ? (
            <LibraryView
              key="library-view"
              onSelectMovie={(m) => handleOpenMovie(m, false)}
              onPlayMovie={(m) => handleOpenMovie(m, true)}
            />
          ) : activeTab === "profil" ? (`;

const replacementRendering = `) : activeTab === "collections" ? (
            <LibraryView
              key="library-view-movies"
              type="movie"
              onSelectMovie={(m) => handleOpenMovie(m, false)}
              onPlayMovie={(m) => handleOpenMovie(m, true)}
            />
          ) : activeTab === "series" ? (
            <LibraryView
              key="library-view-series"
              type="tv"
              onSelectMovie={(m) => handleOpenMovie(m, false)}
              onPlayMovie={(m) => handleOpenMovie(m, true)}
            />
          ) : activeTab === "profil" ? (`;

content = content.replace(targetRendering, replacementRendering);

// Remove pb-16 from main when inside collections or series
const targetMain = `<main className="pb-16 min-h-[75vh]">`;
const replacementMain = `<main className={\`(activeTab === "collections" || activeTab === "series") ? "min-h-screen" : "pb-16 min-h-[75vh]"\`}>`;
content = content.replace(targetMain, replacementMain);

fs.writeFileSync('src/App.tsx', content);
