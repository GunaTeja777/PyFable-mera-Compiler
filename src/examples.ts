export const EXAMPLES: Record<'python' | 'java', Record<string, string>> = {
  python: {
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
  },
  
  java: {
    hello: `// ✦ Hello, World in Java — a timeless beginning
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println();
        System.out.println("Welcome to PyFable — Java Studio");
        System.out.println("Inspired by Fable 5 ✦");
        System.out.println();
        
        String name = "Guna";
        String lang = "Java";
        System.out.printf("Happy coding, %s! Let's write some %s.\\n", name, lang);
    }
}`,

    fib: `// Fibonacci sequence in Java 🌿
public class Main {
    public static void main(String[] args) {
        int n = 14;
        System.out.println("Fibonacci (" + n + " terms):");
        
        int a = 0, b = 1;
        int sum = 0;
        int maxTerm = 0;
        
        for (int i = 0; i < n; i++) {
            System.out.print(a + (i == n - 1 ? "" : " → "));
            sum += a;
            maxTerm = a;
            
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        System.out.println();
        System.out.println("  Sum      : " + sum);
        System.out.println("  Max term : " + maxTerm);
    }
}`,

    lists: `// ArrayList and HashMap in Java 📦
import java.util.ArrayList;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        // ArrayList Demonstration
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        System.out.println("Fruits list: " + fruits);
        
        // HashMap Demonstration
        HashMap<String, Integer> prices = new HashMap<>();
        prices.put("Apple", 3);
        prices.put("Banana", 2);
        System.out.println("Fruit Prices Map: " + prices);
        
        System.out.println("Price of Banana: " + prices.get("Banana"));
        System.out.println("Fruits count: " + fruits.size());
    }
}`,

    scanner: `// Interactive Scanner Example ☕
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your favorite number: ");
        int number = scanner.nextInt();
        
        System.out.println();
        System.out.println("Hello, " + name + "! Welcome to PyFable Java Studio.");
        System.out.println("Your favorite number doubled is: " + (number * 2));
    }
}`,

    butterfly: `// 🦋 Beautiful Dotted Wing Butterfly Art in Java
public class Main {
    public static void drawButterfly(int size) {
        String[] chars = {"·", "∘", "○", "◌", "◎", "●", "◉"};
        
        // Upper wings
        for (int i = size; i > 0; i--) {
            StringBuilder pad = new StringBuilder();
            for (int k = 0; k < size - i; k++) pad.append(" ");
            
            StringBuilder wing = new StringBuilder();
            String c = chars[Math.min(i - 1, chars.length - 1)];
            for (int k = 0; k < i; k++) wing.append(c).append(" ");
            
            System.out.println(pad.toString() + wing.toString() + "   " + wing.toString());
        }
        
        // Body
        StringBuilder bodyPad = new StringBuilder();
        for (int k = 0; k < size - 1; k++) bodyPad.append(" ");
        System.out.println(bodyPad.toString() + "  >(°)<");
        
        // Lower wings
        for (int i = 1; i <= size; i++) {
            StringBuilder pad = new StringBuilder();
            for (int k = 0; k < size - i; k++) pad.append(" ");
            
            StringBuilder wing = new StringBuilder();
            String c = chars[Math.min(i - 1, chars.length - 1)];
            for (int k = 0; k < i; k++) wing.append(c).append(" ");
            
            System.out.println(pad.toString() + wing.toString() + "   " + wing.toString());
        }
    }
    
    public static void main(String[] args) {
        System.out.println("✦ Java Butterfly Art (size 6):\\n");
        drawButterfly(6);
        System.out.println("\\n  Beauty emerging from simple algorithms 🦋");
    }
}`
  }
};
