/**
 * Static heuristic analyzer for estimating Time & Space Complexity of Python code.
 */
export function analyzeComplexity(code: string, isJava = false): { time: string; space: string } {
  // Remove comments and string literals to avoid false positive matches
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Java multi-line comment
    .replace(/\/\/.*/g, '')          // Java single-line comment
    .replace(/#.*/g, '')             // Python single-line comment
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '');

  const lowerCode = cleanCode.toLowerCase();
  let maxLoopDepth = 0;

  if (isJava) {
    // Java: track depth via curly braces following a loop keyword
    let braceLevel = 0;
    const loopBraceLevels: number[] = [];
    const tokens = cleanCode.split(/(\{|\}|\bfor\b|\bwhile\b)/);
    let pendingLoop = false;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i].trim();
      if (tok === '{') {
        braceLevel++;
        if (pendingLoop) {
          loopBraceLevels.push(braceLevel);
          pendingLoop = false;
          if (loopBraceLevels.length > maxLoopDepth) {
            maxLoopDepth = loopBraceLevels.length;
          }
        }
      } else if (tok === '}') {
        braceLevel--;
        while (loopBraceLevels.length > 0 && loopBraceLevels[loopBraceLevels.length - 1] > braceLevel) {
          loopBraceLevels.pop();
        }
      } else if (tok === 'for' || tok === 'while') {
        pendingLoop = true;
      }
    }
  } else {
    // Python: track depth via indentation
    const originalLines = code.split('\n');
    const loopStack: number[] = []; // Track indentation levels of active loops

    for (const line of originalLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

      // Calculate level of indentation (leading spaces/tabs)
      const indent = line.length - line.trimStart().length;

      // Pop active loops from stack if we have exited their indentation scope
      while (loopStack.length > 0 && indent <= loopStack[loopStack.length - 1]) {
        loopStack.pop();
      }

      // Check if this line starts a loop
      const isLoop = /^(for\s+|while\s+)/.test(trimmed);
      if (isLoop) {
        loopStack.push(indent);
        if (loopStack.length > maxLoopDepth) {
          maxLoopDepth = loopStack.length;
        }
      }
    }
  }

  // 1. Determine Time Complexity Heuristics
  let timeComplexity = 'O(1)';
  let hasRecursion = false;
  let isBranchingRecursion = false;

  if (isJava) {
    // Find first method definition in Java (excluding main)
    const methodMatch = cleanCode.match(/(?:[A-Za-z0-9_<>[\]]+)\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/);
    if (methodMatch && methodMatch[1]) {
      const methodName = methodMatch[1];
      if (!['main', 'if', 'while', 'for', 'switch'].includes(methodName)) {
        const selfCallRegex = new RegExp(`\\b${methodName}\\b`, 'g');
        const occurrences = cleanCode.match(selfCallRegex);
        if (occurrences && occurrences.length > 1) {
          hasRecursion = true;
          const restOfCode = cleanCode.replace(new RegExp(`[A-Za-z0-9_<>\\[\\]]+\\s+${methodName}\\s*\\(`), '');
          const selfCallsInRest = restOfCode.match(selfCallRegex);
          if (selfCallsInRest && selfCallsInRest.length >= 2) {
            isBranchingRecursion = true;
          }
        }
      }
    }
  } else {
    // Python recursion detection
    const recursiveMatch = cleanCode.match(/def\s+(\w+)\s*\(/);
    if (recursiveMatch && recursiveMatch[1]) {
      const funcName = recursiveMatch[1];
      const funcBodyRegex = new RegExp(`def\\s+${funcName}\\s*\\([\\s\\S]*?(\\b${funcName}\\b)`, 'g');
      const selfCalls = cleanCode.match(funcBodyRegex);
      if (selfCalls && selfCalls.length > 0) {
        hasRecursion = true;
        const branchingRegex = new RegExp(`\\b${funcName}\\b[\\s\\S]*?\\b${funcName}\\b`);
        isBranchingRecursion = branchingRegex.test(cleanCode.replace(new RegExp(`def\\s+${funcName}`), ''));
      }
    }
  }

  const hasSort = /\b(sort|sorted)\b/.test(lowerCode);
  const hasLogarithmicPattern = /(\bmid\b|>>\s*1|\/\/\s*2|binary_search|log)/.test(lowerCode);

  if (hasRecursion) {
    timeComplexity = isBranchingRecursion ? 'O(2ᴺ)' : 'O(N)';
  } else if (maxLoopDepth === 0) {
    timeComplexity = 'O(1)';
  } else if (maxLoopDepth === 1) {
    if (hasLogarithmicPattern) {
      timeComplexity = 'O(log N)';
    } else if (hasSort) {
      timeComplexity = 'O(N log N)';
    } else {
      timeComplexity = 'O(N)';
    }
  } else if (maxLoopDepth === 2) {
    timeComplexity = 'O(N²)';
  } else if (maxLoopDepth >= 3) {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    const superscript = superscripts[maxLoopDepth] || `^${maxLoopDepth}`;
    timeComplexity = `O(N${superscript})`;
  }

  // 2. Determine Space Complexity Heuristics
  let spaceComplexity = 'O(1)';
  
  if (isJava) {
    const hasDataStructures = /\bnew\s+(ArrayList|HashMap|HashSet|int|double|String|boolean|char|float|long)\b/.test(cleanCode);
    const hasAddOrPut = /\.(add|put|push)\b/.test(cleanCode);
    if (hasRecursion) {
      spaceComplexity = 'O(N)';
    } else if (maxLoopDepth >= 2 && hasDataStructures) {
      spaceComplexity = 'O(N²)';
    } else if (hasDataStructures || hasAddOrPut) {
      spaceComplexity = 'O(N)';
    }
  } else {
    const hasListComprehension = /\[.*\bfor\b.*\]/.test(cleanCode);
    const hasDataStructures = /(\[\s*\]|\{\s*\}|list\(|dict\(|set\()/.test(cleanCode);
    const hasAppendOrInsert = /\.(append|insert|add|update)\b/.test(cleanCode);
    const hasMatrix = /(\[\s*\[|nested\s+list|matrix|grid)/.test(lowerCode);

    if (hasRecursion) {
      spaceComplexity = 'O(N)';
    } else if (hasMatrix || (maxLoopDepth >= 2 && (hasListComprehension || hasAppendOrInsert))) {
      spaceComplexity = 'O(N²)';
    } else if (hasListComprehension || hasDataStructures || hasAppendOrInsert) {
      spaceComplexity = 'O(N)';
    }
  }

  return { time: timeComplexity, space: spaceComplexity };
}
