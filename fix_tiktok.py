import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

replacement = """  // --- TIKTOK POPUNDER FIX ---
  // Objectif: Désactiver les popunders uniquement pendant la lecture vidéo pour le navigateur in-app TikTok
  useEffect(() => {
    const isTikTok = /TikTok|Bytedance|musical_ly/i.test(navigator.userAgent);
    if (!isTikTok) return;

    console.log("[TikTok Fix] Désactivation des popunders pendant la lecture vidéo");

    const originalWindowOpen = window.open;
    window.open = function(url?: string | URL, target?: string, features?: string) {
      console.log("[TikTok Fix] window.open bloqué");
      return null;
    } as any;

    const rootElement = document.getElementById('root');
    const stopPopunderBubble = (e: MouseEvent) => {
      e.stopPropagation();
    };
    if (rootElement) {
      rootElement.addEventListener('click', stopPopunderBubble);
    }

    const blockPopunderLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const link = target.closest('a');
        if (link && link.target === '_blank') {
          console.log("[TikTok Fix] Clic sur un lien externe bloqué");
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };
    document.addEventListener('click', blockPopunderLinks, true);

    return () => {
      console.log("[TikTok Fix] Réactivation des popunders (sortie du lecteur)");
      window.open = originalWindowOpen;
      if (rootElement) {
        rootElement.removeEventListener('click', stopPopunderBubble);
      }
      document.removeEventListener('click', blockPopunderLinks, true);
    };
  }, []);

  // Set moviePlayClickTime on mount if accessed directly / not set"""

content = content.replace("  // Set moviePlayClickTime on mount if accessed directly / not set", replacement)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Fixed")
