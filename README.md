# 🛡️ ENV Trace

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**ENV Trace** is a sleek, AST-powered CLI tool designed to audit, sync, and prune environment variables. It ensures your `process.env` calls in code never drift from your local `.env` and template files.

---

## ⚡ Features

- **🔍 AST Deep Scan**: Uses `acorn` to reliably find `process.env` usage, including destructuring and bracket access.
- **🔄 Smart Syncing**: Automatically detects missing keys and adds them to your `.env.example`.
- **🧹 Bloat Detection**: Identifies variables in your `.env` that aren't actually used in your codebase.
- **🎨 Beautiful Terminal UI**: Powered by `boxen`, `chalk`, and `ora` for a premium CLI experience.
- **🛡️ CI/CD Ready**: Returns non-zero exit codes when drift is detected, perfect for pre-commit hooks.

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/hacker-saran/env-trace.git

# Install dependencies
npm install

# Build the project
npm run build
```

### Usage

Run the trace to audit your current directory:

```bash
# Basic audit
npx env-trace

# Scan specific files and sync with example template
npx env-trace --include "src/**/*.ts" --sync
```

## 🛠️ How it Works

ENV Trace follows a structured four-stage workflow:

1.  **Crawl**: Uses `glob` to discover all source files within the project.
2.  **Parse**: Converts source code into an **Abstract Syntax Tree (AST)** using `acorn`.
3.  **Identify**: Deeply traverses the AST to find `MemberExpression` nodes (e.g., `process.env.DB_URL`) and `VariableDeclarator` patterns (e.g., `const { PORT } = process.env`).
4.  **Report**: Compares discovered keys against your `.env` and template files to detect missing or unused variables.

---

## 📦 Tech Stack

| Library | Role |
| :--- | :--- |
| **acorn** | High-performance JavaScript parser for AST generation |
| **commander** | Robust framework for building the CLI interface |
| **tsup** | Zero-config TypeScript bundler (CJS, ESM, d.ts) |
| **vitest** | Fast unit testing for the scanner and auditor |
| **dotenv** | Reliable parsing of environment variable files |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
