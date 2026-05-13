# repo-pack

> A lightning-fast CLI tool to bundle your entire codebase into a single markdown file, optimized for pasting into LLMs like Claude, ChatGPT, and Gemini.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2014-green)](https://nodejs.org/)

## Why did I build this?
If you've ever tried to ask an AI to refactor a complex feature across multiple files, you know the pain of copying and pasting individual files into a chat window. It's slow, tedious, and error-prone. 

**`repo-pack`** solves this by instantly scanning your directory, respecting your `.gitignore` rules, filtering out images and binaries, and outputting one clean, perfectly formatted markdown file containing all your code context. Just drag, drop, and prompt!

---

## Installation (Mac, Windows, and Linux)

This tool is designed to be installed globally on your machine so you can use it inside **any** of your projects. Follow these 3 exact steps:

**Step 1: Download the tool**
Clone this repository to your machine and navigate into the folder:
```bash
git clone https://github.com/davidbond17/repo-pack.git
cd repo-pack
```

**Step 2: Install dependencies**
Install the minimal required packages:
```bash
npm install
```

**Step 3: Register the command globally**
Run this command to create a global link on your computer. This tells your operating system that whenever you type `repo-pack`, it should run this script.
```bash
npm link
```
*(Note for Windows users: You may need to run your command prompt/terminal as Administrator for `npm link` to succeed without permission errors.)*

---

## Usage

Now that you have successfully run `npm link`, you can use the tool anywhere! 

**1. Navigate to the project you want to pack:**
```bash
cd path/to/your/other/project
```

**2. Run the tool directly:**
```bash
repo-pack
```
*(Notice there is no `npx` or `npm` in front of it!)*

This will instantly generate a `repo-pack-output.md` file in that folder containing your entire codebase.

### Advanced Usage Options

Target a specific sub-directory instead of the whole project:
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
