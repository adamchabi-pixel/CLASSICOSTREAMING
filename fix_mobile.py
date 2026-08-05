with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                      onClick={() => {
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery("");
                        setIsMobileMenuOpen(false);
                      }}"""

replace = """                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (tab.id === "wishlist") {
                          setShowWishlistModal(true);
                          return;
                        }
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery("");
                      }}"""

if target in content:
    content = content.replace(target, replace)
    with open("src/App.tsx", "w") as f:
        f.write(content)
else:
    print("Not found")

