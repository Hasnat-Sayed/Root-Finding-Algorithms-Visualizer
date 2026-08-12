export function newtonStep(f, df, x0) {
  const fx = f(x0)
  const dfx = df(x0)
  if (Math.abs(dfx) < 1e-12) throw new Error("Derivative ≈ 0 at x=" + x0.toFixed(6) + ". Choose a different initial guess.")
  const x1 = x0 - fx / dfx
  return {
    x: x1,
    fx: f(x1),
    error: Math.abs(x1 - x0),
    info: { x0: x0.toFixed(6), fx: fx.toFixed(6), dfx: dfx.toFixed(6), tangentX: x0, tangentSlope: dfx, tangentY: fx }
  }
}

export const newtonInfo = {
  name: 'Newton-Raphson',
  short: 'newton',
  color: '#14b8a6',
  description: 'Uses the tangent line at each guess to find the next, much closer approximation. Very fast near the root.',
  params: ['x0'],
  convergence: 'Quadratic — doubles the correct digits each step. Fastest of all methods.',
  formula: 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)'
}
