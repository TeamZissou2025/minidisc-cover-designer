#!/usr/bin/env node

/**
 * Version Bump Script
 * 
 * Auto-increments version number:
 * - patch: 0.3.7e → 0.3.7f
 * - minor: 0.3.7e → 0.4.0
 * - major: 0.3.7e → 1.0.0
 * 
 * Usage: npm run version:patch|minor|major
 */

const fs = require('fs');
const path = require('path');

const versionConfigPath = path.join(__dirname, '..', 'version.config.js');
const bumpType = process.argv[2] || 'patch';

// Load current version config
const versionConfig = require(versionConfigPath);
const currentVersion = versionConfig.version;

// Parse version (supports formats like: 0.3.7e, 0.3.7, 1.0.0)
const versionMatch = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)([a-z]?)$/);
if (!versionMatch) {
  console.error('❌ Invalid version format:', currentVersion);
  process.exit(1);
}

let [, major, minor, patch, letter] = versionMatch;
major = parseInt(major);
minor = parseInt(minor);
patch = parseInt(patch);

let newVersion;

switch (bumpType) {
  case 'patch':
    // Increment letter (e → f) or add 'a' if no letter
    if (letter) {
      const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
      newVersion = `${major}.${minor}.${patch}${nextLetter}`;
    } else {
      newVersion = `${major}.${minor}.${patch}a`;
    }
    break;
    
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
    
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
    
  default:
    console.error('❌ Invalid bump type. Use: patch, minor, or major');
    process.exit(1);
}

console.log(`🔄 Bumping version: ${currentVersion} → ${newVersion}\n`);

// Read version.config.js as text
let configContent = fs.readFileSync(versionConfigPath, 'utf8');

// Update version in config
configContent = configContent.replace(
  /version: ['"][^'"]+['"]/,
  `version: '${newVersion}'`
);

// Update release date to today
const today = new Date().toISOString().split('T')[0];
configContent = configContent.replace(
  /releaseDate: ['"][^'"]+['"]/,
  `releaseDate: '${today}'`
);

// Write updated config
fs.writeFileSync(versionConfigPath, configContent);

console.log('✅ Updated version.config.js');
console.log(`   Version: ${currentVersion} → ${newVersion}`);
console.log(`   Date: ${today}`);
console.log('\n⚠️  Next steps:');
console.log('   1. Edit version.config.js to update:');
console.log('      - releaseName');
console.log('      - features');
console.log('      - changelog');
console.log('   2. Run: npm run version:update');
console.log('   3. Commit and push\n');
