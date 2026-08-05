import re

with open('src/components/MovieModal.tsx', 'r') as f:
    text = f.read()

# Remove VideoPlayer import
text = re.sub(r'import VideoPlayer from "\./VideoPlayer";\n', '', text)

# Add onPlay to props
text = text.replace('  startAsPlaying?: boolean;\n}', '  startAsPlaying?: boolean;\n  onPlay: (id: string) => void;\n}')
text = text.replace('  onToggleBookmark,\n  startAsPlaying = false\n}: MovieModalProps', '  onToggleBookmark,\n  startAsPlaying = false,\n  onPlay\n}: MovieModalProps')

# Replace setIsPlaying(true) with onPlay
text = text.replace('setIsPlaying(true);', 'onPlay(movie!.id);')

# Remove the isPlaying state logic and conditional rendering
text = re.sub(r'          \) : \(\s*<VideoPlayer.*?\/>\s*\)', '', text, flags=re.DOTALL)
text = re.sub(r'const \[isPlaying, setIsPlaying\] = useState\(startAsPlaying\);\n', '', text)
text = text.replace('!isPlaying ? (', '(')

with open('src/components/MovieModal.tsx', 'w') as f:
    f.write(text)
