const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetReturnEnd = `        }}
      />
      </div>
  );
}`;

const replacementReturnEnd = `        }}
      />

      {/* WELCOME POPUP MODAL */}
      <AnimatePresence>
        {showWelcomeModal && activeTab === "accueil" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[450px] bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500">
                <Info className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white mb-4 tracking-wide uppercase gold-metallic-text">
                Welcome to Classico
              </h2>
              
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium mb-6">
                We advise you using an AdBlock for a better experience. However, be reassured: the ads have zero risk. Even if you see fake virus warnings, they are just pop-ups. Enjoy your streaming!
              </p>
              
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
  );
}`;

content = content.replace(targetReturnEnd, replacementReturnEnd);
fs.writeFileSync('src/App.tsx', content);
