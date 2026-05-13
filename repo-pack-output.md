# Repo-Pack Export

Generated on: 2026-05-13T02:29:31.212Z
Total Files: 4

---

### File: `README.md`
```md
# 📦 repo-pack

> A lightning-fast CLI tool to bundle your entire codebase into a single markdown file, optimized for pasting into LLMs like Claude, ChatGPT, and Gemini.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2014-green)](https://nodejs.org/)

## 🤔 Why did I build this?
If you've ever tried to ask an AI to refactor a complex feature across multiple files, you know the pain of copying and pasting individual files into a chat window. It's slow, tedious, and error-prone. 

**`repo-pack`** solves this by instantly scanning your directory, respecting your `.gitignore` rules, filtering out images and binaries, and outputting one clean, perfectly formatted markdown file containing all your code context. Just drag, drop, and prompt!

---

## 🚀 Quick Start (No Installation Required)

You don't even need to install it locally! You can run it instantly anywhere using `npx`:

```bash
npx repo-pack
```

This will bundle the current directory into a file named `repo-pack-output.md`.

## 💻 Installation

If you want to install it globally to use everywhere without `npx`:

```bash
npm install -g repo-pack
```

## 🛠 Usage

Basic usage in your current directory:
```bash
repo-pack
```

Target a specific directory:
```bash
repo-pack ./src/components
```

Specify a custom output file name:
```bash
repo-pack . -o my-ai-context.md
```

Get help:
```bash
repo-pack --help
```

---

## 🧠 Smart Filtering

`repo-pack` is designed specifically for AI context windows, meaning it automatically ignores garbage that would waste tokens:
- ✅ **Respects `.gitignore`**: If it's ignored by Git, it's ignored by `repo-pack`.
- 🗑 **Skips Node/Build folders**: Automatically ignores `node_modules`, `dist`, `build`, `coverage`, etc.
- 🖼 **Skips Binaries & Media**: Ignores images (`.png`, `.jpg`), videos, PDFs, `.zip`, `.exe`, etc.
- 🔒 **Skips Lockfiles**: `package-lock.json` and `yarn.lock` are massive and usually useless for AI context, so they are excluded.

## 📄 Output Format

The output is formatted using standard markdown codeblocks, making it incredibly easy for the AI to parse file boundaries.

```markdown
# Repo-Pack Export

Generated on: 2026-05-12T12:00:00.000Z
Total Files: 2

---

### File: `package.json`
\`\`\`json
{
  "name": "my-app"
}
\`\`\`

### File: `src/index.js`
\`\`\`js
console.log("Hello AI!");
\`\`\`
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/davidbond17/repo-pack/issues).

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
```

### File: `bin/cli.js`
```js
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
```

### File: `package.json`
```json
{
  "name": "repo-pack",
  "version": "1.0.0",
  "description": "A CLI tool to bundle your entire codebase into a single markdown file for AI context.",
  "main": "bin/cli.js",
  "type": "module",
  "bin": {
    "repo-pack": "./bin/cli.js"
  },
  "scripts": {
    "start": "node ./bin/cli.js"
  },
  "keywords": [
    "ai",
    "llm",
    "context",
    "bundle",
    "cli"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "ignore": "^5.3.1"
  }
}
```

### File: `repo-pack/README.md`
```md
# repo-pack
A CLI tool where you run pack src/. It traverses the folder, ignores node_modules and hidden files, and compiles every code file into a single, beautifully formatted .txt or .md file. It prefixes each block with the file path. You then just drag and drop that single file into Claude and say "Refactor this."
```

