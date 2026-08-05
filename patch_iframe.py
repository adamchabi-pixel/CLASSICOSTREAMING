import sys

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """          <iframe
            src={playbackInfo.iframeSrc}
            allowFullScreen={true}
            allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
            className="w-full h-full border-0"
            // @ts-ignore
            webkitAllowFullScreen={true}
            // @ts-ignore
            mozAllowFullScreen={true}
          ></iframe>"""

replacement = """          <iframe
            src={playbackInfo.iframeSrc}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            className="absolute inset-0 w-full h-full border-0"
            // @ts-ignore
            webkitallowfullscreen="true"
            // @ts-ignore
            mozallowfullscreen="true"
          ></iframe>"""

content = content.replace(target, replacement)

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
