import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

banner_jsx = """              {/* Premium Discord Community Banner */}
              <div className="max-w-[2000px] mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-2">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-[#1e1f24] to-zinc-900 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group">
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#5865F2]/10 to-transparent opacity-50 pointer-events-none blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#5865F2]/30 transition-colors duration-700"></div>

                  <div className="relative px-5 py-6 sm:px-8 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full">
                      {/* Discord Logo Container */}
                      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 shadow-[0_0_20px_rgba(88,101,242,0.15)] group-hover:scale-105 group-hover:bg-[#5865F2]/20 group-hover:border-[#5865F2]/40 transition-all duration-300">
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
                        </svg>
                      </div>

                      {/* Text Content */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <h3 className="text-lg sm:text-xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
                          Join our Discord Community
                        </h3>
                        <p className="text-sm sm:text-[15px] text-zinc-400 font-sans leading-relaxed max-w-2xl">
                          Connect with other movie lovers, get updates, suggest movies, and be part of the Classico community.
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <a
                        href="https://discord.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full md:w-auto gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl text-[13px] sm:text-[14px] tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                      >
                        Join Discord
                      </a>
                    </div>
                  </div>
                </div>
              </div>"""

old_str = '''              <div className="max-w-[2000px] mx-auto px-4 sm:px-8 pt-8">
                {/* REMOVED RECENTLY VIEWED SECTION */}
              </div>'''

text = text.replace(old_str, banner_jsx)

with open('src/App.tsx', 'w') as f:
    f.write(text)
