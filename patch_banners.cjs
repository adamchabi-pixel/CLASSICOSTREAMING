const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `"mind-bending-mysteries": "https://images.unsplash.com/photo-1517765371796-58eb241caa36?q=80&w=1200&auto=format&fit=crop"`;
const replacement = `"mind-bending-mysteries": "https://images.unsplash.com/photo-1517765371796-58eb241caa36?q=80&w=1200&auto=format&fit=crop",
  "frank-darabont": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
  "martin-scorsese": "https://images.unsplash.com/photo-1574676101235-97e3cefa1212?q=80&w=1200&auto=format&fit=crop",
  "the-batman": "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1200&auto=format&fit=crop",
  "godzilla": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "jurassic-park": "https://images.unsplash.com/photo-1551624647-380d99dc0742?q=80&w=1200&auto=format&fit=crop"`;

app = app.replace(target, replacement);

fs.writeFileSync('src/App.tsx', app);
console.log("Success patching banners");
