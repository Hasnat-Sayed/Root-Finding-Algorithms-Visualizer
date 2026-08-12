export function regulaFalsiStep(f, a, b) {
  const fa = f(a)
  const fb = f(b)
  if (Math.abs(fb - fa) < 1e-12) throw new Error("f(b) ≈ f(a). Choose a different interval.")
  const x = a - fa * (b - a) / (fb - fa)
  const fx = f(x)
  const newA = fa * fx <= 0 ? a : x
  const newB = fa * fx <= 0 ? x : b
  return {
    x,
    fx,
    a: newA,
    b: newB,
    error: Math.abs(fx),
    info: { a: a.toFixed(6), b: b.toFixed(6), x: x.toFixed(6), fa: fa.toFixed(6), fb: fb.toFixed(6) }
  }
}

export const regulaFalsiInfo = {
  name: 'Regula Falsi',
  short: 'regulafalsi',
  color: '#ec4899',
  description: 'A smarter bisection that uses linear interpolation instead of midpoint. More efficient than bisection.',
  params: ['a', 'b'],
  convergence: 'Superlinear in practice — faster than bisection but can stagnate on one side.',
  formula: 'xₙ = a − f(a)·(b − a) / (f(b) − f(a))'
}
