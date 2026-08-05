const fs = require('fs');
let dataContent = fs.readFileSync('src/data.ts', 'utf8');
dataContent = dataContent.replace('isIframeEmbed?: boolean;', 'isIframeEmbed?: boolean;\n  iframeSrc?: string;');
fs.writeFileSync('src/data.ts', dataContent);

let modalContent = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');
modalContent = modalContent.replace('export default function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {', 'export default function MovieModal({ movie, isOpen, onClose, onSimilarClick }: MovieModalProps) {');
fs.writeFileSync('src/components/MovieModal.tsx', modalContent);
console.log("fixed final");
