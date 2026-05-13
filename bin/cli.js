#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

// --- Configuration ---
const DEFAULT_IGNORES = [
  '.git',
  '.svn',
  '.hg',
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'repo-pack-output.md' // Prevent packing previous outputs
];

const BINARY_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.mp4', '.mov', '.avi', '.mp3', '.wav', '.flac',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.sqlite', '.db'
];

// --- Utility Functions ---

function isBinaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

function getGitignoreRules(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    return fs.readFileSync(gitignorePath, 'utf8');
  }
  return '';
}

function traverseDirectory(dir, ig, baseDir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(baseDir, filePath);
    
    // Check custom ignore rules + default ignores
    if (DEFAULT_IGNORES.some(ignoredItem => relativePath.includes(ignoredItem))) {
      continue;
    }
    
    if (ig.ignores(relativePath)) {
      continue;
    }

    if (stat && stat.isDirectory()) {
      results = results.concat(traverseDirectory(filePath, ig, baseDir));
    } else {
      if (!isBinaryFile(filePath)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

// --- Main Execution ---

async function main() {
  const args = process.argv.slice(2);
  
  // Basic help command
  if (args.includes('-h') || args.includes('--help')) {
    console.log(`
Usage: repo-pack [directory] [options]

Arguments:
  [directory]     The directory to pack. Defaults to the current directory (.).

Options:
  -o, --output    Output file name. Defaults to "repo-pack-output.md".
  -h, --help      Show this help message.

Example:
  repo-pack
  repo-pack ./src
  repo-pack . -o my-context.md
    `);
    process.exit(0);
  }

  // Parse args manually for simplicity and zero-deps
  let targetDir = process.cwd();
  let outputFile = 'repo-pack-output.md';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
      outputFile = args[i + 1] || outputFile;
      i++; // Skip next arg
    } else if (!args[i].startsWith('-')) {
      targetDir = path.resolve(process.cwd(), args[i]);
    }
  }

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Error: Directory not found -> ${targetDir}`);
    process.exit(1);
  }

  console.log(`📦 Packing codebase from: ${targetDir}`);

  // Setup ig checker
  const ig = ignore();
  const gitignoreContent = getGitignoreRules(targetDir);
  if (gitignoreContent) {
    ig.add(gitignoreContent);
    console.log('✅ Loaded .gitignore rules');
  }

  // Find all valid files
  console.log('🔍 Scanning files...');
  const files = traverseDirectory(targetDir, ig, targetDir);

  if (files.length === 0) {
    console.log('⚠️ No valid files found to pack.');
    process.exit(0);
  }

  console.log(`📝 Compiling ${files.length} files...`);

  let outputContent = `# Repo-Pack Export\n\n`;
  outputContent += `Generated on: ${new Date().toISOString()}\n`;
  outputContent += `Total Files: ${files.length}\n\n`;
  outputContent += `---\n\n`;

  for (const file of files) {
    const relativePath = path.relative(targetDir, file);
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      outputContent += `### File: \`${relativePath}\`\n`;
      // Determine language for markdown block
      let ext = path.extname(file).substring(1);
      if (!ext) ext = 'txt';
      
      outputContent += `\`\`\`${ext}\n`;
      outputContent += content;
      if (!content.endsWith('\n')) outputContent += '\n';
      outputContent += `\`\`\`\n\n`;
      
    } catch (err) {
      console.warn(`⚠️ Skipped ${relativePath}: Could not read file content.`);
    }
  }

  const outputPath = path.resolve(process.cwd(), outputFile);
  fs.writeFileSync(outputPath, outputContent, 'utf8');

  console.log(`✨ Success! Codebase packed into: ${outputFile}`);
  console.log(`👉 Just drag and drop ${outputFile} into Claude or ChatGPT!`);
}

main().catch(err => {
  console.error('❌ An unexpected error occurred:', err);
  process.exit(1);
});
