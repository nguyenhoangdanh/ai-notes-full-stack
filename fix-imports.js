const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files
function findFiles(dir, extension = '.tsx') {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extension));
    } else if (file.endsWith(extension) || file.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix ui/button imports
  if (content.includes("from '../ui/button'") || content.includes('from "../ui/button"')) {
    content = content.replace(/from ['"]\.\.\/ui\/button['"]/g, "from '../ui/Button'");
    changed = true;
  }
  if (content.includes("from '../../ui/button'") || content.includes('from "../../ui/button"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/ui\/button['"]/g, "from '../../ui/Button'");
    changed = true;
  }
  if (content.includes("from '../../../components/ui/button'") || content.includes('from "../../../components/ui/button"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/button['"]/g, "from '../../../components/ui/Button'");
    changed = true;
  }
  if (content.includes("from '../../components/ui/button'") || content.includes('from "../../components/ui/button"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/components\/ui\/button['"]/g, "from '../../components/ui/Button'");
    changed = true;
  }
  if (content.includes("from '@/components/ui/button'") || content.includes('from "@/components/ui/button"')) {
    content = content.replace(/from ['"]@\/components\/ui\/button['"]/g, "from '@/components/ui/Button'");
    changed = true;
  }
  
  // Fix ui/badge imports
  if (content.includes("from '../ui/badge'") || content.includes('from "../ui/badge"')) {
    content = content.replace(/from ['"]\.\.\/ui\/badge['"]/g, "from '../ui/Badge'");
    changed = true;
  }
  if (content.includes("from '../../ui/badge'") || content.includes('from "../../ui/badge"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/ui\/badge['"]/g, "from '../../ui/Badge'");
    changed = true;
  }
  if (content.includes("from '../../../components/ui/badge'") || content.includes('from "../../../components/ui/badge"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/badge['"]/g, "from '../../../components/ui/Badge'");
    changed = true;
  }
  if (content.includes("from '../../components/ui/badge'") || content.includes('from "../../components/ui/badge"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/components\/ui\/badge['"]/g, "from '../../components/ui/Badge'");
    changed = true;
  }
  if (content.includes("from '@/components/ui/badge'") || content.includes('from "@/components/ui/badge"')) {
    content = content.replace(/from ['"]@\/components\/ui\/badge['"]/g, "from '@/components/ui/Badge'");
    changed = true;
  }
  
  // Fix ui/card imports
  if (content.includes("from '../ui/card'") || content.includes('from "../ui/card"')) {
    content = content.replace(/from ['"]\.\.\/ui\/card['"]/g, "from '../ui/Card'");
    changed = true;
  }
  if (content.includes("from '../../ui/card'") || content.includes('from "../../ui/card"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/ui\/card['"]/g, "from '../../ui/Card'");
    changed = true;
  }
  if (content.includes("from '../../../components/ui/card'") || content.includes('from "../../../components/ui/card"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/card['"]/g, "from '../../../components/ui/Card'");
    changed = true;
  }
  if (content.includes("from '../../components/ui/card'") || content.includes('from "../../components/ui/card"')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/components\/ui\/card['"]/g, "from '../../components/ui/Card'");
    changed = true;
  }
  if (content.includes("from '@/components/ui/card'") || content.includes('from "@/components/ui/card"')) {
    content = content.replace(/from ['"]@\/components\/ui\/card['"]/g, "from '@/components/ui/Card'");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Main execution
console.log('Fixing import paths...');

const files = [
  ...findFiles('./app'),
  ...findFiles('./components')
];

files.forEach(fixImports);

console.log('Import fixing complete!');
