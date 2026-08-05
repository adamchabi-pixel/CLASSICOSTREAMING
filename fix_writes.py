import sys
import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace fs.writeFileSync with try/catch wrapped versions where not already wrapped
content = re.sub(r'(\s*)(fs\.writeFileSync\([^;]+;\s*)', r'\1try { \2 } catch (e) { console.warn("Could not write cache:", e.message); }', content)
content = re.sub(r'(\s*)(fs\.mkdirSync\([^;]+;\s*)', r'\1try { \2 } catch (e) { }', content)

with open("server.ts", "w") as f:
    f.write(content)
