import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {
    if (availableServers.length === 0) {
      if (!isLoading && isMetadataLoaded) {
          // If we finished loading and still have no servers, just bypass to avoid hanging
          return null;
      }
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      );
    }'''

replacement = '''  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {
    if (availableServers.length === 0) {
      if (!isLoading && isMetadataLoaded) {
          // If we finished loading and still have no servers, just bypass to avoid hanging
          // BUT do not return null, instead pretend server is selected so we show player & ads
          setServerSelected(true);
          return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          );
      }
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      );
    }'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Done")
