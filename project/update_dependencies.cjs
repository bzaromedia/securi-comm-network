
const { execSync } = require('child_process');
const fs = require('fs');

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

const updateDependencies = (deps, isDev) => {
  for (const pkg in deps) {
    try {
      const latestVersion = execSync(`npm view ${pkg} version`).toString().trim();
      console.log(`Updating ${pkg} to ${latestVersion}...`);
      const command = `npm install ${isDev ? '--save-dev' : '--save'} ${pkg}@${latestVersion}`;
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to update ${pkg}: ${error.message}`);
    }
  }
};

console.log('Updating dependencies...');
updateDependencies(dependencies, false);

console.log('Updating devDependencies...');
updateDependencies(devDependencies, true);

console.log('All dependencies have been updated.');
