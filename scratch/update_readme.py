import os

def update():
    imgs = [f for f in os.listdir('w:/Projects/SwipeX/docs/screenshots') if f.endswith('.png')]
    md = '\n## 📸 Screenshots\n\n<div align="center">\n' + '\n'.join([f'  <img src="docs/screenshots/{img}" width="45%" />' for img in imgs]) + '\n</div>\n\n'
    
    with open('w:/Projects/SwipeX/README.md', 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace('## ✨ Features', md + '## ✨ Features')
    
    with open('w:/Projects/SwipeX/README.md', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    update()
