const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections,
      ...genreCollections
    ];`;
const replacement = `    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections
    ];`;

app = app.replace(target, replacement);

fs.writeFileSync('src/App.tsx', app);
console.log("Success patching finalCollections");
