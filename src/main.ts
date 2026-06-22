import './style.css';
import { FileSystem, VirtualFile } from './fs';
import { CodeStudioEditor } from './editor';
import { PackageManager } from './packages';
import { EXAMPLES } from './examples';

declare global {
  interface Window {
    loadPyodide: any;
    js_input_handler: (promptStr: string) => string;
  }
}

// ── APP DOM ELEMENTS ──
const dom = {
  loadingOverlay: document.getElementById('loading-overlay') as HTMLElement,
  pyver: document.getElementById('pyver') as HTMLElement,
  btnRun: document.getElementById('btn-run') as HTMLButtonElement,
  btnClear: document.getElementById('btn-clear') as HTMLButtonElement,
  btnFormat: document.getElementById('btn-format') as HTMLButtonElement,
  btnTogglePackages: document.getElementById('btn-toggle-packages') as HTMLButtonElement,
  btnToggleSettings: document.getElementById('btn-toggle-settings') as HTMLButtonElement,
  exampleSel: document.getElementById('example-sel') as HTMLSelectElement,
  
  // Sidebars
  sidebarPanel: document.getElementById('sidebar-panel') as HTMLElement,
  packageSection: document.getElementById('package-section') as HTMLElement,
  settingsSection: document.getElementById('settings-section') as HTMLElement,
  btnNewFile: document.getElementById('btn-new-file') as HTMLButtonElement,
  fileList: document.getElementById('file-list') as HTMLElement,
  
  // Packages
  packageInput: document.getElementById('package-input') as HTMLInputElement,
  btnInstallPackage: document.getElementById('btn-install-package') as HTMLButtonElement,
  packageStatus: document.getElementById('package-status') as HTMLElement,
  installedPackagesList: document.getElementById('installed-packages-list') as HTMLElement,
  btnClosePackages: document.getElementById('btn-close-packages') as HTMLButtonElement,
  
  // Settings
  settingFontSize: document.getElementById('setting-font-size') as HTMLSelectElement,
  settingTheme: document.getElementById('setting-theme') as HTMLSelectElement,
  settingKeymap: document.getElementById('setting-keymap') as HTMLSelectElement,
  settingAutosave: document.getElementById('setting-autosave') as HTMLInputElement,
  btnCloseSettings: document.getElementById('btn-close-settings') as HTMLButtonElement,
  
  // Panels
  editorHolder: document.getElementById('editor-holder') as HTMLElement,
  currentFilename: document.getElementById('current-filename') as HTMLElement,
  saveStatus: document.getElementById('save-status') as HTMLElement,
  output: document.getElementById('output') as HTMLElement,
  execBadge: document.getElementById('exec-badge') as HTMLElement,
  btnCopyOutput: document.getElementById('btn-copy-output') as HTMLButtonElement,
  btnDownloadOutput: document.getElementById('btn-download-output') as HTMLButtonElement,
  
  // Mobile Tabs
  mobileTabs: document.querySelectorAll('.mobile-tab'),
  appContainer: document.getElementById('app') as HTMLElement,
  
  // Status bar
  sdot: document.getElementById('sdot') as HTMLElement,
  stext: document.getElementById('stext') as HTMLElement,
  sline: document.getElementById('sline') as HTMLElement,
};

// ── STATE ──
const fs = new FileSystem();
let activeFile: VirtualFile = fs.getFiles()[0] || { name: 'main.py', content: '' };
let editor: CodeStudioEditor | null = null;
let pyodide: any = null;
let pyReady = false;
let packageManager: PackageManager | null = null;
let runStartTime = 0;
let isDirty = false;

// ── INITIALIZATION ──
async function initApp() {
  setupEditor();
  setupUIEvents();
  renderFileList();
  setupMobileTabs();
  await loadPyodideRuntime();
}

// Set up CodeMirror editor
function setupEditor() {
  editor = new CodeStudioEditor({
    parent: dom.editorHolder,
    initialCode: activeFile.content,
    fontSize: dom.settingFontSize.value,
    onUpdate: (code) => {
      isDirty = true;
      activeFile.content = code;
      dom.saveStatus.textContent = 'Unsaved changes';
      dom.saveStatus.className = 'save-status-indicator dirty';
      
      if (dom.settingAutosave.checked) {
        fs.updateFileContent(activeFile.name, code);
        isDirty = false;
        dom.saveStatus.textContent = 'Saved';
        dom.saveStatus.className = 'save-status-indicator';
      }
    },
    onCursorMove: (line, col) => {
      dom.sline.textContent = `Ln ${line}, Col ${col}`;
    },
    onRunShortcut: () => {
      if (pyReady) {
        runCode();
      }
    }
  });
  
  updateEditorHeader();
}

function saveActiveFileContent() {
  if (editor && activeFile) {
    const code = editor.getValue();
    fs.updateFileContent(activeFile.name, code);
    activeFile.content = code;
    isDirty = false;
    dom.saveStatus.textContent = 'Saved';
    dom.saveStatus.className = 'save-status-indicator';
  }
}

// ── PYODIDE RUNTIME LOADER ──
async function loadPyodideRuntime() {
  try {
    setStatus('running', 'Initializing WebAssembly Python…');
    
    // Call loadPyodide from window script
    pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

    const ver = pyodide.runPython('import sys; ".".join(map(str, sys.version_info[:3]))');
    dom.pyver.textContent = `Python ${ver}`;
    pyReady = true;
    
    // Initialize Package Manager
    packageManager = new PackageManager(pyodide, (packages) => {
      renderInstalledPackages(packages);
    });
    await packageManager.initMicropip();

    // Hook standard blocking input prompt
    window.js_input_handler = (promptStr: string) => {
      const inputVal = prompt(promptStr || "Input requested:");
      return inputVal !== null ? inputVal : "";
    };

    // Override Python input() with our JS hook
    pyodide.runPython(`
import builtins
import js
def custom_input(prompt_str=""):
    return js.js_input_handler(prompt_str)
builtins.input = custom_input
`);

    dom.loadingOverlay.style.display = 'none';
    dom.btnRun.disabled = false;
    setStatus('ready', 'Ready');
    clearOutput();
    
    appendOut('✦ PyFable ready — Claude Fable 5 Edition', 'sys-line');
    appendOut(`  Python ${ver} running in your browser via WebAssembly`, 'sys-line');
    appendOut('  Press Ctrl+Enter or click Run to execute code.', 'sys-line');
    appendOut('', 'sys-line');
    appendOut('  🦋  A butterfly will fly by on every successful run.', 'sys-line');
    
  } catch (e: any) {
    dom.loadingOverlay.style.display = 'none';
    clearOutput();
    appendOut('✗ Failed to load Python runtime: ' + e.message, 'err-line');
    setStatus('error', 'Runtime failed');
  }
}

// ── CODE EXECUTION ──
async function runCode() {
  if (!pyReady || !editor) return;

  // Make sure current changes are saved
  saveActiveFileContent();

  const code = editor.getValue().trim();
  if (!code) return;

  clearOutput();
  setStatus('running', 'Running…');
  dom.btnRun.disabled = true;
  dom.execBadge.style.display = 'none';

  runStartTime = performance.now();

  try {
    // Write all VFS files to Pyodide's virtual filesystem
    // This makes local imports work out of the box!
    for (const file of fs.getFiles()) {
      pyodide.FS.writeFile(file.name, file.content);
    }

    // Set up stdout/stderr capture redirection in Python
    pyodide.runPython(`
import sys
from io import StringIO
_cap_out = StringIO()
_cap_err = StringIO()
sys.stdout = _cap_out
sys.stderr = _cap_err
`);

    let hadError = false;
    try {
      // Execute the active file
      pyodide.runPython(code);
    } catch (e: any) {
      hadError = true;
      const errMsg = e.message || String(e);
      appendOut(errMsg, 'err-line');
    }

    // Read streams
    const stdout = pyodide.runPython('_cap_out.getvalue()');
    const stderr = pyodide.runPython('_cap_err.getvalue()');
    
    // Restore streams
    pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');

    if (stdout) {
      stdout.split('\n').forEach((line: string) => {
        // Prevent printing final trailing newline as separate empty element
        if (line || stdout.endsWith(line)) {
          appendOut(line, 'out-line');
        }
      });
    }
    
    if (stderr && stderr.trim()) {
      hadError = true;
      stderr.split('\n').forEach((line: string) => {
        if (line) appendOut(line, 'err-line');
      });
    }

    const duration = (performance.now() - runStartTime).toFixed(1);
    dom.execBadge.style.display = 'inline';
    
    if (!hadError) {
      setStatus('ready', `Done in ${duration} ms`);
      dom.execBadge.textContent = `✓ ${duration} ms`;
      dom.execBadge.style.color = 'var(--teal)';
      flyButterfly(true);
    } else {
      setStatus('error', 'Completed with errors');
      dom.execBadge.textContent = `✗ ${duration} ms`;
      dom.execBadge.style.color = 'var(--red)';
      flyButterfly(false);
    }

  } catch (e: any) {
    appendOut('Unexpected runner error: ' + e.message, 'err-line');
    setStatus('error', 'Runtime error');
    flyButterfly(false);
  } finally {
    dom.btnRun.disabled = false;
  }
}

// ── VIRTUAL FILE EXPLORER UI ──
let isCreatingFile = false;
let renamingFileName: string | null = null;

function renderFileList() {
  dom.fileList.innerHTML = '';
  const files = fs.getFiles();

  files.forEach(file => {
    const li = document.createElement('li');
    
    // Check if we are renaming this specific file
    if (renamingFileName === file.name) {
      li.className = 'file-item input-item active';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'file-item-name';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'rename-file-name-input';
      input.value = file.name;
      nameSpan.appendChild(input);
      li.appendChild(nameSpan);
      
      const actions = document.createElement('div');
      actions.className = 'file-input-actions';
      
      const btnSave = document.createElement('button');
      btnSave.className = 'btn-file-action';
      btnSave.innerHTML = '✔';
      btnSave.title = 'Save';
      btnSave.onclick = (e) => {
        e.stopPropagation();
        submitRename(file.name, input.value);
      };
      actions.appendChild(btnSave);
      
      const btnCancel = document.createElement('button');
      btnCancel.className = 'btn-file-action';
      btnCancel.innerHTML = '✖';
      btnCancel.title = 'Cancel';
      btnCancel.onclick = (e) => {
        e.stopPropagation();
        renamingFileName = null;
        renderFileList();
      };
      actions.appendChild(btnCancel);
      
      li.appendChild(actions);
      
      // key events on input
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          submitRename(file.name, input.value);
        } else if (e.key === 'Escape') {
          renamingFileName = null;
          renderFileList();
        }
      };
      
      dom.fileList.appendChild(li);
      setTimeout(() => input.focus(), 50);
      return;
    }

    li.className = `file-item ${file.name === activeFile.name ? 'active' : ''}`;
    li.setAttribute('role', 'treeitem');
    
    // File Label Left
    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-item-name';
    nameSpan.innerHTML = `🐍 ${file.name}`;
    li.appendChild(nameSpan);
    
    // Actions Right
    const actions = document.createElement('div');
    actions.className = 'file-actions';
    
    // Rename button
    const btnRename = document.createElement('button');
    btnRename.className = 'btn-file-action';
    btnRename.innerHTML = '✏️';
    btnRename.title = 'Rename file';
    btnRename.onclick = (e) => {
      e.stopPropagation();
      renamingFileName = file.name;
      renderFileList();
    };
    actions.appendChild(btnRename);
    
    // Delete button
    if (files.length > 1) {
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-file-action';
      btnDelete.innerHTML = '🗑️';
      btnDelete.title = 'Delete file';
      btnDelete.onclick = (e) => {
        e.stopPropagation();
        deleteFilePrompt(file.name);
      };
      actions.appendChild(btnDelete);
    }
    
    li.appendChild(actions);
    
    // Click to select
    li.onclick = () => selectFile(file.name);
    
    dom.fileList.appendChild(li);
  });

  // If currently creating a new file, append an input item at the end of the list
  if (isCreatingFile) {
    const li = document.createElement('li');
    li.className = 'file-item input-item active';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-item-name';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'new-file-name-input';
    input.placeholder = 'filename.py';
    nameSpan.appendChild(input);
    li.appendChild(nameSpan);
    
    const actions = document.createElement('div');
    actions.className = 'file-input-actions';
    
    const btnSave = document.createElement('button');
    btnSave.className = 'btn-file-action';
    btnSave.innerHTML = '✔';
    btnSave.title = 'Save';
    btnSave.onclick = (e) => {
      e.stopPropagation();
      submitNewFile(input.value);
    };
    actions.appendChild(btnSave);
    
    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn-file-action';
    btnCancel.innerHTML = '✖';
    btnCancel.title = 'Cancel';
    btnCancel.onclick = (e) => {
      e.stopPropagation();
      isCreatingFile = false;
      renderFileList();
    };
    actions.appendChild(btnCancel);
    
    li.appendChild(actions);
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        submitNewFile(input.value);
      } else if (e.key === 'Escape') {
        isCreatingFile = false;
        renderFileList();
      }
    };
    
    dom.fileList.appendChild(li);
    setTimeout(() => input.focus(), 50);
  }
}

function selectFile(name: string) {
  saveActiveFileContent();
  const file = fs.getFile(name);
  if (file) {
    activeFile = file;
    if (editor) {
      editor.setValue(file.content);
      editor.focus();
    }
    updateEditorHeader();
    renderFileList();
    
    // If on mobile, switch view to editor tab
    if (window.innerWidth <= 768) {
      switchMobileTab('editor');
    }
  }
}

function updateEditorHeader() {
  dom.currentFilename.textContent = activeFile.name;
  dom.saveStatus.textContent = isDirty ? 'Unsaved changes' : 'Saved';
  dom.saveStatus.className = `save-status-indicator ${isDirty ? 'dirty' : ''}`;
}

function createNewFile() {
  if (isCreatingFile) return;
  isCreatingFile = true;
  renderFileList();
}

function submitNewFile(name: string) {
  let cleanName = name.trim();
  if (!cleanName) {
    isCreatingFile = false;
    renderFileList();
    return;
  }
  
  if (!cleanName.endsWith('.py')) {
    cleanName += '.py';
  }

  const files = fs.getFiles();
  if (files.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
    alert(`A file named "${cleanName}" already exists!`);
    return;
  }

  const created = fs.createFile(cleanName, `# Virtual Python file: ${cleanName}\n\n`);
  isCreatingFile = false;
  renderFileList();
  if (created) {
    selectFile(created.name);
  }
}

function submitRename(oldName: string, newName: string) {
  let cleanName = newName.trim();
  if (!cleanName || cleanName === oldName) {
    renamingFileName = null;
    renderFileList();
    return;
  }

  if (!cleanName.endsWith('.py')) {
    cleanName += '.py';
  }

  const files = fs.getFiles();
  if (files.some(f => f.name.toLowerCase() === cleanName.toLowerCase() && f.name !== oldName)) {
    alert(`A file named "${cleanName}" already exists!`);
    return;
  }

  const updated = fs.renameFile(oldName, cleanName);
  renamingFileName = null;
  renderFileList();
  if (updated) {
    if (activeFile.name === oldName) {
      activeFile = updated;
    }
    updateEditorHeader();
  }
}

function deleteFilePrompt(name: string) {
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
    const success = fs.deleteFile(name);
    if (success) {
      if (activeFile.name === name) {
        activeFile = fs.getFiles()[0];
        if (editor) {
          editor.setValue(activeFile.content);
        }
      }
      renderFileList();
      updateEditorHeader();
    }
  }
}

// ── PACKAGES & SETTINGS DRAWER TOGGLES ──
function toggleSection(section: 'packages' | 'settings') {
  const isMobile = window.innerWidth <= 768;

  if (section === 'packages') {
    dom.settingsSection.classList.add('hidden');
    dom.packageSection.classList.toggle('hidden');
  } else {
    dom.packageSection.classList.add('hidden');
    dom.settingsSection.classList.toggle('hidden');
  }

  // Handle panel width visibility on Desktop
  if (!isMobile) {
    const showSidebar = !dom.packageSection.classList.contains('hidden') || !dom.settingsSection.classList.contains('hidden');
    dom.sidebarPanel.style.width = showSidebar ? '280px' : '0px';
  } else {
    // If mobile, switch tab to files (which contains sidebars)
    switchMobileTab('files');
  }
}

// ── PACKAGE INSTALLER UI ──
async function handleInstallPackage() {
  if (!packageManager || !pyReady) return;
  const pkgName = dom.packageInput.value.trim();
  if (!pkgName) return;

  dom.btnInstallPackage.disabled = true;
  setStatus('running', `Installing ${pkgName}…`);
  
  try {
    await packageManager.install(pkgName, (statusText) => {
      dom.packageStatus.textContent = statusText;
    });
    dom.packageInput.value = '';
    setStatus('ready', 'Package installed');
  } catch (e) {
    setStatus('error', 'Installation failed');
  } finally {
    dom.btnInstallPackage.disabled = false;
  }
}

function renderInstalledPackages(packages: string[]) {
  dom.installedPackagesList.innerHTML = '';
  packages.forEach(pkg => {
    const li = document.createElement('li');
    li.innerHTML = `<span>📦 ${pkg}</span>`;
    
    // Core indicator
    if (pkg === 'builtins' || pkg === 'sys') {
      const span = document.createElement('span');
      span.style.opacity = '0.5';
      span.style.fontSize = '9px';
      span.textContent = 'core';
      li.appendChild(span);
    }
    
    dom.installedPackagesList.appendChild(li);
  });
}

// ── SETTINGS AND THEME CHANGERS ──
function applySettings() {
  const fontSize = dom.settingFontSize.value;
  if (editor) {
    editor.setFontSize(fontSize);
  }

  // Theme changer
  const theme = dom.settingTheme.value;
  if (theme === 'dark-ink') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// ── MOBILE TAB SYSTEM ──
function setupMobileTabs() {
  dom.mobileTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).getAttribute('data-tab');
      if (target) {
        switchMobileTab(target);
      }
    });
  });
}

function switchMobileTab(tab: string) {
  // Update button active states
  dom.mobileTabs.forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Update layout classes
  dom.appContainer.classList.remove('active-tab-files', 'active-tab-editor', 'active-tab-output');
  dom.appContainer.classList.add(`active-tab-${tab}`);
}

// ── UTILITIES ──
function setStatus(state: 'ready' | 'running' | 'error', text: string) {
  dom.sdot.className = `sdot ${state}`;
  dom.stext.textContent = text;
}

function appendOut(text: string, cls: string) {
  const el = document.createElement('span');
  el.className = cls;
  el.textContent = text + '\n';
  dom.output.appendChild(el);
  dom.output.scrollTop = dom.output.scrollHeight;
}

function clearOutput() {
  dom.output.innerHTML = '';
  dom.execBadge.style.display = 'none';
}

function formatCode() {
  if (!editor) return;
  const val = editor.getValue();
  const clean = val.split('\n').map(l => l.trimEnd()).join('\n');
  editor.setValue(clean);
}

function loadExampleSnippet(key: string) {
  if (key && EXAMPLES[key] && editor) {
    // Confirm override if dirty
    if (isDirty && !confirm("Discard current changes in this file?")) {
      dom.exampleSel.value = '';
      return;
    }
    
    editor.setValue(EXAMPLES[key]);
    editor.focus();
    dom.exampleSel.value = '';
    
    // Switch to editor view if on mobile
    if (window.innerWidth <= 768) {
      switchMobileTab('editor');
    }
  }
}

// Copy output content to clipboard
async function copyOutputToClipboard() {
  const text = dom.output.innerText;
  try {
    await navigator.clipboard.writeText(text);
    const prevText = dom.btnCopyOutput.textContent;
    dom.btnCopyOutput.textContent = 'Copied!';
    setTimeout(() => {
      dom.btnCopyOutput.textContent = prevText;
    }, 1500);
  } catch (err) {
    console.error('Could not copy output: ', err);
  }
}

// Download output text file
function downloadOutputLog() {
  const text = dom.output.innerText;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pyfable_output_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createButterflySVG(colorType: 'green' | 'red' | 'blue') {
  let upperColor = '#2E7D6E';
  let lowerColor = '#4A7BC4';
  
  if (colorType === 'green') {
    upperColor = 'var(--teal)';
    lowerColor = 'var(--sage)';
  } else if (colorType === 'red') {
    upperColor = 'var(--red)';
    lowerColor = 'var(--amber)';
  } else if (colorType === 'blue') {
    upperColor = 'var(--blue)';
    lowerColor = 'var(--teal)';
  }

  return `
    <svg width="64" height="48" viewBox="0 0 80 54">
      <g class="fw-left">
        <ellipse cx="26" cy="20" rx="20" ry="13" fill="${upperColor}" opacity=".92" transform="rotate(-28,26,20)"/>
        <ellipse cx="18" cy="32" rx="13" ry="8" fill="${lowerColor}" opacity=".8" transform="rotate(12,18,32)"/>
        <circle cx="20" cy="18" r="3.5" fill="rgba(232,220,191,.35)"/>
      </g>
      <g class="fw-right">
        <ellipse cx="54" cy="20" rx="20" ry="13" fill="${upperColor}" opacity=".92" transform="rotate(28,54,20)"/>
        <ellipse cx="62" cy="32" rx="13" ry="8" fill="${lowerColor}" opacity=".8" transform="rotate(-12,62,32)"/>
        <circle cx="60" cy="18" r="3.5" fill="rgba(232,220,191,.35)"/>
      </g>
      <ellipse cx="40" cy="27" rx="3" ry="15" fill="#1C1409"/>
      <circle cx="40" cy="11" r="3.2" fill="#1C1409"/>
      <line x1="37.5" y1="10" x2="29" y2="2" stroke="#1C1409" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="42.5" y1="10" x2="51" y2="2" stroke="#1C1409" stroke-width="1.4" stroke-linecap="round"/>
    </svg>
  `;
}

// ── Flying butterfly animation ──
function flyButterfly(isSuccess: boolean) {
  const colors: ('blue' | 'red' | 'green')[] = isSuccess 
    ? ['blue', 'red', 'green'] 
    : ['red'];

  const count = isSuccess ? 8 : 6;

  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    
    const b = document.createElement('div');
    b.className = 'flying-butterfly';
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = createButterflySVG(color);
    
    const scale = 0.55 + Math.random() * 0.55; // scale between 0.55 and 1.1
    const startY = 10 + Math.random() * 70; // 10% to 80% height
    const endY = 10 + Math.random() * 70;
    const delay = Math.random() * 800; // stagger start times up to 800ms
    const duration = 2.5 + Math.random() * 1.5; // fly speed between 2.5s and 4.0s
    
    b.style.position = 'fixed';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '9999';
    b.style.left = '-100px';
    b.style.top = `${startY}%`;
    b.style.transform = `scale(${scale})`;
    b.style.display = 'block';
    
    document.body.appendChild(b);
    
    // Animate after delay
    setTimeout(() => {
      b.style.transition = `left ${duration}s cubic-bezier(.35, 0, .25, 1), top ${duration}s ease-in-out`;
      b.style.left = 'calc(100vw + 100px)';
      b.style.top = `${endY}%`;
    }, Math.max(20, delay));
    
    // Cleanup after animation completes
    setTimeout(() => {
      b.remove();
    }, Math.max(20, delay) + duration * 1000 + 100);
  }

  // Trigger majestic flying Pegasus animation on success only
  if (isSuccess) {
    triggerPegasusAnimation();
  }
}

function createPegasusSVG() {
  return `
    <svg class="pegasus-svg" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pegasus-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FAF6EC" />
          <stop offset="45%" stop-color="#E2A92D" />
          <stop offset="100%" stop-color="#C84B2F" />
        </linearGradient>
        <linearGradient id="wing-grad-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#4aa899" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#2e7d6e" stop-opacity="0.95" />
        </linearGradient>
        <linearGradient id="wing-grad-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#1c1409" stop-opacity="0.65" />
        </linearGradient>
        <linearGradient id="gold-hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FAF6EC" />
          <stop offset="100%" stop-color="#D4920A" />
        </linearGradient>
      </defs>
      
      <!-- Back Wing -->
      <path class="pegasus-wing-back" d="M 65,40 C 58,19 43,6 23,0 C 30,13 40,26 54,39 C 42,33 30,29 15,25 C 24,34 36,40 54,42 C 40,40 28,36 16,32 C 28,40 40,44 61,42 Z" fill="url(#wing-grad-back)" />
      
      <!-- Back Leg Far -->
      <path class="pegasus-leg-back-far" d="M54,60 L45,72 L36,82 L39,85 L49,75 L58,62 Z" fill="url(#pegasus-body-grad)" />
      
      <!-- Front Leg Far -->
      <path class="pegasus-leg-front-far" d="M84,56 L90,64 L96,68 L93,71 L86,66 L80,57 Z" fill="url(#pegasus-body-grad)" />
      
      <!-- Body & Head -->
      <path class="pegasus-body" d="M 100,25 C 104,22 108,18 107,14 C 105,10 99,14 96,18 L 92,10 L 89,14 C 84,21 78,28 75,34 C 70,34 60,36 50,38 C 42,38 38,36 38,40 C 38,44 42,48 46,50 C 50,56 55,62 60,64 C 70,66 80,64 86,58 C 92,54 95,44 97,36 C 96,30 98,27 100,25 Z" fill="url(#pegasus-body-grad)" />
      
      <!-- Tail -->
      <path class="pegasus-tail" d="M 38,40 C 28,40 18,48 10,58 C 16,56 24,52 32,48 C 24,52 18,58 12,66 C 20,62 28,56 36,50 Z" fill="url(#gold-hair-grad)" />
      
      <!-- Mane -->
      <path class="pegasus-mane" d="M 88,14 C 82,18 80,24 82,30 C 84,32 86,28 85,26 C 83,24 84,20 88,16 Z" fill="url(#gold-hair-grad)" />
      
      <!-- Front Leg Near -->
      <path class="pegasus-leg-front-near" d="M80,58 L85,68 L92,72 L88,75 L82,70 L76,59 Z" fill="url(#pegasus-body-grad)" />
      
      <!-- Back Leg Near -->
      <path class="pegasus-leg-back-near" d="M52,62 L42,75 L32,85 L35,88 L46,78 L56,64 Z" fill="url(#pegasus-body-grad)" />
      
      <!-- Front Wing -->
      <path class="pegasus-wing-front" d="M 68,42 C 60,20 45,5 25,-2 C 32,12 42,26 56,40 C 44,34 32,30 16,26 C 26,35 38,42 56,44 C 42,42 30,38 18,34 C 30,42 42,46 64,44 Z" fill="url(#wing-grad-front)" />
    </svg>
  `;
}

interface PegasusParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

function triggerPegasusAnimation() {
  const oldPegasus = document.getElementById('pegasus-runner');
  if (oldPegasus) oldPegasus.remove();
  const oldCanvas = document.getElementById('pegasus-canvas');
  if (oldCanvas) oldCanvas.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'pegasus-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const peg = document.createElement('div');
  peg.id = 'pegasus-runner';
  peg.className = 'pegasus-container';
  peg.innerHTML = createPegasusSVG();
  document.body.appendChild(peg);

  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const particles: PegasusParticle[] = [];
  const particleColors = [
    'rgba(226, 169, 45, ',
    'rgba(200, 75, 47, ',
    'rgba(74, 168, 153, ',
    'rgba(250, 246, 236, '
  ];

  const duration = 3800; 
  const startTime = performance.now();

  function spawnParticles(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const baseColor = particleColors[Math.floor(Math.random() * particleColors.length)];
      particles.push({
        x: x + 15 + Math.random() * 20,
        y: y + 25 + Math.random() * 25,
        vx: -3 - Math.random() * 4,
        vy: (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 6,
        color: baseColor,
        alpha: 0.9 + Math.random() * 0.1,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.02 + Math.random() * 0.03
      });
    }
  }

  function loop(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);

    const startX = -180;
    const endX = window.innerWidth + 180;
    const startY = window.innerHeight * 0.75;
    const endY = window.innerHeight * 0.15;

    const x = startX + (endX - startX) * t;
    const archHeight = -160;
    const y = (startY + (endY - startY) * t) + Math.sin(t * Math.PI) * archHeight;

    const dx = endX - startX;
    const dy = (endY - startY) + Math.cos(t * Math.PI) * Math.PI * archHeight;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    peg.style.left = '0px';
    peg.style.top = '0px';
    peg.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;

    if (t < 0.98) {
      spawnParticles(x, y, 3);
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx!.save();
      ctx!.fillStyle = `${p.color}${p.alpha})`;
      ctx!.beginPath();
      
      if (p.size > 4 && Math.random() > 0.5) {
        ctx!.moveTo(p.x, p.y - p.size);
        ctx!.lineTo(p.x + p.size / 3, p.y - p.size / 3);
        ctx!.lineTo(p.x + p.size, p.y);
        ctx!.lineTo(p.x + p.size / 3, p.y + p.size / 3);
        ctx!.lineTo(p.x, p.y + p.size);
        ctx!.lineTo(p.x - p.size / 3, p.y + p.size / 3);
        ctx!.lineTo(p.x - p.size, p.y);
        ctx!.lineTo(p.x - p.size / 3, p.y - p.size / 3);
        ctx!.closePath();
        ctx!.fill();
      } else {
        ctx!.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    if (t < 1 || particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      peg.remove();
      canvas.remove();
      window.removeEventListener('resize', handleResize);
    }
  }

  requestAnimationFrame(loop);
}

// ── EVENT BINDINGS ──
function setupUIEvents() {
  dom.btnRun.onclick = runCode;
  dom.btnClear.onclick = clearOutput;
  dom.btnFormat.onclick = formatCode;
  
  // Sidebar Toggles
  dom.btnTogglePackages.onclick = () => toggleSection('packages');
  dom.btnToggleSettings.onclick = () => toggleSection('settings');
  dom.btnClosePackages.onclick = () => toggleSection('packages');
  dom.btnCloseSettings.onclick = () => toggleSection('settings');
  
  // File Explorer Actions
  dom.btnNewFile.onclick = createNewFile;
  
  // Examples Selector
  dom.exampleSel.onchange = (e) => {
    loadExampleSnippet((e.target as HTMLSelectElement).value);
  };
  
  // Package Installer
  dom.btnInstallPackage.onclick = handleInstallPackage;
  dom.packageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleInstallPackage();
    }
  });
  
  // Settings Changes
  dom.settingFontSize.onchange = applySettings;
  dom.settingTheme.onchange = applySettings;
  dom.settingKeymap.onchange = applySettings;
  
  // Output Actions
  dom.btnCopyOutput.onclick = copyOutputToClipboard;
  dom.btnDownloadOutput.onclick = downloadOutputLog;
  
  // Global resize handling for sidebar
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      dom.sidebarPanel.style.width = '';
    } else {
      const showSidebar = !dom.packageSection.classList.contains('hidden') || !dom.settingsSection.classList.contains('hidden');
      dom.sidebarPanel.style.width = showSidebar ? '280px' : '260px'; // default explorer width
    }
  });
}

// Start app
window.addEventListener('DOMContentLoaded', initApp);
