# repo-pack

> A lightning-fast CLI tool to bundle your entire codebase into a single markdown file, optimized for pasting into LLMs like Claude, ChatGPT, and Gemini.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2014-green)](https://nodejs.org/)

## Why did I build this?
If you've ever tried to ask an AI to refactor a complex feature across multiple files, you know the pain of copying and pasting individual files into a chat window. It's slow, tedious, and error-prone. 

**`repo-pack`** solves this by instantly scanning your directory, respecting your `.gitignore` rules, filtering out images and binaries, and outputting one clean, perfectly formatted markdown file containing all your code context. Just drag, drop, and prompt!

---

## Quick Start (No Installation Required)

You don't even need to install it locally! You can run it instantly anywhere using `npx`:

```bash
npx repo-pack
```

This will bundle the current directory into a file named `repo-pack-output.md`.

## Installation

If you want to install it globally to use everywhere without `npx`:

```bash
npm install -g repo-pack
```

## Usage

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

## Smart Filtering

`repo-pack` is designed specifically for AI context windows, meaning it automatically ignores garbage that would waste tokens:
- **Respects `.gitignore`**: If it's ignored by Git, it's ignored by `repo-pack`.
- **Skips Node/Build folders**: Automatically ignores `node_modules`, `dist`, `build`, `coverage`, etc.
- **Skips Binaries & Media**: Ignores images (`.png`, `.jpg`), videos, PDFs, `.zip`, `.exe`, etc.
- **Skips Lockfiles**: `package-lock.json` and `yarn.lock` are massive and usually useless for AI context, so they are excluded.

## Output Format

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

## Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/davidbond17/repo-pack/issues).

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
