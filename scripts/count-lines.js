#!/usr/bin/env node
import { readFileSync } from 'fs';
const maxLine = 500;
function countExecutableLines(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let count = 0;
  let inMultilineComment = false;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Handle multiline comments
    if (trimmed.startsWith('/*')) {
      inMultilineComment = true;
    }
    if (trimmed.endsWith('*/')) {
      inMultilineComment = false;
      continue;
    }
    if (inMultilineComment) {
      continue;
    }
    
    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith('//')) {
      continue;
    }
    
    count++;
  }
  
  return count;
}

const lineCount = countExecutableLines('./bin/cli.js');
console.log(`\n📊 Line Count: ${lineCount} / ${maxLine}`);

if (lineCount === maxLine) {
  console.log(`✅ Perfect! Exactly ${maxLine} lines.\n`);
  process.exit(0);
} else if (lineCount < maxLine) {
  console.log(`⚠️  Under limit by ${maxLine - lineCount} lines.\n`);
  process.exit(0);
} else {
  console.log(`❌ Over limit by ${lineCount - maxLine} lines!\n`);
  process.exit(1);
}