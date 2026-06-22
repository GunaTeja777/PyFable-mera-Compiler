/**
 * Static heuristic analyzer for estimating Time & Space Complexity of Python code.
 */
export function analyzeComplexity(code: string): { time: string; space: string } {
  // Remove comments and string literals to avoid false positive matches
  const cleanCode = code
    .replace(/#.*/g, '')
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '');

  const lowerCode = cleanCode.toLowerCase();
  const originalLines = code.split('\n');

  let maxLoopDepth = 0;
  const loopStack: number[] = []; // Track indentation levels of active loops

  for (const line of originalLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

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

  // 1. Determine Time Complexity Heuristics
  let timeComplexity = 'O(1)';

  // Check for recursion (simple detection of function calling itself)
  // E.g., matches: def my_func(...): ... my_func(...)
  const recursiveMatch = cleanCode.match(/def\s+(\w+)\s*\(/);
  let hasRecursion = false;
  let isBranchingRecursion = false;
  if (recursiveMatch && recursiveMatch[1]) {
    const funcName = recursiveMatch[1];
    const funcBodyRegex = new RegExp(`def\\s+${funcName}\\s*\\([\\s\\S]*?(\\b${funcName}\\b)`, 'g');
    const selfCalls = cleanCode.match(funcBodyRegex);
    if (selfCalls && selfCalls.length > 0) {
      hasRecursion = true;
      // Look for multiple self-calls or branching (e.g. fib(n-1) + fib(n-2))
      const branchingRegex = new RegExp(`\\b${funcName}\\b[\\s\\S]*?\\b${funcName}\\b`);
      isBranchingRecursion = branchingRegex.test(cleanCode.replace(new RegExp(`def\\s+${funcName}`), ''));
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
    // Superscript for nesting depth (e.g. O(N³))
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    const superscript = superscripts[maxLoopDepth] || `^${maxLoopDepth}`;
    timeComplexity = `O(N${superscript})`;
  }

  // 2. Determine Space Complexity Heuristics
  let spaceComplexity = 'O(1)';
  const hasListComprehension = /\[.*\bfor\b.*\]/.test(cleanCode);
  const hasDataStructures = /(\[\s*\]|\{\s*\}|list\(|dict\(|set\()/.test(cleanCode);
  const hasAppendOrInsert = /\.(append|insert|add|update)\b/.test(cleanCode);
  const hasMatrix = /(\[\s*\[|nested\s+list|matrix|grid)/.test(lowerCode);

  if (hasRecursion) {
    // Call stack allocation
    spaceComplexity = 'O(N)';
  } else if (hasMatrix || (maxLoopDepth >= 2 && (hasListComprehension || hasAppendOrInsert))) {
    spaceComplexity = 'O(N²)';
  } else if (hasListComprehension || hasDataStructures || hasAppendOrInsert) {
    spaceComplexity = 'O(N)';
  }

  return { time: timeComplexity, space: spaceComplexity };
}
