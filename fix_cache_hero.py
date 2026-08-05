import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace(
    'app.get("/api/jellyfin/hero", async (req, res) => {',
    'app.get("/api/jellyfin/hero", async (req, res) => {\n  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");\n  res.setHeader("Pragma", "no-cache");\n  res.setHeader("Expires", "0");'
)

with open("server.ts", "w") as f:
    f.write(content)
