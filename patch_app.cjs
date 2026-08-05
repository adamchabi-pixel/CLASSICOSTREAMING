const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import MovieCard from "./components/MovieCard";`;
const importReplacement = `import MovieCard from "./components/MovieCard";\nimport LibraryView from "./components/LibraryView";`;
content = content.replace(importTarget, importReplacement);

const target = `          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: LIBRARY (GRID VIEW)                                */
            /* ========================================================== */
            <motion.div`;

const targetEnd = `              </div>
            </motion.div>
          ) : activeTab === "collection-detail" ? (`;

const startIndex = content.indexOf(target);
const endIndex = content.indexOf(targetEnd) + targetEnd.length - `          ) : activeTab === "collection-detail" ? (`.length;

if (startIndex !== -1 && endIndex !== -1) {
    const sectionToReplace = content.substring(startIndex, endIndex);
    const newSection = `          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: LIBRARY (GRID VIEW)                                */
            /* ========================================================== */
            <LibraryView 
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
`;
    content = content.replace(sectionToReplace, newSection);
    fs.writeFileSync('src/App.tsx', content);
    console.log("App patched");
} else {
    console.log("Failed to find section");
}
