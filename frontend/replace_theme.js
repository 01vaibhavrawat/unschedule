const fs = require('fs');
const path = require('path');

const replaceMap = {
  'bg-white': 'bg-[var(--color-bg-surface)]',
  'bg-gray-50': 'bg-[var(--color-bg-surface-muted)]',
  'bg-gray-50/50': 'bg-[var(--color-bg-surface-soft)]',
  'bg-gray-50/60': 'bg-[var(--color-bg-surface-soft)]',
  'bg-gray-100': 'bg-[var(--color-bg-hover)]',
  'bg-gray-200': 'bg-[var(--color-border-muted)]',
  
  'border-gray-50': 'border-[var(--color-border-subtle)]',
  'border-gray-100': 'border-[var(--color-border-subtle)]',
  'border-gray-200': 'border-[var(--color-border-default)]',
  'border-gray-300': 'border-[var(--color-border-strong)]',
  
  'text-gray-400': 'text-[var(--color-text-muted)]',
  'text-gray-500': 'text-[var(--color-text-secondary)]',
  'text-gray-600': 'text-[var(--color-text-secondary)]',
  'text-gray-700': 'text-[var(--color-text-primary)]',
  'text-gray-800': 'text-[var(--color-text-primary)]',
  'text-gray-900': 'text-[var(--color-text-primary)]',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      for (const [oldClass, newClass] of Object.entries(replaceMap)) {
        // Regex to match exact word boundary for tailwind classes
        const regex = new RegExp(`\\b${oldClass.replace('/', '\\/')}\\b`, 'g');
        newContent = newContent.replace(regex, newClass);
      }
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'app'));
