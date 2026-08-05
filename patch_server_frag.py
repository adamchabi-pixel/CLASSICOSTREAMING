import re
with open('server.ts', 'r') as f:
    content = f.read()

proxy_request = """  // 3. Ajouter un log backend pour afficher la requête exacte reçue par /api/jellyfin/proxy/stream
  console.log(`[PROXY REQUEST RECEIVED] Method: ${req.method} | URL: ${req.url} | Headers: ${JSON.stringify(req.headers)}`);"""
proxy_request_new = """  // 3. Ajouter un log backend pour afficher la requête exacte reçue par /api/jellyfin/proxy/stream
  if (req.url.includes(".ts") || req.url.includes(".m3u8")) {
      console.log(`[PROXY SEGMENT REQUEST] [${Date.now()}] URL: ${req.url}`);
  } else {
      console.log(`[PROXY REQUEST RECEIVED] Method: ${req.method} | URL: ${req.url}`);
  }"""

if "PROXY SEGMENT REQUEST" not in content:
    content = content.replace(proxy_request, proxy_request_new)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server frag logs")
