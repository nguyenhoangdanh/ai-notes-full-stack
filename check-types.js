const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of critical files to check
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/ui/Button.tsx',
  'types/index.ts',
  'lib/utils.ts'
];

function checkFile(file) {
  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck', file], {
      timeout: 10000
    });
    
    let output = '';
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.on('close', (code) => {
      resolve({ file, code, output });
    });
    
    tsc.on('error', (err) => {
      resolve({ file, code: -1, output: err.message });
    });
  });
}

async function main() {
  console.log('Checking critical files...');
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      console.log(`\nChecking ${file}...`);
      const result = await checkFile(file);
      
      if (result.code === 0) {
        console.log(`✅ ${file} - No errors`);
      } else {
        console.log(`❌ ${file} - Errors found:`);
        console.log(result.output);
      }
    } else {
      console.log(`⚠️  ${file} - File not found`);
    }
  }
}

main().catch(console.error);
