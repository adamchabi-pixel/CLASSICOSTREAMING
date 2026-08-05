const fs = require('fs');
let content = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');

if (!content.includes('onSimilarClick?: (id: string) => void;')) {
    content = content.replace('interface MovieModalProps {', 'interface MovieModalProps {\n  onSimilarClick?: (id: string) => void;');
    fs.writeFileSync('src/components/MovieModal.tsx', content);
}
console.log("fixed MovieModalProps");
