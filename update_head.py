import re

with open('index.html', 'r') as f:
    html = f.read()

head_additions = """
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
    <link rel="icon" type="image/png" href="/favicon.png?v=3" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
    <link rel="manifest" href="/manifest.json?v=3" />
"""

# Remove old icon links
html = re.sub(r'<link rel="icon"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="apple-touch-icon"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="apple-touch-icon-precomposed"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="manifest"[^>]*>\n?', '', html)

# Clean up empty spaces caused by previous replacements
html = re.sub(r'\s+<meta name="viewport"', '\n' + head_additions.rstrip() + '\n    <meta name="viewport"', html)

with open('index.html', 'w') as f:
    f.write(html)
