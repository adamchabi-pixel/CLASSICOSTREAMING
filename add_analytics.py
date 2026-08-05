import re

with open("src/main.tsx", "r") as f:
    text = f.read()

import_statement = 'import { Analytics } from "@vercel/analytics/react";\n'

# Add import if not exists
if import_statement not in text:
    text = re.sub(r'(import .*?\n)(?!import)', r'\1' + import_statement, text, count=1)

# Add Analytics component
if '<Analytics />' not in text:
    text = text.replace('<App />', '<App />\n      <Analytics />')

with open("src/main.tsx", "w") as f:
    f.write(text)
