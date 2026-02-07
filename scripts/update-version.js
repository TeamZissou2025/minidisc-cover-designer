#!/usr/bin/env node

/**
 * Version Update Script
 * 
 * Syncs version from version.config.js to all necessary files:
 * - package.json
 * - lib/constants.ts
 * 
 * Usage: npm run version:update
 */

const fs = require('fs');
const path = require('path');

// Load version config
const versionConfig = require('../version.config.js');

const ROOT = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const CONSTANTS_TS = path.join(ROOT, 'lib', 'constants.ts');

console.log('🔄 Updating version across project...\n');

// Update package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  packageJson.version = versionConfig.version;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json to v' + versionConfig.version);
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
  process.exit(1);
}

// Update lib/constants.ts
try {
  let constantsContent = fs.readFileSync(CONSTANTS_TS, 'utf8');
  
  // Check if VERSION export exists
  if (constantsContent.includes('export const VERSION')) {
    // Update existing VERSION
    constantsContent = constantsContent.replace(
      /export const VERSION = ['"][^'"]+['"]/,
      `export const VERSION = '${versionConfig.version}'`
    );
    
    // Update existing VERSION_INFO if it exists
    if (constantsContent.includes('export const VERSION_INFO')) {
      const versionInfoRegex = /export const VERSION_INFO = \{[^}]+\}/s;
      const newVersionInfo = `export const VERSION_INFO = {
  version: '${versionConfig.version}',
  releaseDate: '${versionConfig.releaseDate}',
  releaseName: '${versionConfig.releaseName}',
  features: '${versionConfig.features}',
}`;
      constantsContent = constantsContent.replace(versionInfoRegex, newVersionInfo);
    } else {
      // Add VERSION_INFO after VERSION
      const versionInfo = `
export const VERSION_INFO = {
  version: '${versionConfig.version}',
  releaseDate: '${versionConfig.releaseDate}',
  releaseName: '${versionConfig.releaseName}',
  features: '${versionConfig.features}',
}`;
      constantsContent = constantsContent.replace(
        /(export const VERSION = ['"][^'"]+['"])/,
        `$1${versionInfo}`
      );
    }
  } else {
    // Add VERSION and VERSION_INFO at the end
    const versionExports = `
// Version information
export const VERSION = '${versionConfig.version}';

export const VERSION_INFO = {
  version: '${versionConfig.version}',
  releaseDate: '${versionConfig.releaseDate}',
  releaseName: '${versionConfig.releaseName}',
  features: '${versionConfig.features}',
};
`;
    constantsContent += versionExports;
  }
  
  fs.writeFileSync(CONSTANTS_TS, constantsContent);
  console.log('✅ Updated lib/constants.ts to v' + versionConfig.version);
} catch (error) {
  console.error('❌ Failed to update lib/constants.ts:', error.message);
  process.exit(1);
}

// Print summary
console.log('\n📋 Version Summary:');
console.log(`   Version: ${versionConfig.version}`);
console.log(`   Release: ${versionConfig.releaseName}`);
console.log(`   Date: ${versionConfig.releaseDate}`);
console.log(`   Features: ${versionConfig.features}`);

console.log('\n📝 Changelog:');
versionConfig.changelog.forEach(item => {
  console.log(`   • ${item}`);
});

console.log('\n📡 API Status:');
Object.entries(versionConfig.apis).forEach(([name, info]) => {
  const status = info.active ? '✅' : '❌';
  const note = info.note ? ` (${info.note})` : '';
  console.log(`   ${status} ${info.icon} ${name}: ${info.resolution}${note}`);
});

console.log('\n✅ Version update complete!\n');
console.log('Next steps:');
console.log('  1. Review changes: git diff');
console.log('  2. Commit: git add . && git commit -m "v' + versionConfig.version + ' - ' + versionConfig.releaseName + '"');
console.log('  3. Deploy: git push\n');
