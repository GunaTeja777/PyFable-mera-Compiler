# 🦋 PyFable Studio — Fable 5 Edition

PyFable is a premium, lightweight, responsive, and completely browser-based Python IDE. Built using the modern WebAssembly runtime (**Pyodide**), **CodeMirror 6**, **TypeScript**, and **Tailwind CSS v4**, it allows developers to run Python code with zero installations, local imports support via a Virtual File System, and interactive package installations from PyPI.

---

## ✨ Features

- 🐍 **WASM Python Runtime**: Full Python execution directly inside your browser powered by Pyodide (v0.25.0).
- 📂 **Virtual File System (VFS)**: Write code across multiple files (`main.py`, `utils.py`), rename, delete, and import local modules seamlessly (changes are persisted in `localStorage`).
- 📦 **PyPI Package Installer**: Install external packages (like `numpy`, `requests`, `sympy`) directly from PyPI via `micropip` runtime bootstrap.
- 🎨 **Botanical Design Aesthetic**: A curated user interface supporting light/dark theme switching (Parchment vs. Charcoal), customized editor styling, and sleek typography (JetBrains Mono & Lato).
- 🦋 **Visual Delight animations**: Elegant butterfly micro-animations triggering on successful/error execution states.
- ⌨️ **Vim Mode & Keymaps**: Toggle keymaps from settings between standard and Vim bindings.
- 💻 **Offline & Static friendly**: Entirely client-side application requiring no server backend. Highly suitable for static hosting.

---

## 🛠️ Technology Stack

- **Core Framework**: Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Code Editor**: CodeMirror 6 (with Python syntax parsing, autocomplete, active line highlighter, and responsive configurations)
- **Engine**: Pyodide (WASM)

---

## 🚀 Getting Started

### Prerequisites

You only need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/PyFable.git
   cd PyFable
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser to start writing code!

### Production Build

To compile and optimize the application for deployment:
```bash
npm run build
```
This will generate production-ready files in the `dist/` directory.

---

## 🌐 Deployment Options

Because PyFable is a fully client-side static application, you can host it for free on:
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

*For automated GitHub Actions deployment setups, refer to our [Deployment Guide](./artifacts/deploy_and_opensource_guide.md).*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
