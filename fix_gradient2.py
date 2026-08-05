import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_grad = 'className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#000000_0%,rgba(0,0,0,0.95)_10%,rgba(0,0,0,0.75)_30%,rgba(0,0,0,0.2)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#000000_0%,rgba(0,0,0,0.95)_15%,rgba(0,0,0,0.75)_40%,rgba(0,0,0,0.2)_75%,transparent_100%)]"'

new_grad = 'className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#000_0%,#000_10%,rgba(0,0,0,0.9)_30%,rgba(0,0,0,0.4)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#000_0%,#000_10%,rgba(0,0,0,0.95)_25%,rgba(0,0,0,0.6)_50%,transparent_100%)]"'

text = text.replace(old_grad, new_grad)

with open('src/App.tsx', 'w') as f:
    f.write(text)
