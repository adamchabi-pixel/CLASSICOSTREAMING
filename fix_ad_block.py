import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target_block = '''    const blockPopunderLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const link = target.closest('a');
        if (link && link.target === '_blank') {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };'''

replacement_block = '''    const blockPopunderLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const link = target.closest('a');
        if (link && link.target === '_blank' && !link.classList.contains('allow-popunder')) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };'''

target_link = '''className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"'''
replacement_link = '''className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"'''


if target_block in content:
    content = content.replace(target_block, replacement_block)
else:
    print("Block not found")

if target_link in content:
    content = content.replace(target_link, replacement_link)
else:
    print("Link not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
