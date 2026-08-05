import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace('} catch (e) { console.warn("Could not write cache:", e.message); }//', '} catch (e) { console.warn("Could not write cache:", e.message); }\n//')
content = content.replace('} catch (e) { console.warn("Could not write cache:", e.message); }let', '} catch (e) { console.warn("Could not write cache:", e.message); }\nlet')

with open("server.ts", "w") as f:
    f.write(content)
