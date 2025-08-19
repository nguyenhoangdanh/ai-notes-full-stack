#!/usr/bin/env node

/**
 * Test script to validate authentication configuration
 * without running the full server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking AI Notes Backend Configuration...\n');

// Check environment variables
const envPath = path.join(__dirname, '..', 'ai-notes-backend', '.env');
const envExists = fs.existsSync(envPath);

console.log(`📁 Environment file (.env): ${envExists ? '✅ Found' : '❌ Missing'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0]);
  
  const requiredVars = [
    'PORT',
    'NODE_ENV', 
    'FRONTEND_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CORS_ORIGINS'
  ];
  
  console.log('\n🔑 Required Environment Variables:');
  requiredVars.forEach(varName => {
    const isSet = envVars.includes(varName);
    console.log(`  ${varName}: ${isSet ? '✅ Set' : '❌ Missing'}`);
  });
  
  // Check CORS configuration
  const corsLine = envContent.split('\n').find(line => line.startsWith('CORS_ORIGINS='));
  if (corsLine) {
    const corsOrigins = corsLine.split('=')[1].replace(/"/g, '').split(',');
    console.log('\n🌐 CORS Origins:');
    corsOrigins.forEach(origin => {
      console.log(`  - ${origin.trim()}`);
    });
    
    const hasFrontendPort = corsOrigins.some(origin => origin.includes('5000'));
    console.log(`  Frontend port 5000 included: ${hasFrontendPort ? '✅ Yes' : '❌ No'}`);
  }
}

// Check key backend files
const backendPath = path.join(__dirname, '..', 'ai-notes-backend', 'src');
const keyFiles = [
  'main.ts',
  'app.module.ts',
  'auth/auth.controller.ts',
  'auth/auth.service.ts',
  'auth/strategies/jwt.strategy.ts',
  'auth/guards/jwt-auth.guard.ts',
  'config/config.environment.ts',
  'common/health.controller.ts',
  'notes/notes.controller.ts'
];

console.log('\n📦 Backend Files:');
keyFiles.forEach(file => {
  const filePath = path.join(backendPath, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
});

// Check frontend configuration
const frontendEnvPath = path.join(__dirname, '..', '.env.local');
const frontendEnvExists = fs.existsSync(frontendEnvPath);

console.log(`\n📱 Frontend Environment (.env.local): ${frontendEnvExists ? '✅ Found' : '❌ Missing'}`);

if (frontendEnvExists) {
  const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const apiBaseUrl = frontendEnvContent.split('\n')
    .find(line => line.startsWith('NEXT_PUBLIC_API_BASE_URL='))
    ?.split('=')[1];
  
  if (apiBaseUrl) {
    console.log(`  API Base URL: ${apiBaseUrl}`);
    const isCorrectPort = apiBaseUrl.includes('3001');
    console.log(`  Points to backend port 3001: ${isCorrectPort ? '✅ Yes' : '❌ No'}`);
  }
}

// Check package.json scripts
const backendPackagePath = path.join(__dirname, '..', 'ai-notes-backend', 'package.json');
if (fs.existsSync(backendPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  console.log('\n🔧 Backend Scripts:');
  const scripts = ['start:dev', 'build', 'start'];
  scripts.forEach(script => {
    const hasScript = packageJson.scripts && packageJson.scripts[script];
    console.log(`  ${script}: ${hasScript ? '✅ Available' : '❌ Missing'}`);
  });
}

console.log('\n🎯 Next Steps:');
console.log('1. Ensure database is running (PostgreSQL)');
console.log('2. Run: cd ai-notes-backend && npm run prisma:generate');
console.log('3. Run: cd ai-notes-backend && npm run start:dev');
console.log('4. In another terminal: cd .. && npm run dev');
console.log('5. Test authentication at http://localhost:5000');

console.log('\n✨ Configuration check complete!');