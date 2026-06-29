import { EditorState, Extension, Compartment } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, lineNumbers, drawSelection } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// ── CUSTOM BOTANICAL PARCHMENT HIGHLIGHTING STYLE ──
const botanicalHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--red)', fontWeight: 'bold' },
  { tag: [t.string, t.special(t.string)], color: 'var(--teal)' },
  { tag: t.number, color: 'var(--amber)' },
  { tag: t.comment, color: 'var(--ink-light)', fontStyle: 'italic', opacity: 0.7 },
  { tag: [t.definition(t.variableName), t.propertyName], color: 'var(--blue)' },
  { tag: t.className, color: 'var(--blue)', fontWeight: 'bold' },
  { tag: t.operator, color: 'var(--red)' },
  { tag: t.punctuation, color: 'var(--ink-light)' },
  { tag: t.standard(t.name), color: 'var(--sage)', fontWeight: 'bold' },
  { tag: t.function(t.variableName), color: 'var(--blue)', fontWeight: 'bold' },
  { tag: t.variableName, color: 'var(--ink)' },
]);

// ── CUSTOM THEME DEFINITION ──
const botanicalTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--cream)',
    color: 'var(--ink)',
  },
  '.cm-content': {
    caretColor: 'var(--teal)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--teal)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(46, 125, 110, 0.18) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--parchment-mid)',
    color: 'var(--parchment-dark)',
    borderRight: '1px solid var(--parchment-dark)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--parchment-dark)',
    color: 'var(--ink)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(46, 125, 110, 0.03)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--parchment-mid)',
    color: 'var(--ink)',
  },
}, { dark: false });

export interface EditorConfig {
  parent: HTMLElement;
  initialCode: string;
  onUpdate: (code: string) => void;
  onCursorMove: (line: number, col: number) => void;
  onRunShortcut: () => void;
  fontSize: string;
  initialLanguage?: 'python' | 'java';
}

export class CodeStudioEditor {
  private view: EditorView;
  private onUpdateCallback: (code: string) => void;
  private languageConf = new Compartment();

  constructor(config: EditorConfig) {
    this.onUpdateCallback = config.onUpdate;
    
    // Set custom font size custom property on the parent
    config.parent.style.setProperty('--editor-font-size', config.fontSize);

    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      highlightActiveLine(),
      drawSelection(),
      this.languageConf.of(config.initialLanguage === 'java' ? java() : python()),
      botanicalTheme,
      syntaxHighlighting(botanicalHighlightStyle),
      keymap.of([
        {
          key: 'Ctrl-Enter',
          run: () => {
            config.onRunShortcut();
            return true;
          }
        },
        {
          key: 'Cmd-Enter',
          run: () => {
            config.onRunShortcut();
            return true;
          }
        },
        {
          key: 'Shift-Enter',
          run: () => {
            config.onRunShortcut();
            return true;
          }
        },
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.onUpdateCallback(this.getValue());
        }
        
        // Track cursor position
        if (update.selectionSet || update.docChanged) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          config.onCursorMove(line.number, pos - line.from + 1);
        }
      })
    ];

    this.view = new EditorView({
      state: EditorState.create({
        doc: config.initialCode,
        extensions
      }),
      parent: config.parent
    });
  }

  public getValue(): string {
    return this.view.state.doc.toString();
  }

  public setValue(code: string) {
    const transaction = this.view.state.update({
      changes: { from: 0, to: this.view.state.doc.length, insert: code }
    });
    this.view.dispatch(transaction);
  }

  public setLanguage(lang: 'python' | 'java') {
    const langExtension = lang === 'java' ? java() : python();
    this.view.dispatch({
      effects: this.languageConf.reconfigure(langExtension)
    });
  }

  public focus() {
    this.view.focus();
  }

  public setFontSize(size: string) {
    const parent = this.view.dom.parentElement;
    if (parent) {
      parent.style.setProperty('--editor-font-size', size);
    }
  }

  public destroy() {
    this.view.destroy();
  }
}
