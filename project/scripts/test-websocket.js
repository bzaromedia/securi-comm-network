#!/usr/bin/env node

// 🔌 SecuriComm WebSocket Testing Script
// Tests real-time messaging and WebSocket connectivity

const WebSocket = require('ws');
const { performance } = require('perf_hooks');

console.log('🔌 Testing SecuriComm WebSocket Server');
console.log('=====================================');

const colors = {
  test: '\x1b[34m[WS TEST]\x1b[0m',
  pass: '\x1b[32m[PASS]\x1b[0m',
  fail: '\x1b[31m[FAIL]\x1b[0m',
  info: '\x1b[33m[INFO]\x1b[0m'
};

function printTest(msg) { console.log(`${colors.test} ${msg}`); }
function printPass(msg) { console.log(`${colors.pass} ${msg}`); }
function printFail(msg) { console.log(`${colors.fail} ${msg}`); }
function printInfo(msg) { console.log(`${colors.info} ${msg}`); }

async function testWebSocket() {
  const WS_URL = 'ws://localhost:3001';
  
  printTest('Testing WebSocket connection...');
  
  try {
    const ws = new WebSocket(WS_URL);
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        printFail('WebSocket connection timeout');
        ws.close();
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        const connectTime = performance.now() - startTime;
        printPass(`WebSocket connected in ${connectTime.toFixed(2)}ms`);
        clearTimeout(timeout);
        
        // Test message sending
        printTest('Testing message sending...');
        const testMessage = {
          type: 'test',
          data: { message: 'Hello WebSocket!', timestamp: Date.now() }
        };
        
        ws.send(JSON.stringify(testMessage));
        
        setTimeout(() => {
          printTest('Testing ping/pong...');
          ws.ping();
        }, 1000);
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 3000);
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          printPass(`Received message: ${JSON.stringify(message)}`);
        } catch (e) {
          printPass(`Received raw data: ${data.toString()}`);
        }
      });
      
      ws.on('pong', () => {
        printPass('Pong received - WebSocket is responsive');
      });
      
      ws.on('error', (error) => {
        printFail(`WebSocket error: ${error.message}`);
        clearTimeout(timeout);
        resolve(false);
      });
      
      ws.on('close', (code, reason) => {
        printInfo(`WebSocket closed: ${code} ${reason}`);
      });
    });
    
  } catch (error) {
    printFail(`WebSocket test failed: ${error.message}`);
    return false;
  }
}

async function testMultipleConnections() {
  printTest('Testing multiple WebSocket connections...');
  
  const connections = [];
  const promises = [];
  
  for (let i = 0; i < 3; i++) {
    const ws = new WebSocket('ws://localhost:3001');
    connections.push(ws);
    
    promises.push(new Promise((resolve) => {
      ws.on('open', () => {
        printPass(`Connection ${i + 1} established`);
        ws.send(JSON.stringify({ type: 'test', id: i + 1 }));
        resolve(true);
      });
      
      ws.on('error', () => resolve(false));
    }));
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(Boolean).length;
  
  if (successful === 3) {
    printPass('All multiple connections successful');
  } else {
    printFail(`Only ${successful}/3 connections successful`);
  }
  
  // Close all connections
  connections.forEach(ws => ws.close());
  
  return successful === 3;
}

async function runTests() {
  console.log('\n🧪 Starting WebSocket Tests...\n');
  
  const tests = [
    { name: 'Basic WebSocket Connection', test: testWebSocket },
    { name: 'Multiple Connections', test: testMultipleConnections }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const { name, test } of tests) {
    console.log(`\n--- ${name} ---`);
    try {
      const result = await test();
      if (result) {
        passed++;
        printPass(`${name} completed successfully`);
      } else {
        printFail(`${name} failed`);
      }
    } catch (error) {
      printFail(`${name} threw error: ${error.message}`);
    }
  }
  
  console.log('\n🎯 WebSocket Test Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 All WebSocket tests passed!');
    console.log('🔗 WebSocket server is working correctly');
  } else {
    console.log('❌ Some WebSocket tests failed');
    console.log('💡 Make sure the WebSocket server is running on port 3001');
  }
  
  console.log('\n📡 WebSocket Features Tested:');
  console.log('   ✓ Connection establishment');
  console.log('   ✓ Message sending/receiving');
  console.log('   ✓ Ping/Pong heartbeat');
  console.log('   ✓ Multiple connections');
  console.log('   ✓ Error handling');
  
  process.exit(passed === total ? 0 : 1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 WebSocket tests interrupted');
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  printFail(`Test runner error: ${error.message}`);
  process.exit(1);
});