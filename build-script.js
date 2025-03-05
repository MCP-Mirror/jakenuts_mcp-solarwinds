const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
  console.log('Created build directory');
}

// Create subdirectories
const dirs = ['utils', 'tools', 'resources'];
for (const dir of dirs) {
  const dirPath = path.join('build', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created ${dirPath} directory`);
  }
}

// Copy source files to build directory with .js extension
function copyWithJsExtension(srcDir, destDir) {
  const files = fs.readdirSync(srcDir);
  
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      const nestedDestDir = path.join(destDir, file);
      if (!fs.existsSync(nestedDestDir)) {
        fs.mkdirSync(nestedDestDir, { recursive: true });
      }
      copyWithJsExtension(srcPath, nestedDestDir);
    } else if (file.endsWith('.ts')) {
      const destFile = file.replace('.ts', '.js');
      const destPath = path.join(destDir, destFile);
      
      // Read the TypeScript file
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Replace .ts extensions with .js in import statements
      content = content.replace(/from ['"](.+)\.ts['"]/g, 'from \'$1.js\'');
      
      // Write the modified content to the destination
      fs.writeFileSync(destPath, content);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
}

// Copy source files
copyWithJsExtension('src', 'build');

// Make index.js executable
try {
  fs.chmodSync('build/index.js', '755');
  console.log('Made build/index.js executable');
} catch (error) {
  console.log('Skipping chmod on Windows');
}

console.log('Build completed successfully');
