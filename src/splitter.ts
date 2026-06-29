/**
 * Splitter Module for CoFable Studio
 * Manages the draggable splitter divider between the code editor and terminal output panels.
 */

export interface SplitterConfig {
  editorPanel: HTMLElement;
  outputPanel: HTMLElement;
  resizer: HTMLElement;
  mainLayout: HTMLElement;
  toggleBtn: HTMLButtonElement;
}

export class PanelSplitter {
  private editorPanel: HTMLElement;
  private outputPanel: HTMLElement;
  private resizer: HTMLElement;
  private mainLayout: HTMLElement;
  private toggleBtn: HTMLButtonElement;

  private isDragging = false;
  private isCollapsed = false;
  private currentPercent = 70; // Default 70% editor / 30% terminal
  private transitionTimeout: number | null = null;

  constructor(config: SplitterConfig) {
    this.editorPanel = config.editorPanel;
    this.outputPanel = config.outputPanel;
    this.resizer = config.resizer;
    this.mainLayout = config.mainLayout;
    this.toggleBtn = config.toggleBtn;

    this.init();
  }

  private init() {
    // 1. Load initial state from localStorage
    const savedPercent = localStorage.getItem('cofable_editor_width');
    if (savedPercent) {
      this.currentPercent = parseFloat(savedPercent);
    }
    
    const savedCollapsed = localStorage.getItem('cofable_terminal_collapsed');
    this.isCollapsed = savedCollapsed === 'true';

    // 2. Set up initial visual states
    this.applyLayoutState(false);

    // 3. Bind Event Listeners
    this.resizer.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.resizer.addEventListener('dblclick', this.onDoubleClick.bind(this));
    this.toggleBtn.addEventListener('click', this.toggleTerminal.bind(this));

    // Keyboard shortcut (Ctrl + `)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        this.toggleTerminal();
      }
    });

    // Handle window resize (making sure constraints are kept)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && !this.isCollapsed) {
        this.applyLayoutState(false);
      }
    });
  }

  /**
   * Applies the current splitter percentages and collapsed state to the DOM
   * @param animate Whether to use transition animation
   */
  private applyLayoutState(animate = true) {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    if (window.innerWidth < 768) {
      // Reset styles for mobile/stacked layout (handled by CSS media queries)
      this.editorPanel.style.width = '';
      this.outputPanel.style.width = '';
      this.outputPanel.style.display = '';
      this.outputPanel.style.opacity = '';
      this.resizer.style.display = 'none';
      return;
    }

    if (animate) {
      this.editorPanel.classList.add('transitioning');
      this.outputPanel.classList.add('transitioning');
    } else {
      this.editorPanel.classList.remove('transitioning');
      this.outputPanel.classList.remove('transitioning');
    }

    if (this.isCollapsed) {
      // Collapse terminal completely
      this.editorPanel.style.width = '100%';
      this.outputPanel.style.opacity = '0';
      this.toggleBtn.textContent = 'Expand';
      this.toggleBtn.title = 'Expand Terminal (Ctrl+`)';
      
      if (animate) {
        this.transitionTimeout = window.setTimeout(() => {
          this.outputPanel.style.display = 'none';
          this.resizer.style.display = 'none';
          this.editorPanel.classList.remove('transitioning');
          this.outputPanel.classList.remove('transitioning');
        }, 300);
      } else {
        this.outputPanel.style.display = 'none';
        this.resizer.style.display = 'none';
      }
    } else {
      // Normal expanded layout
      this.outputPanel.style.display = 'flex';
      this.resizer.style.display = 'block';
      void this.outputPanel.offsetHeight; // Force reflow

      this.editorPanel.style.width = `${this.currentPercent}%`;
      this.outputPanel.style.opacity = '1';
      this.toggleBtn.textContent = 'Collapse';
      this.toggleBtn.title = 'Collapse Terminal (Ctrl+`)';

      this.resizer.setAttribute('aria-valuenow', this.currentPercent.toFixed(0));

      if (animate) {
        this.transitionTimeout = window.setTimeout(() => {
          this.editorPanel.classList.remove('transitioning');
          this.outputPanel.classList.remove('transitioning');
        }, 300);
      }
    }
  }

  public toggleTerminal() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('cofable_terminal_collapsed', String(this.isCollapsed));
    this.applyLayoutState(true);
  }

  private onDoubleClick() {
    if (window.innerWidth < 768 || this.isCollapsed) return;
    this.currentPercent = 70;
    localStorage.setItem('cofable_editor_width', '70');
    this.applyLayoutState(true);
  }

  /**
   * Pointer Events Drag Handlers
   */
  private onPointerDown(e: PointerEvent) {
    if (window.innerWidth < 768 || this.isCollapsed) return;
    e.preventDefault();

    // Request pointer capture to receive events even outside the splitter boundaries
    this.resizer.setPointerCapture(e.pointerId);

    this.isDragging = true;
    this.resizer.classList.add('dragging');
    this.editorPanel.classList.remove('transitioning');
    this.outputPanel.classList.remove('transitioning');

    // Prevent text selection and cursor capture by panels during dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    this.editorPanel.style.pointerEvents = 'none';
    this.outputPanel.style.pointerEvents = 'none';

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.resizer.addEventListener('pointermove', this.onPointerMove);
    this.resizer.addEventListener('pointerup', this.onPointerUp);
    this.resizer.addEventListener('pointercancel', this.onPointerUp);
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;

    const layoutRect = this.mainLayout.getBoundingClientRect();
    const relativeX = e.clientX - layoutRect.left;
    let newPercent = (relativeX / layoutRect.width) * 100;

    // Convert pixel constraints to percentages
    const minEditorPercent = (350 / layoutRect.width) * 100;
    const minTerminalPercent = ((layoutRect.width - 250 - 6) / layoutRect.width) * 100;

    // Clamp values
    newPercent = Math.max(minEditorPercent, Math.min(newPercent, minTerminalPercent));
    this.currentPercent = newPercent;

    // Use requestAnimationFrame for smooth 60 FPS layouts
    requestAnimationFrame(() => {
      if (this.isDragging) {
        this.editorPanel.style.width = `${newPercent}%`;
        this.resizer.setAttribute('aria-valuenow', newPercent.toFixed(0));
      }
    });
  }

  private onPointerUp(e: PointerEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.resizer.classList.remove('dragging');

    // Release pointer capture
    try {
      this.resizer.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if capture was already released
    }

    // Restore text selection and pointer events
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    this.editorPanel.style.pointerEvents = '';
    this.outputPanel.style.pointerEvents = '';

    localStorage.setItem('cofable_editor_width', String(this.currentPercent));

    // Cleanup temporary drag event listeners
    this.resizer.removeEventListener('pointermove', this.onPointerMove);
    this.resizer.removeEventListener('pointerup', this.onPointerUp);
    this.resizer.removeEventListener('pointercancel', this.onPointerUp);
  }
}
