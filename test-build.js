// Simple test to check TypeScript compilation
import('./src/App.tsx').then(() => {
  console.log('✅ App component imported successfully');
}).catch((error) => {
  console.error('❌ Import failed:', error.message);
});