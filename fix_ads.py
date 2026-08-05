with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    text = f.read()

text = text.replace('const [adClicks, setAdClicks] = useState(0);', 'const [adClicks, setAdClicks] = useState(2);')

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(text)
