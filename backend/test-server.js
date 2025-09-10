// Test script to verify server startup
const { spawn } = require('child_process');

console.log('Testing server startup...');

const serverProcess = spawn('node', ['server.js'], {
  stdio: 'pipe'
});

let hasStarted = false;
let output = '';

// Capture output
serverProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(text);
  
  if (text.includes('Server is running on')) {
    hasStarted = true;
    console.log('✅ Server started successfully!');
    // Kill the server after successful startup
    setTimeout(() => {
      serverProcess.kill('SIGTERM');
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const text = data.toString();
  console.error('Error:', text);
});

serverProcess.on('close', (code) => {
  if (hasStarted) {
    console.log('✅ Server test completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Server failed to start properly');
    process.exit(1);
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!hasStarted) {
    console.log('❌ Server startup timeout');
    serverProcess.kill('SIGKILL');
    process.exit(1);
  }
}, 10000);
