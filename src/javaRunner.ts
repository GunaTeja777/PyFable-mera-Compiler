/**
 * Java to JavaScript Transpiler and Executor
 * Runs basic Java code client-side by transpiling it to JavaScript and running in a sandbox.
 */

// Helper classes to mock Java standard library in the execution context
const JAVA_LIB_CODE = `
class Scanner {
  constructor(stream) {
    this.tokens = [];
    this.currentLine = "";
  }
  
  next() {
    if (this.tokens.length === 0) {
      const val = window.js_input_handler ? window.js_input_handler("Scanner input (next):") : prompt("Scanner input:");
      if (val === null) return "";
      this.tokens = val.trim().split(/\\s+/).filter(Boolean);
    }
    return this.tokens.shift() || "";
  }
  
  nextLine() {
    if (this.tokens.length > 0) {
      const res = this.tokens.join(" ");
      this.tokens = [];
      return res;
    }
    const val = window.js_input_handler ? window.js_input_handler("Scanner input (nextLine):") : prompt("Scanner input:");
    return val !== null ? val : "";
  }
  
  nextInt() {
    return parseInt(this.next(), 10);
  }
  
  nextDouble() {
    return parseFloat(this.next());
  }
  
  nextFloat() {
    return parseFloat(this.next());
  }
  
  nextLong() {
    return parseInt(this.next(), 10);
  }
  
  nextBoolean() {
    return this.next().toLowerCase() === "true";
  }
  
  hasNext() {
    return true;
  }
}

class ArrayList {
  constructor() {
    this.items = [];
  }
  
  add(item) {
    this.items.push(item);
    return true;
  }
  
  get(index) {
    if (index < 0 || index >= this.items.length) {
      throw new Error("IndexOutOfBoundsException: Index " + index + ", Size " + this.items.length);
    }
    return this.items[index];
  }
  
  set(index, item) {
    if (index < 0 || index >= this.items.length) {
      throw new Error("IndexOutOfBoundsException: Index " + index + ", Size " + this.items.length);
    }
    const old = this.items[index];
    this.items[index] = item;
    return old;
  }
  
  remove(index) {
    if (typeof index === 'number') {
      if (index < 0 || index >= this.items.length) {
        throw new Error("IndexOutOfBoundsException: Index " + index + ", Size " + this.items.length);
      }
      return this.items.splice(index, 1)[0];
    }
    const idx = this.items.indexOf(index);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  contains(item) {
    return this.items.includes(item);
  }
  
  indexOf(item) {
    return this.items.indexOf(item);
  }
  
  toString() {
    return "[" + this.items.map(x => x === null ? "null" : x.toString()).join(", ") + "]";
  }
}

class HashMap {
  constructor() {
    this.map = new Map();
  }
  
  put(key, value) {
    this.map.set(key, value);
    return value;
  }
  
  get(key) {
    const val = this.map.get(key);
    return val === undefined ? null : val;
  }
  
  remove(key) {
    const old = this.get(key);
    this.map.delete(key);
    return old;
  }
  
  containsKey(key) {
    return this.map.has(key);
  }
  
  containsValue(value) {
    for (const val of this.map.values()) {
      if (val === value) return true;
    }
    return false;
  }
  
  size() {
    return this.map.size;
  }
  
  clear() {
    this.map.clear();
  }
  
  isEmpty() {
    return this.map.size === 0;
  }
  
  keySet() {
    return new HashSet(Array.from(this.map.keys()));
  }
  
  toString() {
    const entries = [];
    this.map.forEach((value, key) => {
      entries.push(key + "=" + value);
    });
    return "{" + entries.join(", ") + "}";
  }
}

class HashSet {
  constructor(initialItems) {
    this.set = new Set(initialItems || []);
  }
  
  add(item) {
    if (this.set.has(item)) return false;
    this.set.add(item);
    return true;
  }
  
  remove(item) {
    return this.set.delete(item);
  }
  
  contains(item) {
    return this.set.has(item);
  }
  
  size() {
    return this.set.size;
  }
  
  clear() {
    this.set.clear();
  }
  
  isEmpty() {
    return this.set.size === 0;
  }
  
  toString() {
    return "[" + Array.from(this.set).map(x => x === null ? "null" : x.toString()).join(", ") + "]";
  }
}

class StringBuilder {
  constructor(initialStr) {
    this.str = initialStr || "";
  }
  
  append(val) {
    this.str += val === null ? "null" : val.toString();
    return this;
  }
  
  toString() {
    return this.str;
  }
  
  length() {
    return this.str.length;
  }
}

// Add Java string support
if (!String.prototype.equals) {
  String.prototype.equals = function(other) {
    return this.toString() === (other ? other.toString() : other);
  };
}
`;

export interface RunResult {
  stdout: string;
  stderr: string;
  hadError: boolean;
  durationMs: number;
}

/**
 * Transpiles basic Java code to valid JavaScript.
 */
export function transpileJavaToJS(code: string): { jsCode: string; mainClassName: string } {
  // Normalize lines
  let processed = code.replace(/\r\n/g, '\n');

  // Placeholders for strings and comments to protect them from regex rewrites
  const strings: string[] = [];
  const comments: string[] = [];

  // 1. Replace multi-line comments
  processed = processed.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    comments.push(match);
    return `__COMMENT_${comments.length - 1}__`;
  });

  // 2. Replace single-line comments
  processed = processed.replace(/\/\/.*/g, (match) => {
    comments.push(match);
    return `__COMMENT_${comments.length - 1}__`;
  });

  // 3. Replace double-quoted strings (handling escape characters)
  processed = processed.replace(/"([^"\\]|\\.)*"/g, (match) => {
    strings.push(match);
    return `__STR_${strings.length - 1}__`;
  });

  // 4. Replace single-quoted characters
  processed = processed.replace(/'([^'\\]|\\.)*'/g, (match) => {
    strings.push(match);
    return `__STR_${strings.length - 1}__`;
  });

  // 5. Remove Java imports & package declarations
  processed = processed.replace(/import\s+[a-zA-Z0-9._*]+;/g, '');
  processed = processed.replace(/package\s+[a-zA-Z0-9._]+;/g, '');

  // 6. Find all class names in the file
  const classNames: string[] = [];
  const classRegex = /\bclass\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = classRegex.exec(processed)) !== null) {
    classNames.push(match[1]);
  }

  // 7. Strip access modifiers and miscellaneous keywords that are not in JS
  // Keep 'static' and 'class'
  processed = processed.replace(/\b(public|private|protected|final|synchronized|transient|volatile)\b/g, '');

  // 8. Replace empty diamond operators 'new ArrayList<>()' -> 'new ArrayList()'
  processed = processed.replace(/new\s+([A-Za-z0-9_]+)\s*<[A-Za-z0-9_,\s<>]*>\s*\(/g, 'new $1(');

  // 9. Transpile Java constructors to JS constructors
  for (const className of classNames) {
    const constructorRegex = new RegExp(`\\b${className}\\s*\\(([^)]*)\\)\\s*(?=\\{)`, 'g');
    processed = processed.replace(constructorRegex, 'constructor($1)');
  }

  // 10. Transpile Java methods to JS methods (static or instance methods)
  // Exclude keywords like if, while, for, switch, catch, return from being matched as method names
  const methodRegex = /\b(static\s+)?(?!(?:if|while|for|switch|catch|return|throw|new|else)\b)([A-Za-z0-9_<>[\]]+)\s+(?!(?:if|while|for|switch|catch|return|throw|new|else)\b)([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?=\{)/g;
  processed = processed.replace(methodRegex, (_, isStatic, _type, methodName, params) => {
    const cleanParams = params.trim() ? params.split(',').map((p: string) => {
      const parts = p.trim().split(/\s+/);
      return parts[parts.length - 1]; // Keep only parameter name
    }).join(', ') : '';

    return `${isStatic || ''}${methodName}(${cleanParams})`;
  });

  // 11. Transpile variable declarations (e.g. "int a = 5;", "String s;")
  // Avoid replacing return statements or words followed by dots, etc.
  const varDeclRegex = /\b(?!(?:return|throw|new|else|extends|implements|instanceof|class|interface|import|package|static|void|public|private|protected)\b)([A-Za-z0-9_]+(?:\s*<[A-Za-z0-9_,\s<>]*>)?(?:\[\])*)\s+([A-Za-z0-9_]+)\s*(?==|;)/g;
  processed = processed.replace(varDeclRegex, 'let $2');

  // 12. Transpile Java array instantiations
  // 2D Array: new int[5][5] -> Array.from({length: 5}, () => new Array(5).fill(0))
  processed = processed.replace(/new\s+([A-Za-z0-9_]+)\s*\[([^\]]+)\]\s*\[([^\]]+)\]/g, (_, type, size1, size2) => {
    let def = 'null';
    if (['int', 'double', 'float', 'long', 'short', 'byte'].includes(type)) def = '0';
    if (type === 'boolean') def = 'false';
    return `Array.from({ length: ${size1} }, () => new Array(${size2}).fill(${def}))`;
  });

  // 1D Array: new int[5] -> new Array(5).fill(0)
  processed = processed.replace(/new\s+([A-Za-z0-9_]+)\s*\[([^\]]+)\]/g, (_, type, size) => {
    let def = 'null';
    if (['int', 'double', 'float', 'long', 'short', 'byte'].includes(type)) def = '0';
    if (type === 'boolean') def = 'false';
    return `new Array(${size}).fill(${def})`;
  });

  // Array Initializers {1, 2, 3} -> [1, 2, 3] by checking braces containing no colon (which would indicate JS object) and starting with prefix
  let last;
  do {
    last = processed;
    processed = processed.replace(/(=|new\s+[A-Za-z0-9_<>\[\]]+|\[|\{|,)\s*\{([^:{}]+)\}/g, '$1[$2]');
  } while (processed !== last);

  // 13. Transpile type casts:
  // (int) x -> Math.trunc(x)
  processed = processed.replace(/\((int|long|short|byte)\)\s*([A-Za-z0-9_]+|\([^)]+\))/g, 'Math.trunc($2)');
  // (double) x -> (x)
  processed = processed.replace(/\((double|float)\)\s*([A-Za-z0-9_]+|\([^)]+\))/g, '($2)');
  // (char) x -> String.fromCharCode(x)
  processed = processed.replace(/\(char\)\s*([A-Za-z0-9_]+|\([^)]+\))/g, 'String.fromCharCode($2)');

  // 14. Transpile .length() on Java Strings -> .length in JS
  processed = processed.replace(/\.length\(\)/g, '.length');

  // 15. Determine which class is the main class
  let mainClassName = '';
  for (const name of classNames) {
    const classBodyRegex = new RegExp(`class\\s+${name}\\b[\\s\\S]*?\\bstatic\\s+main\\b`);
    if (classBodyRegex.test(processed)) {
      mainClassName = name;
      break;
    }
  }
  if (!mainClassName && classNames.length > 0) {
    mainClassName = classNames[0];
  }

  // 16. Restore string literals and comments
  processed = processed.replace(/__STR_(\d+)__/g, (_, idx) => strings[parseInt(idx, 10)]);
  processed = processed.replace(/__COMMENT_(\d+)__/g, (_, idx) => comments[parseInt(idx, 10)]);

  return { jsCode: processed, mainClassName };
}

/**
 * Runs Java code in the browser by transpiling to JS and executing in an iframe-like sandbox.
 */
export async function runJavaCode(
  code: string,
  onStdout: (text: string) => void,
  onStderr: (text: string) => void
): Promise<RunResult> {
  const startTime = performance.now();
  let stdoutAccum = '';
  let stderrAccum = '';
  let hadError = false;

  const appendOut = (msg: string) => {
    stdoutAccum += msg;
    onStdout(msg);
  };

  const appendErr = (msg: string) => {
    stderrAccum += msg;
    onStderr(msg);
  };

  try {
    const { jsCode, mainClassName } = transpileJavaToJS(code);

    if (!mainClassName) {
      throw new Error("Syntax Error: No class found in code.");
    }

    // Set up mock System.out / System.err
    const SystemMock = {
      out: {
        print: (...args: any[]) => {
          const msg = args.map(arg => (arg === null ? 'null' : arg.toString())).join('');
          appendOut(msg);
        },
        println: (...args: any[]) => {
          const msg = args.length === 0 ? '' : args.map(arg => (arg === null ? 'null' : arg.toString())).join('');
          appendOut(msg + '\n');
        },
        printf: (format: string, ...args: any[]) => {
          let result = format.replace(/%n/g, '\n');
          for (const arg of args) {
            result = result.replace(/%[a-zA-Z]/, arg);
          }
          appendOut(result);
        }
      },
      err: {
        print: (...args: any[]) => {
          const msg = args.map(arg => (arg === null ? 'null' : arg.toString())).join('');
          appendErr(msg);
        },
        println: (...args: any[]) => {
          const msg = args.length === 0 ? '' : args.map(arg => (arg === null ? 'null' : arg.toString())).join('');
          appendErr(msg + '\n');
        }
      },
      currentTimeMillis: () => Date.now(),
      nanoTime: () => performance.now() * 1000000
    };

    // Extract classNames to bind static methods
    const classNames: string[] = [];
    const classRegex = /\bclass\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = classRegex.exec(jsCode)) !== null) {
      classNames.push(match[1]);
    }

    // Build the script to evaluate
    const executionScript = `
      ${JAVA_LIB_CODE}
      
      ${jsCode}
      
      const _definedClasses = [${classNames.map(c => `'${c}'`).join(', ')}];
      const _exposedGlobals = [];
      for (const _clsName of _definedClasses) {
        try {
          const _cls = eval(_clsName);
          if (typeof _cls === 'function') {
            for (const _key of Object.getOwnPropertyNames(_cls)) {
              if (typeof _cls[_key] === 'function' && !['prototype', 'name', 'length'].includes(_key)) {
                globalThis[_key] = _cls[_key].bind(_cls);
                _exposedGlobals.push(_key);
              }
            }
          }
        } catch(e) {}
      }

      try {
        if (typeof ${mainClassName} !== 'undefined' && typeof ${mainClassName}.main === 'function') {
          return Promise.resolve(${mainClassName}.main([]));
        } else {
          throw new Error("NoSuchMethodError: public class " + "${mainClassName}" + " does not define a 'public static void main(String[] args)' method.");
        }
      } finally {
        for (const _key of _exposedGlobals) {
          delete globalThis[_key];
        }
      }
    `;

    // Execute in Function context
    const executor = new Function('System', executionScript);
    await executor(SystemMock);

  } catch (e: any) {
    hadError = true;
    const msg = e.message || String(e);
    appendErr(msg + '\n');
  }

  const durationMs = Math.round(performance.now() - startTime);
  return {
    stdout: stdoutAccum,
    stderr: stderrAccum,
    hadError,
    durationMs
  };
}
