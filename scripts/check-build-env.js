const { platform, arch, version } = process;
console.log('--- build-env ---');
console.log('node version:', version);
console.log('platform:', platform);
console.log('arch:', arch);
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function listPackage(name) {
  try {
    const p = require.resolve(name, { paths: [root] });
    console.log(name, '->', p);
  } catch (e) {
    console.log(name, '-> NOT FOUND');
  }
}

[ '@rollup/rollup-linux-x64-gnu', '@rollup/rollup-win32-x64-msvc', '@rollup/wasm-node', 'rollup' ].forEach(listPackage);

// print a short ls of node_modules/@rollup if present
const rollupDir = path.join(root, 'node_modules', '@rollup');
if (fs.existsSync(rollupDir)) {
  console.log('\n@rollup packages:');
  fs.readdirSync(rollupDir).forEach(f => console.log(' -', f));
} else {
  console.log('\n@rollup directory not present');
}
console.log('--- end build-env ---');
