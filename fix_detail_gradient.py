import re

with open('src/components/MovieDetailView.tsx', 'r') as f:
    text = f.read()

old_grad = 'className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/50 to-transparent md:!bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_15%,rgba(12,10,9,0.75)_40%,rgba(12,10,9,0.2)_75%,transparent_100%)] [@media(max-height:500px)_and_(orientation:landscape)]:bg-black/80" />'

new_grad = 'className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.9)_30%,rgba(12,10,9,0.4)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.95)_25%,rgba(12,10,9,0.6)_50%,transparent_100%)] [@media(max-height:500px)_and_(orientation:landscape)]:bg-stone-950/80" />'

text = text.replace(old_grad, new_grad)

with open('src/components/MovieDetailView.tsx', 'w') as f:
    f.write(text)
