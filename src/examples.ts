export const EXAMPLES: Record<string, string> = {
  hello: `# ✦ Hello, World — a timeless beginning
print("Hello, World!")
print()
print("Welcome to PyFable — Python Studio")
print("Inspired by Fable 5 ✦")
print()

name = "Guna"
lang = "Python"
print(f"Happy coding, {name}! Let's write some {lang}.")`,

  fib: `# Fibonacci — nature's own sequence 🌿
def fibonacci(n):
    """Yield Fibonacci numbers up to n terms."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

n = 14
seq = list(fibonacci(n))

print(f"Fibonacci ({n} terms):")
print("  " + " → ".join(str(x) for x in seq))
print()
print(f"  Sum      : {sum(seq):,}")
print(f"  Max term : {seq[-1]:,}")

# Golden ratio approximation
ratio = seq[-1] / seq[-2]
print(f"  φ ≈ {ratio:.6f}  (true: 1.618034…)")`,

  listcomp: `# List Comprehensions — expressive Python ✦
# Basic squares
squares = [x**2 for x in range(1, 11)]
print("Squares:", squares)

# Filtered
evens = [x for x in range(1, 21) if x % 2 == 0]
print("Evens  :", evens)

# Nested — multiplication table
size = 5
table = [[i * j for j in range(1, size + 1)] for i in range(1, size + 1)]

print(f"\\n  {size}×{size} multiplication table:")
header = "    " + "  ".join(f"{j:2}" for j in range(1, size + 1))
print(header)
print("    " + "─" * (size * 4))
for i, row in enumerate(table, 1):
    print(f"  {i} │ " + "  ".join(f"{n:2}" for n in row))

# Dict comprehension
word_lengths = {w: len(w) for w in ["butterfly", "parchment", "fable", "python"]}
print("\\n  Word lengths:", word_lengths)`,

  classes: `# Classes & Objects — botanical taxonomy 🦋
class Butterfly:
    """A lepidopteran specimen."""
    _count = 0

    def __init__(self, name, wingspan_cm, colors, family):
        self.name = name
        self.wingspan = wingspan_cm
        self.colors = colors
        self.family = family
        Butterfly._count += 1

    def describe(self):
        c = ", ".join(self.colors)
        return (f"  {self.name}\\n"
                f"    Family: {self.family}\\n"
                f"    Wingspan: {self.wingspan} cm\\n"
                f"    Colors: {c}")

    @classmethod
    def total(cls):
        return cls._count

    def __lt__(self, other):
        return self.wingspan < other.wingspan

collection = [
    Butterfly("Rajah Brooke's Birdwing", 17.5,
              ["emerald green", "jet black"], "Papilionidae"),
    Butterfly("Blue Morpho", 15.0,
              ["iridescent blue", "brown"], "Nymphalidae"),
    Butterfly("Monarch", 10.2,
              ["burnt orange", "black", "white"], "Nymphalidae"),
    Butterfly("Glasswing", 5.8,
              ["transparent", "red-orange border"], "Nymphalidae"),
    Butterfly("Apollo", 8.0,
              ["white", "black spots", "red ocelli"], "Papilionidae"),
]

print("✦ Butterfly Collection — sorted by wingspan\\n")
for b in sorted(collection, reverse=True):
    print(b.describe())

print(f"\\n  Total specimens: {Butterfly.total()}")`,

  deco: `# Decorators — wrapping functions elegantly ✦
import time

def timer(func):
    """Measure and report execution time."""
    def wrapper(*args, **kwargs):
        t0 = time.time()
        result = func(*args, **kwargs)
        ms = (time.time() - t0) * 1000
        print(f"  ⏱  {func.__name__}() → {ms:.2f} ms")
        return result
    return wrapper

def memoize(func):
    """Cache results for repeated calls."""
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    wrapper.cache = cache
    return wrapper

@timer
@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

@timer
def prime_sieve(limit):
    """Sieve of Eratosthenes."""
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(limit**.5) + 1):
        if sieve[i]:
            for j in range(i*i, limit+1, i):
                sieve[j] = False
    return [i for i, v in enumerate(sieve) if v]

print("Decorated functions:\\n")
result = fib(35)
print(f"  fib(35) = {result:,}\\n")

primes = prime_sieve(200)
print(f"  Primes up to 200: {len(primes)} found")
print(f"  Last five: {primes[-5:]}")`,

  gen: `# Generators — lazy sequences ✦
def infinite_primes():
    """Yield primes forever using a sieve."""
    D = {}
    q = 2
    while True:
        if q not in D:
            yield q
            D[q * q] = [q]
        else:
            for p in D[q]:
                D.setdefault(p + q, []).append(p)
            del D[q]
        q += 1

def take(n, gen):
    for _ in range(n):
        yield next(gen)

# First 20 primes
gen = infinite_primes()
primes = list(take(20, gen))
print("First 20 primes:")
print(" ", primes)

# Fibonacci via generator expression
def fib_gen():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fibs = [x for x, _ in zip(fib_gen(), range(12))]
print("\\nFirst 12 Fibonacci:")
print(" ", fibs)

# Pipeline: lazy map + filter + take
def naturals(start=1):
    n = start
    while True:
        yield n
        n += 1

pipeline = (x**2 for x in naturals() if x % 3 == 0)
result = [next(pipeline) for _ in range(8)]
print("\\nFirst 8 multiples-of-3 squared:")
print(" ", result)`,

  butterfly: `# 🦋 ASCII Butterfly — pattern art
def butterfly(size=7):
    lines = []
    for i in range(size, 0, -1):
        pad = " " * (size - i)
        wing = "*" * i
        lines.append(pad + wing + "  " + wing)
    lines.append(" " * (size - 1) + "\\\\(^)/" )
    for i in range(1, size + 1):
        pad = " " * (size - i)
        wing = "*" * i
        lines.append(pad + wing + "  " + wing)
    return "\\n".join(lines)

def colored_wings(size=5):
    chars = ['·', '∘', '○', '◌', '◎', '●', '◉']
    for i in range(size, 0, -1):
        pad = " " * (size - i)
        c = chars[min(i - 1, len(chars) - 1)]
        wing = (c + " ") * i
        print(pad + wing + " " + wing)
    print(" " * (size - 1) + " >(°)<")
    for i in range(1, size + 1):
        pad = " " * (size - i)
        c = chars[min(i - 1, len(chars) - 1)]
        wing = (c + " ") * i
        print(pad + wing + " " + wing)

print("Classic butterfly (size 7):\\n")
print(butterfly(7))
print("\\n\\nDotted wings (size 5):\\n")
colored_wings(5)
print("\\n  Beauty emerging from simple rules 🦋")`,

  fractal: `# Mandelbrot Set — ASCII rendering ✦
def mandelbrot(c, max_iter=48):
    z = 0
    for n in range(max_iter):
        if abs(z) > 2:
            return n
        z = z * z + c
    return max_iter

# Render window
x_min, x_max = -2.0, 0.6
y_min, y_max =  -1.2, 1.2
cols, rows = 70, 28

palette = " .:-=+*#%@█"

print("✦ Mandelbrot Set\\n")
for row in range(rows):
    line = ""
    for col in range(cols):
        x = x_min + (x_max - x_min) * col / cols
        y = y_min + (y_max - y_min) * row / rows
        m = mandelbrot(complex(x, y))
        idx = int(m / 48 * (len(palette) - 1))
        line += palette[idx]
    print(line)
print()
print("  Infinite complexity from z² + c  ✦")`
};
