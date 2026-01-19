/**
 * Rate Limiting Test Script
 * 
 * Run this with: node test-rate-limit.js
 * Make sure your dev server is running on http://localhost:3000
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINT = '/api/fines';
const TOTAL_REQUESTS = 105; // More than the 100 request limit

let successCount = 0;
let rateLimitedCount = 0;
let otherErrors = 0;
let completed = 0;

console.log('🧪 Testing Rate Limiting...\n');
console.log(`Making ${TOTAL_REQUESTS} requests to ${TEST_ENDPOINT}`);
console.log('(Rate limit is 100 requests/minute for API routes)\n');

function makeRequest(index) {
  return new Promise((resolve) => {
    const url = new URL(TEST_ENDPOINT, BASE_URL);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        completed++;
        
        // Check status code
        if (res.statusCode === 200) {
          successCount++;
          process.stdout.write('.');
        } else if (res.statusCode === 429) {
          rateLimitedCount++;
          process.stdout.write('X');
          
          // Log rate limit headers on first 429
          if (rateLimitedCount === 1) {
            console.log('\n\n📊 Rate Limit Headers (first 429 response):');
            console.log(`   X-RateLimit-Limit: ${res.headers['x-ratelimit-limit']}`);
            console.log(`   X-RateLimit-Remaining: ${res.headers['x-ratelimit-remaining']}`);
            console.log(`   X-RateLimit-Reset: ${res.headers['x-ratelimit-reset']}`);
            console.log(`   Retry-After: ${res.headers['retry-after']} seconds`);
          }
        } else {
          otherErrors++;
          process.stdout.write('?');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`\n❌ Request error: ${error.message}`);
      otherErrors++;
      completed++;
      resolve();
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      otherErrors++;
      completed++;
      resolve();
    });
  });
}

// Make requests sequentially (to avoid overwhelming the server)
async function runTest() {
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    await makeRequest(i);
    
    // Small delay to avoid overwhelming
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n\n✅ Test Results:');
  console.log(`   Successful (200): ${successCount}`);
  console.log(`   Rate Limited (429): ${rateLimitedCount}`);
  console.log(`   Other Errors: ${otherErrors}`);
  console.log(`   Total Completed: ${completed}`);
  console.log('');
  
  if (rateLimitedCount > 0) {
    console.log('🎉 Rate limiting is working! You should see 429 responses after 100 requests.');
  } else {
    console.log('⚠️  No rate limiting detected. Make sure:');
    console.log('   1. Your dev server is running (npm run dev)');
    console.log('   2. Middleware is properly configured');
    console.log('   3. You\'re making requests fast enough (within 1 minute)');
  }
  
  // Test rate limit headers on a fresh request
  console.log('\n📊 Testing rate limit headers on a fresh request...');
  const url = new URL(TEST_ENDPOINT, BASE_URL);
  http.get(url, (res) => {
    console.log(`   X-RateLimit-Limit: ${res.headers['x-ratelimit-limit']}`);
    console.log(`   X-RateLimit-Remaining: ${res.headers['x-ratelimit-remaining']}`);
    console.log(`   X-RateLimit-Reset: ${res.headers['x-ratelimit-reset']}`);
  });
}

// Check if server is running first
console.log('🔍 Checking if server is running...\n');
const checkUrl = new URL('/', BASE_URL);
http.get(checkUrl, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ Server is running!\n');
    runTest();
  }
}).on('error', (error) => {
  console.error('❌ Cannot connect to server!');
  console.error('   Make sure your dev server is running: npm run dev');
  console.error(`   Error: ${error.message}`);
  process.exit(1);
});
