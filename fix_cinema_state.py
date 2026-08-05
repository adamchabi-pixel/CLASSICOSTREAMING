import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# 1. Fix serverSelected state
target_state = '''  const [serverSelected, setServerSelected] = useState(() => {
    return sessionStorage.getItem('server_selected_' + movieId) === 'true';
  });'''
replacement_state = '''  const [serverSelected, setServerSelected] = useState(false);'''
if target_state in content:
    content = content.replace(target_state, replacement_state)

# 2. Remove sessionStorage.setItem('server_selected_'...) calls
target_set1 = '''                  sessionStorage.setItem('server_selected_' + movieId, 'true');
                  setServerSelected(true);'''
replacement_set1 = '''                  setServerSelected(true);'''
if target_set1 in content:
    content = content.replace(target_set1, replacement_set1)

target_set2 = '''                          sessionStorage.setItem('server_selected_' + movieId, 'true');
                          localStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);'''
replacement_set2 = '''                          localStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);'''
if target_set2 in content:
    content = content.replace(target_set2, replacement_set2)

# 3. Iframe background loading
target_iframe = '''      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc && adClicks >= 3 ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pointer-events-auto opacity-100`}>
          <iframe'''
replacement_iframe = '''      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pointer-events-auto opacity-100`}>
          <iframe'''
if target_iframe in content:
    content = content.replace(target_iframe, replacement_iframe)

target_video = '''      ) : !isLoading && !isStreamLoading ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} ref={viewportRef}>
          <video'''
replacement_video = '''      ) : !isLoading && !isStreamLoading ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pointer-events-auto opacity-100`} ref={viewportRef}>
          <video'''
if target_video in content:
    content = content.replace(target_video, replacement_video)


with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
