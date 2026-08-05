import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Add state for wishlist modal
state_target = "  const [searchQuery, setSearchQuery] = useState(\"\");"
state_insert = "  const [showWishlistModal, setShowWishlistModal] = useState(false);"
if state_target in content:
    content = content.replace(state_target, state_target + "\n" + state_insert)

# 2. Modify Desktop Navigation Controls Menu
desktop_nav_target = """              {[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Library", icon: FilmIcon },
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {"""

desktop_nav_replace = """              {[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Library", icon: FilmIcon },
                { id: "wishlist", label: "Wishlist", icon: BookmarkCheck },
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {"""
content = content.replace(desktop_nav_target, desktop_nav_replace)

# Modify desktop onClick to handle wishlist
desktop_click_target = """                    onClick={() => {
                      navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                      setSearchQuery("");
                    }}"""

desktop_click_replace = """                    onClick={() => {
                      if (tab.id === "wishlist") {
                        setShowWishlistModal(true);
                        return;
                      }
                      navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                      setSearchQuery("");
                    }}"""
content = content.replace(desktop_click_target, desktop_click_replace)

# 3. Modify Mobile Menu Drawer
# Need to see if it uses the same array. Let's do a generic replace for it if it's there.
mobile_nav_target = """                {[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Library", icon: FilmIcon },
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {"""

mobile_nav_replace = """                {[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Library", icon: FilmIcon },
                  { id: "wishlist", label: "Wishlist", icon: BookmarkCheck },
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {"""
if mobile_nav_target in content:
    content = content.replace(mobile_nav_target, mobile_nav_replace)
else:
    # Just to be safe, maybe they reuse the array? We'll see.
    pass

mobile_click_target = """                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery("");
                      }}"""

mobile_click_replace = """                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (tab.id === "wishlist") {
                          setShowWishlistModal(true);
                          return;
                        }
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery("");
                      }}"""
if mobile_click_target in content:
    content = content.replace(mobile_click_target, mobile_click_replace)


# 4. Add the Wishlist Modal at the end of the App return
modal_insert = """
      {/* WISHLIST MODAL */}
      <AnimatePresence>
        {showWishlistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowWishlistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-zinc-950 border border-[#D4AF37]/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(212,175,55,0.15)] text-center flex flex-col items-center gap-4"
            >
              <button
                onClick={() => setShowWishlistModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-[#D4AF37] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 mb-2">
                <BookmarkCheck className="w-8 h-8 text-[#D4AF37]" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest">
                En construction
              </h2>
              
              <p className="text-zinc-300 font-sans text-sm sm:text-base leading-relaxed">
                La Wishlist est en cours de construction ! 🍿<br/><br/>
                Bientôt, vous pourrez demander directement vos films préférés ici.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
"""

content = content.replace("    </div>\n  );\n}", modal_insert + "    </div>\n  );\n}")

with open("src/App.tsx", "w") as f:
    f.write(content)
