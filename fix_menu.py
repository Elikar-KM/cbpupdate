
import re

file_path = r'e:\DEVPROJECTS\CBPUPDATE\src\components\layout\horizontal\HorizontalMenu.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix lines that were partially replaced: href='/path`} -> href='/path'
content = re.sub(r"href='([^']*)`}", r"href='\1'", content)

# Fix lines that were not replaced: href={`/${locale}/path`} -> href='/path'
content = re.sub(r"href=\{`/\$\{locale\}([^`]*)`\}", r"href='\1'", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
