import glob
for file in glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/*.tsx"):
    with open(file, 'r') as f:
        text = f.read()
    
    text = text.replace('title="Paramètres"', 'title="Settings"')
    
    with open(file, 'w') as f:
        f.write(text)
