// src/algorithms/hornerDeflation.js

// ------------------------------------
// Convert polynomial string -> coefficients
// Example:
// x^3 - 6x^2 + 11x - 6
// becomes
// [1,-6,11,-6]
// ------------------------------------
export function extractCoeffs(expr) {

  let s = expr.replace(/\s+/g, '')
  s = s.replace(/\*/g, '')

  if (!/^[0-9xX+\-^.]+$/.test(s))
    throw new Error("Horner's method supports polynomial expressions only.")

  const degreeMatch = [...s.matchAll(/x\^(\d+)/g)]
  const degree = degreeMatch.length
    ? Math.max(...degreeMatch.map(m => Number(m[1])))
    : (s.includes('x') ? 1 : 0)

  if (degree === 0)
    throw new Error("Invalid polynomial.")

  const coeffs = new Array(degree + 1).fill(0)

  const terms = s.match(/[+-]?[^+-]+/g)

  for (const term of terms) {

    if (term.includes('x^')) {

      const [c,p] = term.split('x^')
      const coeff =
        c === '' || c === '+' ? 1 :
        c === '-' ? -1 :
        Number(c)

      coeffs[degree - Number(p)] += coeff
    }

    else if (term.includes('x')) {

      const c = term.replace('x','')

      const coeff =
        c === '' || c === '+' ? 1 :
        c === '-' ? -1 :
        Number(c)

      coeffs[degree-1] += coeff
    }

    else {

      coeffs[degree] += Number(term)

    }

  }

  return coeffs
}



// ------------------------------------
// Horner evaluation
// returns P(x)
// ------------------------------------
export function hornerEval(coeffs,x){

  let y = coeffs[0]

  for(let i=1;i<coeffs.length;i++)
      y = y*x + coeffs[i]

  return y

}



// ------------------------------------
// Horner simultaneously computes
// P(x) and P'(x)
// ------------------------------------
export function hornerNewtonStep(coeffs,x0){

  const n = coeffs.length-1

  let b = coeffs[0]
  let c = b

  for(let i=1;i<n;i++){

      b = b*x0 + coeffs[i]
      c = c*x0 + b

  }

  b = b*x0 + coeffs[n]

  const fx = b
  const dfx = c

  if(Math.abs(dfx)<1e-12)
      throw new Error("Derivative became zero.")

  const x1 = x0 - fx/dfx

  return{

      x:x1,
      fx:hornerEval(coeffs,x1),
      error:Math.abs(x1-x0)

  }

}



export const hornerInfo={

  name:'Horner / Synthetic Division',
  short:'horner',
  color:'#06b6d4',

  description:
  "Evaluates polynomial and derivative using Horner's Rule, then performs Newton-Raphson iteration.",

  params:['x0'],

  convergence:'Quadratic',

  formula:'x(n+1)=x(n)-P(x)/P\'(x)'

}