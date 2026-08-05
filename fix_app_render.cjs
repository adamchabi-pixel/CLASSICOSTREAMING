const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetRender = `          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: LIBRARY (GRID VIEW)                                */
            /* ========================================================== */
            <LibraryView 
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
          ) : activeTab === "collection-detail" ? (`

const replacementRender = `          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: LIBRARY (GRID VIEW)                                */
            /* ========================================================== */
            <LibraryView 
              key="library-movies"
              type="movie"
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
          ) : activeTab === "series" ? (
            /* ========================================================== */
            /* VIEW B2: LIBRARY SERIES (GRID VIEW)                        */
            /* ========================================================== */
            <LibraryView 
              key="library-series"
              type="tv"
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
          ) : activeTab === "collection-detail" ? (`

content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/App.tsx', content);
