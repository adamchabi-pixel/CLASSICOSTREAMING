import os
import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Add a safe wrapper at the top of the file
safe_storage_code = '''
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch(e) {}
  }
};
const safeSession = {
  getItem: (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch(e) {}
  }
};
'''

# We need to insert this right after the imports
content = re.sub(r'(import .* from .*;\n)+', lambda m: m.group(0) + safe_storage_code, content, count=1)

# Now replace all localStorage/sessionStorage
content = content.replace('localStorage.', 'safeStorage.')
content = content.replace('sessionStorage.', 'safeSession.')

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Done")
