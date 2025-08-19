#!/usr/bin/env node

/**
 * Test authentication endpoints
 * Run this after starting the backend server
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.text();
    
    return {
      status: response.status,
      success: response.ok,
      data: data ? JSON.parse(data) : null,
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing AI Notes Backend Authentication...\n');

  // Test 1: Health check
  console.log('1. Testing Health Endpoint');
  const health = await testEndpoint('/health');
  console.log(`   Status: ${health.status} ${health.success ? '✅' : '❌'}`);
  if (health.data) {
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}`);
  }
  console.log();

  // Test 2: Auth endpoints (should return 401 for protected routes)
  console.log('2. Testing Protected Endpoints (should return 401)');
  
  const protectedEndpoints = ['/auth/me', '/notes', '/workspaces'];
  
  for (const endpoint of protectedEndpoints) {
    const result = await testEndpoint(endpoint);
    const expected401 = result.status === 401;
    console.log(`   ${endpoint}: ${result.status} ${expected401 ? '✅' : '❌'}`);
  }
  console.log();

  // Test 3: Try to register a test user
  console.log('3. Testing User Registration');
  const registerData = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };
  
  const register = await testEndpoint('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData),
  });
  
  console.log(`   Registration: ${register.status} ${register.success ? '✅' : '❌'}`);
  if (!register.success) {
    console.log(`   Error: ${JSON.stringify(register.data, null, 2)}`);
  }
  console.log();

  // Test 4: Try to login
  if (register.success || register.status === 409) { // 409 = user already exists
    console.log('4. Testing User Login');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    const login = await testEndpoint('/auth/login', {
      method: 'POST', 
      body: JSON.stringify(loginData),
    });
    
    console.log(`   Login: ${login.status} ${login.success ? '✅' : '❌'}`);
    
    if (login.success && login.data?.access_token) {
      console.log('   Got access token! ✅');
      
      // Test 5: Use token to access protected endpoint
      console.log('\n5. Testing Protected Endpoint with Token');
      const authTest = await testEndpoint('/auth/me', {
        headers: {
          'Authorization': `Bearer ${login.data.access_token}`,
        },
      });
      
      console.log(`   /auth/me with token: ${authTest.status} ${authTest.success ? '✅' : '❌'}`);
      if (authTest.success) {
        console.log(`   User: ${authTest.data.email} (${authTest.data.name})`);
      }
    } else {
      console.log(`   Login failed: ${JSON.stringify(login.data, null, 2)}`);
    }
  }

  console.log('\n✨ Authentication test complete!');
  console.log('\n🔧 If tests fail:');
  console.log('   1. Ensure PostgreSQL is running');
  console.log('   2. Run: cd ai-notes-backend && npm run prisma:generate');
  console.log('   3. Run: cd ai-notes-backend && npm run start:dev');
  console.log('   4. Check environment variables in .env file');
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };