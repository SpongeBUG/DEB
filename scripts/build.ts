const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function buildBinaries() {
  const pkg = await fs.readFile('package.json', 'utf-8');
  const { version } = JSON.parse(pkg);
  const outDir = path.join(__dirname, '../dist/bin');

  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });

  const builds = [
    { name: 'windows', ext: '.exe' },
    { name: 'macos', ext: '' },
    { name: 'linux', ext: '' }
  ];

  try {
    console.log('Building binaries...');

    for (const build of builds) {
      const outFile = `deb-v${version}-${build.name}${build.ext}`;
      const command = `npx caxa --input "." --output "${path.join(outDir, outFile)}" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/dist/cli/index.js"`;

      console.log(`Building for ${build.name}...`);
      const { stdout, stderr } = await execAsync(command);

      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    }

    console.log('Build complete!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildBinaries().catch(console.error);