with open("src/data.ts", "r") as f:
    content = f.read()

content = content.replace("    ]\n  {", "    ]\n  },\n  {")

with open("src/data.ts", "w") as f:
    f.write(content)
