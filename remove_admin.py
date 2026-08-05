import sys
import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# We need to find the settings panel that has the bulk import
target_regex = r'\{\/\* BULK IMPORT \(TMDb\) \*\/\}.*?\{\/\* END BULK IMPORT \*\/\}'
content = re.sub(target_regex, '', content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
