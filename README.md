# Root Finding Algorithms Visualizer

> An interactive web-based tool that lets you **see** numerical root-finding algorithms work step by step — not just run them.

![App Screenshot](https://i.imgur.com/0xaDuyr.png)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Supported Algorithms](#supported-algorithms)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Algorithm Details](#algorithm-details)
- [Key Concepts Explained](#key-concepts-explained)
- [Known Limitations](#known-limitations)
- [Future Plans](#future-plans)

---

## Live Demo

🌐 **[https://root-finder-2099.netlify.app/](https://root-finder-2099.netlify.app/)**

No installation needed — just open the link and start using it.

---

## Overview

Root finding is one of the most fundamental topics in Numerical Methods — solving equations of the form **f(x) = 0**. Most students study these algorithms through textbook formulas or code that prints numbers to a terminal. Neither approach makes it clear *why* each method works or *how* convergence actually looks.

This project fills that gap. You type a function, pick an algorithm, set your parameters, and watch the algorithm move toward the root — step by step — on a live graph. The iteration table and error convergence chart update in real time so you can see exactly how quickly the error is dropping.

---

## Features

| Feature | Description |
|---|---|
| Live function graph | Canvas-based plot that redraws after every iteration |
| 5 algorithms | Bisection, Newton-Raphson, Secant, Regula Falsi, Horner/Synthetic Division |
| Step-by-step mode | Go one iteration at a time and inspect each result |
| Auto-run mode | Let the algorithm animate continuously at adjustable speed |
| Iteration table | Shows n, x, f(x), and error for every step |
| Error convergence chart | Plots log₁₀(error) vs iteration so convergence speed is visible |
| Algorithm info panel | Plain-language description, formula, and convergence notes per algorithm |
| Preset functions | 8 ready-to-use functions with sensible default parameters |
| Custom function input | Type any expression using standard math notation |
| CSV export | Download the full iteration table as a `.csv` file |
| Responsive layout | Works on both wide and narrow screens |

---

## Supported Algorithms

### 1. Bisection Method
- **Type:** Bracket method
- **Needs:** Interval `[a, b]` where `f(a)` and `f(b)` have opposite signs
- **Formula:** `x = (a + b) / 2`
- **Convergence:** Linear (order 1) — halves the error each step
- **Guaranteed?** Yes, always converges if the bracket condition is met

### 2. Newton-Raphson
- **Type:** Open method
- **Needs:** One initial guess `x₀`
- **Formula:** `xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)`
- **Convergence:** Quadratic (order 2) — fastest of all methods
- **Note:** The derivative `f′(x)` is computed automatically using mathjs symbolic differentiation

### 3. Secant Method
- **Type:** Open method
- **Needs:** Two initial guesses `x₀` and `x₁`
- **Formula:** `xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁) / (f(xₙ) − f(xₙ₋₁))`
- **Convergence:** Superlinear (~1.618) — no derivative needed
- **Note:** Approximates the derivative from the last two points

### 4. Regula Falsi (False Position)
- **Type:** Bracket method
- **Needs:** Interval `[a, b]` where `f(a)` and `f(b)` have opposite signs
- **Formula:** `x = a − f(a)(b − a) / (f(b) − f(a))`
- **Convergence:** Superlinear in practice — smarter than bisection but can stagnate

### 5. Horner / Synthetic Division
- **Type:** Polynomial-only method
- **Needs:** One initial guess `x₀`, polynomial expression only
- **Formula:** `xₙ₊₁ = xₙ − P(xₙ) / P′(xₙ)` using Horner's Rule
- **Convergence:** Quadratic for simple roots
- **Note:** Extracts coefficients from the expression automatically, then uses Horner's Rule to evaluate both `P(x)` and `P′(x)` efficiently without computing the derivative symbolically

**Algorithm comparison at a glance:**

| Algorithm | Order | Needs derivative? | Needs bracket? |
|---|---|---|---|
| Bisection | 1 (linear) | No | Yes |
| Newton-Raphson | 2 (quadratic) | Yes (auto) | No |
| Secant | ~1.618 | No | No |
| Regula Falsi | ~1 (superlinear) | No | Yes |
| Horner | 2 (quadratic) | No (Horner eval) | No |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool and dev server |
| mathjs | Function parsing, evaluation, and symbolic differentiation |
| recharts | Error convergence line chart |
| HTML5 Canvas | Live function plot drawn per iteration |
| CSS Variables | Dark-themed design system |

---

## Project Structure

```
root-finder/
├── src/
│   ├── algorithms/
│   │   ├── bisection.js          # bisectionStep() + bisectionInfo
│   │   ├── newton.js             # newtonStep() + newtonInfo
│   │   ├── secant.js             # secantStep() + secantInfo
│   │   ├── regulaFalsi.js        # regulaFalsiStep() + regulaFalsiInfo
│   │   ├── hornerDeflation.js    # extractCoeffs(), hornerEval(), hornerNewtonStep()
│   │   └── index.js              # ALGORITHMS registry + PRESET_FUNCTIONS
│   ├── components/
│   │   ├── FunctionPlot.jsx      # Canvas-based live graph
│   │   ├── ErrorChart.jsx        # recharts log-scale error chart
│   │   ├── IterationTable.jsx    # Scrollable iteration log
│   │   └── AlgoInfo.jsx          # Algorithm description panel
│   ├── hooks/
│   │   └── useRootFinder.js      # All state logic and algorithm dispatch
│   ├── App.jsx                   # Main layout
│   ├── App.css                   # Layout styles
│   ├── index.css                 # Global design tokens
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
└── vite.config.js
```

### What each file does

**`algorithms/index.js`**
The central registry. Imports all algorithm step functions and metadata, and exports the `ALGORITHMS` object that the rest of the app reads. Also exports `PRESET_FUNCTIONS` — the 8 built-in function examples.

**`algorithms/hornerDeflation.js`**
Contains three functions:
- `extractCoeffs(expr)` — parses a polynomial string like `x^3 - 6x^2 + 11x - 6` into a coefficient array `[1, -6, 11, -6]`
- `hornerEval(coeffs, x)` — evaluates `P(x)` using Horner's method
- `hornerNewtonStep(coeffs, x0)` — computes both `P(x)` and `P′(x)` using the nested Horner scheme, then applies Newton's update

**`hooks/useRootFinder.js`**
The core of the app. Manages all state (current x, iteration history, algorithm state), dispatches to the right algorithm step function based on `algKey`, handles convergence checking, and manages the auto-run interval.

**`components/FunctionPlot.jsx`**
Draws everything on an HTML5 Canvas. After each iteration it redraws the function curve, the current estimate (red dot), the tangent line (Newton-Raphson), the interval shading (Bisection/Regula Falsi), and the trail of previous iteration points.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher — download from [nodejs.org](https://nodejs.org)

### Steps

```bash
# 1. Clone or unzip the project and go into the folder
cd root-finder

# 2. Install dependencies (only needed once)
npm install

# 3. Start the development server
npm run dev

# 4. Open in your browser
# → http://localhost:5173
```

### Build for production

```bash
npm run build
npm run preview
```

---

## How to Use

### Basic workflow

1. **Type a function** in the `f(x)` field at the top left.
   The app validates it live. A green indicator means the expression is valid.

2. **Choose an algorithm** by clicking one of the five buttons in the Algorithm panel.
   The parameters section updates to show what that algorithm needs.

3. **Set parameters:**
   - For **Bisection** and **Regula Falsi**: set `a` (lower bound) and `b` (upper bound) so that `f(a)` and `f(b)` have opposite signs
   - For **Newton-Raphson** and **Horner**: set `x₀` (initial guess)
   - For **Secant**: set both `x₀` and `x₁`
   - Set **Tolerance** (how small the error must be to stop) and **Max Iterations** (safety limit)

4. **Run the algorithm:**
   - Click **Step →** to go one iteration at a time
   - Click **▶ Run Auto** to animate continuously
   - Use the **Speed** slider to control how fast auto-run goes
   - Click **↺ Reset** to start over with new parameters

5. **Read the results:**
   - The graph shows the current estimate (red dot), convergence path (faded purple dots), tangent line (Newton), and interval shading (Bisection/Regula Falsi)
   - The **Iteration Table** tab shows every step's x, f(x), and error
   - The **Error Chart** tab shows log₁₀(error) dropping over iterations
   - The **Algorithm Info** tab shows the formula and convergence description for the current algorithm

6. **Export:** Click **↓ Export CSV** to download the full iteration table.

### Supported function syntax

The function input uses [mathjs](https://mathjs.org) notation:

```
x^3 - x - 2          polynomial
cos(x) - x           trigonometric
e^x - 3              exponential (also: exp(x) - 3)
log(x) - 1           natural logarithm
sqrt(x) - 2          square root
x * sin(x) - 1       mixed
x^2 - 4              simple quadratic
```

### Using Horner / Synthetic Division

This method only works for polynomial expressions. Write the polynomial in standard form:

```
x^3 - 6x^2 + 11x - 6     ✓ valid
x^2 - 4                   ✓ valid
cos(x) - x                ✗ not a polynomial, use Newton-Raphson instead
```

The app automatically extracts the coefficients from your expression, so you do not need to enter them manually.

---

## Algorithm Details

### How Horner's Rule works internally

For a polynomial like `P(x) = x³ − 6x² + 11x − 6`, the coefficients are `[1, -6, 11, -6]`.

Instead of computing `1·x³ + (-6)·x² + 11·x + (-6)` directly (which requires multiple power operations), Horner rewrites it as:

```
((1·x − 6)·x + 11)·x − 6
```

This is evaluated from the inside out — just multiplications and additions, no powers.

**Synthetic division table for x = 1:**

```
Coefficients:   1    -6    11    -6
                ↓     1    -5     6
              ─────────────────────────
                1    -5     6  |  0   ← remainder = f(1) = 0 → root found!
```

The bottom row (excluding the remainder) gives the deflated polynomial: `x² − 5x + 6`.

**How `P′(x)` is computed:**
The derivative is found by applying Horner's scheme a second time on the intermediate values:

```js
let b = coeffs[0]   // P(x) accumulator
let c = b           // P'(x) accumulator

for (let i = 1; i < n; i++) {
    b = b * x0 + coeffs[i]   // one Horner step for P
    c = c * x0 + b            // one Horner step for P'
}
b = b * x0 + coeffs[n]       // final remainder = P(x0)
// c = P'(x0)
```

Then Newton's update: `x₁ = x₀ − P(x₀) / P′(x₀)`

### Convergence checking

After every iteration the app computes:

```
error = |x_new - x_old|   (for open methods)
error = |b - a| / 2       (for bisection)
error = |f(x)|            (for regula falsi)
```

If `error < tolerance` the algorithm stops and reports the root. If `iterations >= maxIterations` it stops and reports the best estimate reached so far.

---

## Key Concepts Explained

### Lower bound (a) and upper bound (b)
The interval `[a, b]` within which you are searching for a root. For bracket methods (Bisection and Regula Falsi), `f(a)` and `f(b)` must have opposite signs — this guarantees a root exists between them by the Intermediate Value Theorem. If both have the same sign, the method will not work.

### Tolerance
How close to zero `f(x)` needs to be — or how small the change between consecutive guesses needs to be — before the algorithm accepts that it has found the root. A tolerance of `0.00001` means you want the answer accurate to 5 decimal places.

### Max iterations
A safety limit on how many times the loop runs. Without this, an algorithm that fails to converge would loop forever. When this limit is hit, the app stops and shows the best estimate reached.

### Initial guess (x₀)
For open methods (Newton-Raphson, Secant, Horner), you provide a starting point instead of an interval. The closer this is to the actual root, the faster the algorithm converges. A poor guess can cause Newton-Raphson to diverge.

---

## Known Limitations

- **Horner / Synthetic Division** only works for polynomial expressions. Trigonometric, exponential, or logarithmic functions require one of the other methods.
- **Newton-Raphson** fails when the derivative is zero or near-zero at the current guess. The app detects this and shows an error message.
- **Only one root per run.** The app finds the root nearest to the initial guess or inside the given interval. Functions with multiple roots will not have all of them found automatically.
- All state is in-browser memory. Refreshing the page resets everything.

---

## Future Plans

- Side-by-side comparison mode to run two algorithms on the same function simultaneously
- Polynomial deflation in the UI — show all roots found one after another for Horner method
- Light mode theme
- Session persistence so iteration history survives a page refresh
- More algorithms: Muller's Method, Brent's Method, Illinois Method

---

## Adding a New Algorithm

1. Create `src/algorithms/myMethod.js` with a step function and an info object:

```js
export function myMethodStep(f, x0) {
  // ... compute next x
  return { x: x1, fx: f(x1), error: Math.abs(x1 - x0) }
}

export const myMethodInfo = {
  name: 'My Method',
  short: 'mymethod',
  color: '#hex',
  description: 'What it does.',
  params: ['x0'],
  convergence: 'Order ?',
  formula: 'xₙ₊₁ = ...'
}
```

2. Import and register it in `src/algorithms/index.js`:

```js
import { myMethodStep, myMethodInfo } from './myMethod.js'

export const ALGORITHMS = {
  ...existing,
  mymethod: { ...myMethodInfo, step: myMethodStep }
}
```

3. Handle the new `algKey` in `doStep()` inside `src/hooks/useRootFinder.js`.

---

## References

- Burden, R. L., & Faires, J. D. (2011). *Numerical Analysis* (9th ed.). Brooks Cole.
- Chapra, S. C., & Canale, R. P. (2015). *Numerical Methods for Engineers* (7th ed.). McGraw-Hill.
- Atkinson, K. (1989). *An Introduction to Numerical Analysis* (2nd ed.). Wiley.
- mathjs documentation: https://mathjs.org
- React documentation: https://react.dev