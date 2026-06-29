export interface VirtualFile {
  name: string;
  content: string;
}

const STORAGE_KEY = 'pyfable_v2_files';

const DEFAULT_FILES: VirtualFile[] = [
  {
    name: 'main.py',
    content: `# ✦ Welcome to PyFable — Premium Python Studio ✦
# Feel free to edit this code and run it!

from utils import greeting, get_butterfly_art

# Get a friendly message
msg = greeting("Developer")
print(msg)
print()

# Render some ASCII art
print("Drawing a butterfly:")
print(get_butterfly_art())
`
  },
  {
    name: 'Main.java',
    content: `// ✦ Welcome to PyFable — Java Edition ✦
// Feel free to edit this code and run it!

import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println();
        
        // Java lists and variables are fully supported!
        ArrayList<String> collection = new ArrayList<>();
        collection.add("Butterfly");
        collection.add("Parchment");
        collection.add("Fable");
        
        System.out.println("Workspace objects: " + collection);
    }
}
`
  },
  {
    name: 'utils.py',
    content: `# 🌿 Utility Functions for PyFable 

def greeting(name: str) -> str:
    """Returns a warm botanical greeting."""
    return f"  Welcome to PyFable — Python Studio."

def get_butterfly_art() -> str:
    """Returns a simple ASCII butterfly."""
    return """
      \\|/
     ((o))
    /|- -|\\
    \\\\_._//
    """
`
  },
  {
    name: 'butterfly_art.py',
    content: `# 🦋 Beautiful Dotted Wing Butterfly Art Generator

def draw_butterfly(size=6):
    chars = ['·', '∘', '○', '◌', '◎', '●', '◉']
    
    # Upper half wings
    for i in range(size, 0, -1):
        pad = " " * (size - i)
        c = chars[min(i - 1, len(chars) - 1)]
        wing = (c + " ") * i
        print(pad + wing + "   " + wing)
        
    # Butterfly body
    print(" " * (size - 1) + "  >(°)<")
    
    # Lower half wings
    for i in range(1, size + 1):
        pad = " " * (size - i)
        c = chars[min(i - 1, len(chars) - 1)]
        wing = (c + " ") * i
        print(pad + wing + "   " + wing)

print("✦ Dotted Wings (size 6):\\n")
draw_butterfly(6)
print("\\n  Beauty emerging from simple algorithms 🦋")
`
  }
];

export class FileSystem {
  private files: VirtualFile[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.files = JSON.parse(stored);
      } else {
        this.files = [...DEFAULT_FILES];
        this.save();
      }
    } catch (e) {
      console.error("Failed to load files from localStorage:", e);
      this.files = [...DEFAULT_FILES];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.files));
    } catch (e) {
      console.error("Failed to save files to localStorage:", e);
    }
  }

  public getFiles(): VirtualFile[] {
    return this.files;
  }

  public getFile(name: string): VirtualFile | undefined {
    return this.files.find(f => f.name === name);
  }

  public createFile(name: string, content = ''): VirtualFile | null {
    // Basic sanitization
    let cleanName = name.trim();
    if (!cleanName) return null;
    if (!cleanName.endsWith('.py') && !cleanName.endsWith('.java')) {
      cleanName += '.py';
    }

    // Check uniqueness
    if (this.files.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
      alert(`A file named "${cleanName}" already exists!`);
      return null;
    }

    const newFile: VirtualFile = { name: cleanName, content };
    this.files.push(newFile);
    this.save();
    return newFile;
  }

  public updateFileContent(name: string, content: string): boolean {
    const file = this.getFile(name);
    if (file) {
      file.content = content;
      this.save();
      return true;
    }
    return false;
  }

  public deleteFile(name: string): boolean {
    const initialLen = this.files.length;
    this.files = this.files.filter(f => f.name !== name);
    if (this.files.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public renameFile(oldName: string, newName: string): VirtualFile | null {
    let cleanNewName = newName.trim();
    if (!cleanNewName) return null;
    if (!cleanNewName.endsWith('.py') && !cleanNewName.endsWith('.java')) {
      const ext = oldName.endsWith('.java') ? '.java' : '.py';
      cleanNewName += ext;
    }

    if (oldName === cleanNewName) return null;

    // Check if new name already exists
    if (this.files.some(f => f.name.toLowerCase() === cleanNewName.toLowerCase())) {
      alert(`A file named "${cleanNewName}" already exists!`);
      return null;
    }

    const file = this.getFile(oldName);
    if (file) {
      file.name = cleanNewName;
      this.save();
      return file;
    }
    return null;
  }
}
