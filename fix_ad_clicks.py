import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target1 = '''    return () => {
      if (sessionStorage.getItem('returning_from_ad') !== 'true') {
        sessionStorage.removeItem('classico_ad_clicks_' + movieId);
    sessionStorage.removeItem('returning_from_ad');
      }
    };'''
replacement1 = '''    return () => {
        // Removed cleanup to persist ad clicks during session
    };'''

target2 = '''  const handleClosePlayer = () => {
    sessionStorage.removeItem('classico_ad_clicks_' + movieId);
    sessionStorage.removeItem('returning_from_ad');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose();
  };'''
replacement2 = '''  const handleClosePlayer = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose();
  };'''

if target1 in content:
    content = content.replace(target1, replacement1)
else:
    print("Target 1 not found")

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("Target 2 not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
