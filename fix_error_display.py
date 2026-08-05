import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {
    if (availableServers.length === 0) {
      if (!isLoading && isMetadataLoaded) {'''

replacement = '''  if (videoError) {
    return (
      <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error</h3>
        <p className="text-zinc-400 max-w-md">{videoError}</p>
        <button
          onClick={handleClosePlayer}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {
    if (availableServers.length === 0) {
      if (!isLoading && isMetadataLoaded) {'''

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/CinemaPlayerView.tsx', 'w') as f:
        f.write(content)
    print("Done")
else:
    print("Not found")
