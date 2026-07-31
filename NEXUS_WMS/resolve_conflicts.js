const fs = require('fs');
const path = require('path');

function resolveConflicts(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      resolveConflicts(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('<<<<<<< HEAD')) {
        // Regex to match conflict markers and keep HEAD content
        const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> [0-9a-f]{40}\r?\n/g;
        
        let newContent = content.replace(regex, '$1');
        
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Resolved conflict in:', fullPath);
        }
      }
    }
  }
}

const frontendSrcDir = path.join(__dirname, 'frontend', 'src');
resolveConflicts(frontendSrcDir);
console.log('Done resolving conflicts.');
