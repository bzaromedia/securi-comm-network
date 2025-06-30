const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  if (line.includes('your_')) {
    console.error(`Error: Placeholder key found in .env file: ${line}`);
    process.exit(1);
  }
});

console.log('No placeholder keys found in .env file.');
