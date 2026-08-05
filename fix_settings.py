import re

def update_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # AUDIO REPLACE
    # Look for the block containing "Audio" and ChevronRight
    audio_pattern = r'<span className="text-amber-500 text-\[10px\] max-w-\[80px\] truncate">\s*\{playbackInfo[^}]+\}\s*</span>'
    content = re.sub(audio_pattern, '', content)

    # SUBTITLES REPLACE
    subtitles_pattern = r'<span className="text-amber-500 text-\[10px\] max-w-\[80px\] truncate">\s*\{playbackInfo[^}]+\}\s*</span>'
    content = re.sub(subtitles_pattern, '', content)

    # Some extra stuff to make sure we remove the gap if we don't have text
    content = content.replace('<div className="flex items-center gap-1.5">\n                            \n                            <ChevronRight', '<div className="flex items-center gap-1.5">\n                            <ChevronRight')
    
    # We might have missed some pattern variations, let's just do standard string replacements.
    # Actually regex replacement is safer. Let's do it with python.
    with open(filename, "w") as f:
        f.write(content)

update_file("src/components/VideoPlayer.tsx")
update_file("src/components/CinemaPlayerView.tsx")
