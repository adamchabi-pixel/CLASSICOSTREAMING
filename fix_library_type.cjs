const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetInterface = `interface LibraryViewProps {
  onSelect: (m: Movie) => void;
  onPlay: (m: Movie) => void;
  getProgress: (id: string) => number;
}`;
const replacementInterface = `interface LibraryViewProps {
  onSelect: (m: Movie) => void;
  onPlay: (m: Movie) => void;
  getProgress: (id: string) => number;
  type?: 'movie' | 'tv';
}`;
content = content.replace(targetInterface, replacementInterface);

const targetComponent = `export default function LibraryView({ onSelect, onPlay, getProgress }: LibraryViewProps) {`;
const replacementComponent = `export default function LibraryView({ onSelect, onPlay, getProgress, type = 'movie' }: LibraryViewProps) {`;
content = content.replace(targetComponent, replacementComponent);

fs.writeFileSync('src/components/LibraryView.tsx', content);
