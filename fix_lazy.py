import re

with open('src/components/LazyVirtualCard.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    'interface LazyVirtualCardProps {\n  children: React.ReactNode;\n  key?: string;\n}',
    'interface LazyVirtualCardProps {\n  children: React.ReactNode;\n  key?: string;\n  className?: string;\n}'
)

text = text.replace(
    'export default function LazyVirtualCard({ children }: LazyVirtualCardProps) {',
    'export default function LazyVirtualCard({ children, className }: LazyVirtualCardProps) {'
)

text = text.replace(
    'className="w-[170px] sm:w-[210px] aspect-[2/3] shrink-0"',
    'className={`shrink-0 ${className || "w-[140px] min-[400px]:w-[160px] sm:w-[210px] aspect-[2/3]"}`}'
)

with open('src/components/LazyVirtualCard.tsx', 'w') as f:
    f.write(text)
