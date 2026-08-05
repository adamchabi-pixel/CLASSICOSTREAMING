import re

with open('src/components/LazyVirtualCard.tsx', 'r') as f:
    text = f.read()

# Remove contentVisibility: "auto"
text = text.replace(
    'style={{ contentVisibility: "auto", containIntrinsicSize: "170px 255px" }}',
    'style={{ containIntrinsicSize: "170px 255px" }}'
)

with open('src/components/LazyVirtualCard.tsx', 'w') as f:
    f.write(text)
