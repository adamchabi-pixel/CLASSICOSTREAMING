import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("append_to_response=credits&language=en-US", "append_to_response=credits,images&include_image_language=en,null&language=en-US")

with open("server.ts", "w") as f:
    f.write(content)
