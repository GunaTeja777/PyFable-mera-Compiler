export function buildAppLayout(container: HTMLElement) {
  // Clear the container
  container.innerHTML = '';

  // 1. Loading Overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.className = 'absolute inset-0 bg-parchment flex flex-col items-center justify-center gap-[18px] z-[200] transition-opacity duration-250';
  loadingOverlay.setAttribute('aria-live', 'polite');
  loadingOverlay.innerHTML = `
    <svg width="90" height="60" viewBox="0 0 90 60" aria-hidden="true">
      <ellipse cx="30" cy="24" rx="22" ry="15" fill="#2E7D6E" opacity=".9" transform="rotate(-25,30,24)"/>
      <ellipse cx="20" cy="36" rx="15" ry="9" fill="#4A7BC4" opacity=".75" transform="rotate(12,20,36)"/>
      <ellipse cx="60" cy="24" rx="22" ry="15" fill="#C84B2F" opacity=".9" transform="rotate(25,60,24)"/>
      <ellipse cx="70" cy="36" rx="15" ry="9" fill="#D4920A" opacity=".75" transform="rotate(-12,70,36)"/>
      <ellipse cx="45" cy="30" rx="3.5" ry="17" fill="#1C1409"/>
      <circle cx="45" cy="12" r="3.8" fill="#1C1409"/>
    </svg>
    <h2 class="font-playfair text-[26px] text-ink font-bold">CoFable</h2>
    <p class="text-xs text-ink-light">Summoning the PyJava WebAssembly runtime…</p>
    <div class="ldots">
      <span class="inline-block w-[9px] height-[9px] rounded-full mx-1 bg-teal animate-[ldot_1.4s_infinite_ease-in-out]"></span>
      <span class="inline-block w-[9px] height-[9px] rounded-full mx-1 bg-amber animate-[ldot_1.4s_infinite_ease-in-out_0.22s]"></span>
      <span class="inline-block w-[9px] height-[9px] rounded-full mx-1 bg-red animate-[ldot_1.4s_infinite_ease-in-out_0.44s]"></span>
    </div>
  `;
  container.appendChild(loadingOverlay);

  // 2. Header
  const header = document.createElement('header');
  header.className = 'hdr bg-ink text-cream px-5 h-[52px] flex items-center justify-between border-b-3 border-teal shrink-0 relative overflow-hidden shadow-md z-10';
  header.innerHTML = `
    <div class="hdr-left flex items-center gap-3">
      <svg width="30" height="22" viewBox="0 0 80 54" aria-hidden="true">
        <ellipse cx="26" cy="20" rx="20" ry="13" fill="#2E7D6E" opacity=".9" transform="rotate(-25,26,20)"/>
        <ellipse cx="18" cy="32" rx="13" ry="8" fill="#4A7BC4" opacity=".75" transform="rotate(12,18,32)"/>
        <ellipse cx="54" cy="20" rx="20" ry="13" fill="#C84B2F" opacity=".9" transform="rotate(25,54,20)"/>
        <ellipse cx="62" cy="32" rx="13" ry="8" fill="#D4920A" opacity=".75" transform="rotate(-12,62,32)"/>
        <ellipse cx="40" cy="28" rx="3" ry="15" fill="#E8DCBF"/>
        <circle cx="40" cy="12" r="3" fill="#E8DCBF"/>
      </svg>
      <h1 class="hdr-logo font-playfair text-[22px] font-bold tracking-[0.3px] whitespace-nowrap">Co<em class="text-amber not-italic font-normal">Fable</em></h1>
      <div class="hdr-sub text-[11px] text-cream/40 italic whitespace-nowrap">— PyJava Studio · Fable 5 Edition</div>
    </div>
    <div class="hdr-bg-butterflies" aria-hidden="true">
      <svg width="220" height="34" viewBox="0 0 280 42">
        <ellipse cx="18" cy="16" rx="15" ry="9" fill="#2E7D6E" transform="rotate(-22,18,16)"/>
        <ellipse cx="11" cy="26" rx="9" ry="6" fill="#5A8A3C" transform="rotate(10,11,26)"/>
        <ellipse cx="44" cy="16" rx="15" ry="9" fill="#5A8A3C" transform="rotate(22,44,16)"/>
        <ellipse cx="51" cy="26" rx="9" ry="6" fill="#2E7D6E" transform="rotate(-10,51,26)"/>
        <ellipse cx="31" cy="21" rx="2.5" ry="11" fill="#FAF6EC"/>
        <ellipse cx="90" cy="16" rx="17" ry="11" fill="#C84B2F" transform="rotate(-20,90,16)"/>
        <ellipse cx="82" cy="27" rx="11" ry="7" fill="#D4920A" transform="rotate(14,82,27)"/>
        <ellipse cx="118" cy="16" rx="17" ry="11" fill="#D4920A" transform="rotate(20,118,16)"/>
        <ellipse cx="126" cy="27" rx="11" ry="7" fill="#C84B2F" transform="rotate(-14,126,27)"/>
        <ellipse cx="104" cy="21" rx="3" ry="13" fill="#FAF6EC"/>
        <ellipse cx="158" cy="16" rx="14" ry="9" fill="#4A7BC4" transform="rotate(-18,158,16)"/>
        <ellipse cx="151" cy="26" rx="9" ry="5.5" fill="#2E7D6E" transform="rotate(10,151,26)"/>
        <ellipse cx="182" cy="16" rx="14" ry="9" fill="#2E7D6E" transform="rotate(18,182,16)"/>
        <ellipse cx="189" cy="26" rx="9" ry="5.5" fill="#4A7BC4" transform="rotate(-10,189,26)"/>
        <ellipse cx="170" cy="21" rx="2.5" ry="11" fill="#FAF6EC"/>
        <ellipse cx="224" cy="16" rx="14" ry="8" fill="#1C1409" transform="rotate(-15,224,16)"/>
        <ellipse cx="218" cy="26" rx="9" ry="5" fill="#D4920A" transform="rotate(8,218,26)"/>
        <ellipse cx="248" cy="16" rx="14" ry="8" fill="#1C1409" transform="rotate(15,248,16)"/>
        <ellipse cx="254" cy="26" rx="9" ry="5" fill="#D4920A" transform="rotate(-8,254,26)"/>
        <ellipse cx="236" cy="21" rx="2.5" ry="10" fill="#FAF6EC"/>
      </svg>
    </div>
    <div class="hdr-right flex items-center gap-3.5 z-[2]">
      <span class="hdr-pyver text-[11px] text-cream/50 font-mono bg-white/5 px-2 py-1 rounded border border-white/10" id="pyver">Python —</span>
    </div>
  `;
  container.appendChild(header);

  // 3. Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar bg-parchment-mid border-b border-parchment-dark px-5 py-2 flex items-center justify-between gap-2.5 shrink-0 z-5';
  toolbar.innerHTML = `
    <div class="toolbar-left flex items-center gap-2.5">
      <button class="btn-run bg-teal text-white border-none px-[22px] py-2 rounded font-playfair text-sm font-bold cursor-pointer flex items-center gap-2 transition-all shadow-sm hover:enabled:bg-[#1F5C51] hover:enabled:-translate-y-[1px] active:enabled:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed" id="btn-run" disabled>
        <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true"><polygon points="0,0 11,6.5 0,13" fill="white"/></svg>
        Run
      </button>
      <button class="btn-sm bg-cream border border-parchment-dark text-ink-mid px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all shadow-sm hover:bg-parchment-dark hover:text-ink" id="btn-clear">Clear</button>
      <button class="btn-sm bg-cream border border-parchment-dark text-ink-mid px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all shadow-sm hover:bg-parchment-dark hover:text-ink" id="btn-format">Format</button>
      <span class="kbd-hint font-mono text-[10px] bg-ink/8 text-ink-light px-1.5 py-0.5 rounded border border-parchment-dark">Shift+Enter</span>
    </div>
    <div class="toolbar-right flex items-center gap-2.5">
      <button class="btn-sm btn-icon-text bg-cream border border-parchment-dark text-ink-mid px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all shadow-sm hover:bg-parchment-dark hover:text-ink flex items-center gap-1.5" id="btn-toggle-packages" title="Install packages from PyPI">
        📦 Packages
      </button>
      <button class="btn-sm btn-icon-text bg-cream border border-parchment-dark text-ink-mid px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all shadow-sm hover:bg-parchment-dark hover:text-ink flex items-center gap-1.5" id="btn-toggle-settings" title="Editor settings">
        ⚙️ Settings
      </button>
      <button class="btn-sm btn-icon-text bg-cream border border-parchment-dark text-ink-mid px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all shadow-sm hover:bg-parchment-dark hover:text-ink flex items-center gap-1.5" id="btn-toolbar-toggle-terminal" title="Toggle Terminal (Ctrl+&#96;)">
        💻 Terminal
      </button>
      <div class="select-wrapper relative">
        <select class="font-lato text-xs font-semibold bg-cream border border-parchment-dark text-ink px-3 py-1.5 pr-7 rounded cursor-pointer outline-none appearance-none shadow-sm transition-all hover:bg-parchment-dark" id="example-sel">
          <option value="">— Examples —</option>
          <option value="hello">Hello, World</option>
          <option value="fib">Fibonacci</option>
          <option value="listcomp">List Comprehensions</option>
          <option value="classes">Classes & Objects</option>
          <option value="deco">Decorators</option>
          <option value="gen">Generators</option>
          <option value="butterfly">🦋 Butterfly Art</option>
          <option value="fractal">Mandelbrot (ASCII)</option>
        </select>
      </div>
    </div>
  `;
  container.appendChild(toolbar);

  // 4. Mobile Tabs
  const mobileTabs = document.createElement('div');
  mobileTabs.className = 'mobile-tabs hidden max-md:flex border-b border-parchment-dark w-full bg-parchment-mid shrink-0';
  mobileTabs.setAttribute('role', 'tablist');
  mobileTabs.innerHTML = `
    <button class="mobile-tab active flex-1 text-center py-2.5 text-xs font-semibold border-b-2 border-transparent active:border-teal active:text-teal" data-tab="files" role="tab" aria-selected="true">📂 Files</button>
    <button class="mobile-tab flex-1 text-center py-2.5 text-xs font-semibold border-b-2 border-transparent active:border-teal active:text-teal" data-tab="editor" role="tab" aria-selected="false">📝 Editor</button>
    <button class="mobile-tab flex-1 text-center py-2.5 text-xs font-semibold border-b-2 border-transparent active:border-teal active:text-teal" data-tab="output" role="tab" aria-selected="false">💻 Output</button>
  `;
  container.appendChild(mobileTabs);

  // 5. Main layout split
  const mainLayout = document.createElement('main');
  mainLayout.className = 'main-layout flex flex-1 overflow-hidden min-h-0 relative max-md:flex-col';

  // 5.1 Sidebar explorer
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar-panel';
  sidebar.className = 'sidebar w-[260px] bg-parchment-mid border-r-2 border-parchment-dark flex flex-col shrink-0 overflow-y-auto transition-all duration-250 max-md:w-full max-md:border-r-0 max-md:border-b';

  // File explorer section
  const fileExplorer = document.createElement('div');
  fileExplorer.className = 'sidebar-section file-explorer flex flex-col flex-1 min-h-0';
  fileExplorer.innerHTML = `
    <div class="panel-hdr bg-parchment-dark px-3.5 py-2 text-[10.5px] font-bold tracking-[1.2px] uppercase text-ink border-b border-parchment-dark shrink-0 flex items-center justify-between">
      <span>📂 Workspace Files</span>
      <button class="btn-icon bg-transparent border-none text-base font-bold text-ink-mid cursor-pointer px-1 rounded transition-all hover:bg-black/5 hover:text-ink" id="btn-new-file" title="Create new file">+</button>
    </div>
    <ul class="file-list list-none p-2 flex flex-col gap-1 overflow-y-auto" id="file-list" role="tree"></ul>
  `;
  sidebar.appendChild(fileExplorer);

  // Package manager section
  const packageManager = document.createElement('div');
  packageManager.id = 'package-section';
  packageManager.className = 'sidebar-section package-manager hidden flex flex-col flex-1 min-h-0 p-3.5 gap-3';
  packageManager.innerHTML = `
    <div class="panel-hdr bg-transparent p-0 pb-2 border-b border-parchment-dark mb-2 text-[10.5px] font-bold tracking-[1.2px] uppercase text-ink shrink-0 flex items-center justify-between">
      <span>📦 PyPI Packages</span>
      <button class="btn-close-sidebar bg-transparent border-none text-lg text-ink-light cursor-pointer px-1" id="btn-close-packages" title="Close">×</button>
    </div>
    <div class="package-input-group flex gap-2 mb-1.5">
      <input class="flex-1 bg-cream border border-parchment-dark text-ink px-2.5 py-1.5 rounded font-lato text-xs outline-none focus:border-teal" type="text" id="package-input" placeholder="e.g. numpy, requests" aria-label="Package name">
      <button class="btn-sm btn-accent bg-teal text-white border-teal px-3.5 py-1.5 rounded cursor-pointer text-xs font-semibold font-lato transition-all hover:bg-[#1F5C51]" id="btn-install-package">Install</button>
    </div>
    <div class="package-status text-[11px] text-ink-light min-h-[16px] italic" id="package-status"></div>
    <div class="installed-list-hdr text-[11px] font-bold uppercase text-ink-light mt-2.5">Installed packages:</div>
    <ul class="installed-packages list-none font-mono text-[11px] text-ink-mid flex flex-col gap-1 mt-1 overflow-y-auto flex-1" id="installed-packages-list">
      <li class="px-2 py-1 bg-white/25 rounded flex items-center justify-between">builtins (core)</li>
      <li class="px-2 py-1 bg-white/25 rounded flex items-center justify-between">sys (core)</li>
    </ul>
  `;
  sidebar.appendChild(packageManager);

  // Settings section
  const settingsSection = document.createElement('div');
  settingsSection.id = 'settings-section';
  settingsSection.className = 'sidebar-section settings-manager hidden flex flex-col flex-1 min-h-0 p-3.5 gap-3';
  settingsSection.innerHTML = `
    <div class="panel-hdr bg-transparent p-0 pb-2 border-b border-parchment-dark mb-2 text-[10.5px] font-bold tracking-[1.2px] uppercase text-ink shrink-0 flex items-center justify-between">
      <span>⚙️ Studio Settings</span>
      <button class="btn-close-sidebar bg-transparent border-none text-lg text-ink-light cursor-pointer px-1" id="btn-close-settings" title="Close">×</button>
    </div>
    <div class="settings-group flex flex-col gap-1.5 mb-3.5">
      <label class="text-xs font-bold text-ink-light" for="setting-font-size">Font Size</label>
      <select class="bg-cream border border-parchment-dark text-ink px-2.5 py-1.5 rounded outline-none font-lato text-xs cursor-pointer" id="setting-font-size">
        <option value="11px">11px</option>
        <option value="12px">12px</option>
        <option value="13px" selected>13px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
      </select>
    </div>
    <div class="settings-group flex flex-col gap-1.5 mb-3.5">
      <label class="text-xs font-bold text-ink-light" for="setting-theme">Color Theme</label>
      <select class="bg-cream border border-parchment-dark text-ink px-2.5 py-1.5 rounded outline-none font-lato text-xs cursor-pointer" id="setting-theme">
        <option value="light-parchment" selected>Botanical Parchment (Light)</option>
        <option value="dark-ink">Botanical Charcoal (Dark)</option>
      </select>
    </div>
    <div class="settings-group flex flex-col gap-1.5 mb-3.5">
      <label class="text-xs font-bold text-ink-light" for="setting-keymap">Keymap</label>
      <select class="bg-cream border border-parchment-dark text-ink px-2.5 py-1.5 rounded outline-none font-lato text-xs cursor-pointer" id="setting-keymap">
        <option value="default" selected>Standard</option>
        <option value="vim">Vim Mode</option>
      </select>
    </div>
    <div class="settings-group checkbox-group flex flex-row items-center gap-2 mb-3.5 cursor-pointer select-none">
      <input class="cursor-pointer" type="checkbox" id="setting-autosave" checked>
      <label class="text-xs font-bold text-ink-light cursor-pointer" for="setting-autosave">Auto-save changes</label>
    </div>
  `;
  sidebar.appendChild(settingsSection);
  mainLayout.appendChild(sidebar);

  // 5.2 Code Editor Panel
  const panelEditor = document.createElement('section');
  panelEditor.id = 'editor-panel';
  panelEditor.className = 'panel-editor flex flex-col min-w-0 border-r-2 border-parchment-dark bg-cream';
  panelEditor.innerHTML = `
    <div class="panel-hdr bg-parchment-dark px-3.5 py-2 text-[10.5px] font-bold tracking-[1.2px] uppercase text-ink border-b border-parchment-dark shrink-0 flex items-center justify-between">
      <div class="dots-decorator flex gap-1.5 items-center mr-2">
        <span class="dot w-2 h-2 rounded-full inline-block bg-red"></span>
        <span class="dot w-2 h-2 rounded-full inline-block bg-amber"></span>
        <span class="dot w-2 h-2 rounded-full inline-block bg-sage"></span>
      </div>
      <span class="current-file-tab font-mono text-[11px] font-semibold text-ink bg-cream px-2.5 py-1 rounded-t border border-parchment-dark border-b-none -mb-[9px] relative z-[2]" id="current-filename">main.py</span>
      <span class="save-status-indicator ml-auto text-[10px] text-sage bg-sage/8 px-1.5 py-0.5 rounded border border-sage/15 transition-opacity duration-300" id="save-status" title="Saved to browser local storage">Saved</span>
    </div>
    <div class="editor-container flex-1 min-h-0 overflow-hidden relative" id="editor-holder"></div>
  `;

  // 5.2.5 Resizer / Splitter
  const resizer = document.createElement('div');
  resizer.id = 'layout-resizer';
  resizer.className = 'resizer';
  resizer.setAttribute('role', 'separator');
  resizer.setAttribute('aria-orientation', 'vertical');
  resizer.setAttribute('aria-label', 'Editor and Terminal split resizer');
  resizer.setAttribute('tabindex', '0');
  resizer.innerHTML = `<div class="resizer-thumb"></div>`;

  // 5.3 Terminal Output Panel
  const panelOutput = document.createElement('section');
  panelOutput.id = 'output-panel';
  panelOutput.className = 'panel-output flex flex-col min-w-0';
  panelOutput.innerHTML = `
    <div class="panel-hdr bg-parchment-dark px-3.5 py-2 text-[10.5px] font-bold tracking-[1.2px] uppercase text-ink border-b border-parchment-dark shrink-0 flex items-center justify-between">
      <span class="dot w-2 h-2 rounded-full inline-block bg-teal"></span>
      &nbsp;Terminal Output
      <div class="output-actions ml-auto flex items-center gap-2.5">
        <button class="btn-text-action bg-transparent border-none text-ink-light cursor-pointer text-[11px] font-semibold transition-all hover:text-teal hover:underline" id="btn-copy-output" title="Copy output">Copy</button>
        <button class="btn-text-action bg-transparent border-none text-ink-light cursor-pointer text-[11px] font-semibold transition-all hover:text-teal hover:underline" id="btn-download-output" title="Download code files and output">Download</button>
        <button class="btn-text-action bg-transparent border-none text-ink-light cursor-pointer text-[11px] font-semibold transition-all hover:text-teal hover:underline" id="btn-toggle-terminal" title="Toggle Terminal (Ctrl+&#96;)">Collapse</button>
        <span id="exec-badge" class="exec-badge text-[11px] font-mono font-bold px-1.5 py-0.5 rounded" style="display:none;"></span>
      </div>
    </div>
    <div class="output-body flex-1 bg-output-bg p-4 overflow-y-auto font-mono text-[13px] leading-[1.7] text-output-text min-h-0" id="output" role="log" aria-live="polite"></div>
  `;

  mainLayout.appendChild(panelEditor);
  mainLayout.appendChild(resizer);
  mainLayout.appendChild(panelOutput);
  container.appendChild(mainLayout);

  // 6. Status Bar
  const statusbar = document.createElement('footer');
  statusbar.className = 'statusbar bg-ink text-cream/65 px-4 h-[30px] text-[12.5px] font-mono flex items-center justify-between shrink-0 border-t border-white/5 z-5';
  statusbar.innerHTML = `
    <div class="status-left flex items-center gap-1.5">
      <span class="sdot w-[6px] h-[6px] rounded-full bg-[#888] inline-block transition-colors duration-300" id="sdot"></span>
      <span id="stext">Loading Pyodide runtime…</span>
    </div>
    <div class="status-middle opacity-80" id="sline">
      Ln 1, Col 1
    </div>
    <div class="status-right opacity-60" id="status-right-label">
      CoFable Studio v2.0
    </div>
  `;
  container.appendChild(statusbar);

  // Return DOM elements dictionary for main.ts
  return {
    loadingOverlay,
    pyver: document.getElementById('pyver') as HTMLElement,
    btnRun: document.getElementById('btn-run') as HTMLButtonElement,
    btnClear: document.getElementById('btn-clear') as HTMLButtonElement,
    btnFormat: document.getElementById('btn-format') as HTMLButtonElement,
    btnTogglePackages: document.getElementById('btn-toggle-packages') as HTMLButtonElement,
    btnToggleSettings: document.getElementById('btn-toggle-settings') as HTMLButtonElement,
    exampleSel: document.getElementById('example-sel') as HTMLSelectElement,
    sidebarPanel: sidebar,
    packageSection: packageManager,
    settingsSection,
    btnNewFile: document.getElementById('btn-new-file') as HTMLButtonElement,
    fileList: document.getElementById('file-list') as HTMLElement,
    packageInput: document.getElementById('package-input') as HTMLInputElement,
    btnInstallPackage: document.getElementById('btn-install-package') as HTMLButtonElement,
    packageStatus: document.getElementById('package-status') as HTMLElement,
    installedPackagesList: document.getElementById('installed-packages-list') as HTMLElement,
    btnClosePackages: document.getElementById('btn-close-packages') as HTMLButtonElement,
    settingFontSize: document.getElementById('setting-font-size') as HTMLSelectElement,
    settingTheme: document.getElementById('setting-theme') as HTMLSelectElement,
    settingKeymap: document.getElementById('setting-keymap') as HTMLSelectElement,
    settingAutosave: document.getElementById('setting-autosave') as HTMLInputElement,
    btnCloseSettings: document.getElementById('btn-close-settings') as HTMLButtonElement,
    editorHolder: document.getElementById('editor-holder') as HTMLElement,
    currentFilename: document.getElementById('current-filename') as HTMLElement,
    saveStatus: document.getElementById('save-status') as HTMLElement,
    output: document.getElementById('output') as HTMLElement,
    execBadge: document.getElementById('exec-badge') as HTMLElement,
    btnCopyOutput: document.getElementById('btn-copy-output') as HTMLButtonElement,
    btnDownloadOutput: document.getElementById('btn-download-output') as HTMLButtonElement,
    btnToggleTerminal: document.getElementById('btn-toggle-terminal') as HTMLButtonElement,
    btnToolbarToggleTerminal: document.getElementById('btn-toolbar-toggle-terminal') as HTMLButtonElement,
    layoutResizer: resizer,
    editorPanel: panelEditor,
    outputPanel: panelOutput,
    mobileTabs: document.querySelectorAll('.mobile-tab'),
    appContainer: container,
    sdot: document.getElementById('sdot') as HTMLElement,
    stext: document.getElementById('stext') as HTMLElement,
    sline: document.getElementById('sline') as HTMLElement,
  };
}
