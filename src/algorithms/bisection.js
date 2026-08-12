export function bisectionStep(f, a, b) {
  const m = (a + b) / 2
  const fa = f(a)
  const fm = f(m)
  const newA = fa * fm <= 0 ? a : m
  const newB = fa * fm <= 0 ? m : b
  return {
    x: m,
    fx: fm,
    a: newA,
    b: newB,
    error: Math.abs(b - a) / 2,
    info: { a: a.toFixed(6), b: b.toFixed(6), m: m.toFixed(6) }
  }
}

export const bisectionInfo = {
  name: 'Bisection Method',
  short: 'bisection',
  color: '#7c3aed',
  description: 'Repeatedly halves the search interval. Guaranteed to converge if f(a) and f(b) have opposite signs.',
  params: ['a', 'b'],
  convergence: 'Linear — halves the error each iteration. Slow but very reliable.',
  formula: 'xₙ = (a + b) / 2'
}
