with open('src/App.tsx', 'r') as f:
    text = f.read()

replacement = """                      <div 
                        className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_10%,rgba(12,10,9,0.75)_30%,rgba(12,10,9,0.2)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_15%,rgba(12,10,9,0.75)_40%,rgba(12,10,9,0.2)_75%,transparent_100%)]" 
                      />"""

text = text.replace('                      <div \n                        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent md:!bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_15%,rgba(12,10,9,0.75)_40%,rgba(12,10,9,0.2)_75%,transparent_100%)]" \n                      />', replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)
