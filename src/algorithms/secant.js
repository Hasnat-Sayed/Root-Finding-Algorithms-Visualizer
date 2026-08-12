export function secantStep(f, x0, x1) {
  const f0 = f(x0)
  const f1 = f(x1)
  if (Math.abs(f1 - f0) < 1e-12)
    throw new Error("f(x₀) ≈ f(x₁). Choose different initial values.")
  const x2 = x1 - f1 * (x1 - x0) / (f1 - f0)
  return {
    x: x2,
    fx: f(x2),
    error: Math.abs(x2 - x1),
    info: { x0: x0.toFixed(6), x1: x1.toFixed(6), f0: f0.toFixed(6), f1: f1.toFixed(6) }
  }
}

export const secantInfo = {
  name: 'Secant Method',
  short: 'secant',
  color: '#f97316',
  description: 'Like Newton-Raphson but approximates the derivative using two points. No need to compute f′(x).',
  params: ['x0', 'x1'],
  convergence: 'Superlinear (~1.618) — faster than bisection, slightly slower than Newton.',
  formula: 'xₙ₊₁ = xₙ − f(xₙ)·(xₙ − xₙ₋₁) / (f(xₙ) − f(xₙ₋₁))'
}
