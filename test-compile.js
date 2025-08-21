const { execSync } = require('child_process');

try {
  console.log('Running TypeScript check...');
  const result = execSync('npx tsc --noEmit --maxNodeModuleJsDepth 0 --skipLibCheck', { 
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('✅ No TypeScript errors found!');
} catch (error) {
  console.log('❌ TypeScript errors found:');
  console.log(error.stdout || error.stderr || error.message);
  
  // Extract and show first 10 errors
  const output = error.stdout || error.stderr || '';
  const lines = output.split('\n').filter(line => line.trim());
  const errors = [];
  
  for (let i = 0; i < lines.length && errors.length < 10; i++) {
    if (lines[i].includes('error TS')) {
      errors.push(lines[i]);
    }
  }
  
  if (errors.length > 0) {
    console.log('\n📋 First 10 TypeScript errors:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
}
