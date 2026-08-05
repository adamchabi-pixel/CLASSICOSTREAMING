import re

def update_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    subtitles_pattern = r'<span className="text-amber-500 text-\[10px\] max-w-\[80px\] truncate">[^<]*\{[^}]*\}[^<]*<\/span>'
    content = re.sub(subtitles_pattern, '', content, flags=re.DOTALL)

    # Some extra stuff to make sure we remove the gap if we don't have text
    content = content.replace('<div className="flex items-center gap-1.5">\n                            \n                          <ChevronRight', '<div className="flex items-center gap-1.5">\n                            <ChevronRight')
    
    with open(filename, "w") as f:
        f.write(content)

update_file("src/components/VideoPlayer.tsx")
update_file("src/components/CinemaPlayerView.tsx")
