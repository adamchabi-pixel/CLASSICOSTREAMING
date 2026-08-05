const fs = require('fs');
let content = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');
content = content.replace(/  onPlay \n}: MovieModalProps\)/, '  onPlay,\n  onSimilarClick\n}: MovieModalProps)');
fs.writeFileSync('src/components/MovieModal.tsx', content);
console.log("patched MovieModal trailing space");
