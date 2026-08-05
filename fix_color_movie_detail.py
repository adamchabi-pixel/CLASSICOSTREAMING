import re

with open("src/components/MovieDetailView.tsx", "r") as f:
    content = f.read()

# Replace "#f4ecd8" with "#D4AF37" in the CASTING CAROUSEL block
# Actually just the title text and accents, to match "dorés #D4AF37"

block = """          <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#f4ecd8] mb-6">
            <Users className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
            Distribution
          </h3>"""
new_block = """          <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#D4AF37] mb-6">
            <Users className="w-5 h-5 text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
            Distribution
          </h3>"""
content = content.replace(block, new_block)

block2 = """                <h4 className="text-[#f4ecd8] font-sans font-bold text-sm leading-tight truncate">{actor.name}</h4>"""
new_block2 = """                <h4 className="text-zinc-200 font-sans font-bold text-sm leading-tight truncate">{actor.name}</h4>"""
content = content.replace(block2, new_block2)

# Also for the fallback block
block3 = """              <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#f4ecd8] mb-6">
                <Users className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                Distribution
              </h3>"""
new_block3 = """              <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#D4AF37] mb-6">
                <Users className="w-5 h-5 text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                Distribution
              </h3>"""
content = content.replace(block3, new_block3)

block4 = """                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-[#f4ecd8] border border-[#f4ecd8]/20 bg-[#f4ecd8]/5 shadow-sm">"""
new_block4 = """                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 shadow-sm">"""
content = content.replace(block4, new_block4)

with open("src/components/MovieDetailView.tsx", "w") as f:
    f.write(content)
