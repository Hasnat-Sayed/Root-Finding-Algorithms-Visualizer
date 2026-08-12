import { useState, useRef, useCallback } from 'react'
import * as math from 'mathjs'
import { ALGORITHMS } from '../algorithms/index.js'
import { hornerNewtonStep, extractCoeffs } from '../algorithms/hornerDeflation.js'


export function useRootFinder() {
  const [funcExpr, setFuncExpr] = useState('x^3 - x - 2')
  const [funcError, setFuncError] = useState(null)
  const [algKey, setAlgKey] = useState('bisection')
  const [inputs, setInputs] = useState({ a: 1, b: 2, x0: 1.5, x1: 2, tol: 0.00001, maxIter: 50 })
  const [iterations, setIterations] = useState([])
  const [algState, setAlgState] = useState(null)
  const [status, setStatus] = useState('idle') // idle | running | converged | failed
  const [message, setMessage] = useState('')
  const autoRef = useRef(null)
  const [isAuto, setIsAuto] = useState(false)

  const alg = ALGORITHMS[algKey]

  const parseFunc = useCallback((expr) => {
    try {
      const compiled = math.compile(expr)
      const f = (x) => {
        const val = compiled.evaluate({ x })
        if (typeof val !== 'number' || !isFinite(val)) throw new Error('f(x) is not finite')
        return val
      }
      // test it
      f(1)
      setFuncError(null)
      return f
    } catch (e) {
      setFuncError('Invalid function: ' + e.message)
      return null
    }
  }, [])

  const parseDerivative = useCallback((expr) => {
    try {
      const node = math.parse(expr)
      const derived = math.derivative(node, 'x')
      const compiled = derived.compile()
      return (x) => compiled.evaluate({ x })
    } catch (e) {
      setFuncError('Cannot compute derivative: ' + e.message)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    clearInterval(autoRef.current)
    setIsAuto(false)
    setIterations([])
    setStatus('idle')
    setMessage('Ready. Press Step or Run.')
    const init = {
      a: parseFloat(inputs.a),
      b: parseFloat(inputs.b),
      x0: parseFloat(inputs.x0),
      x1: parseFloat(inputs.x1),
    }
    setAlgState(init)
  }, [inputs])

  const doStep = useCallback((currentIterations, currentAlgState) => {
    const f = parseFunc(funcExpr)
    if (!f) return { newIterations: currentIterations, newAlgState: currentAlgState, done: true }

    const tol = parseFloat(inputs.tol)
    const maxIter = parseInt(inputs.maxIter)
    let result

    try {
      if (algKey === 'bisection') {
        result = ALGORITHMS.bisection.step(f, currentAlgState.a, currentAlgState.b)
      } else if (algKey === 'newton') {
        const df = parseDerivative(funcExpr)
        if (!df) return { newIterations: currentIterations, newAlgState: currentAlgState, done: true }
        result = ALGORITHMS.newton.step(f, df, currentAlgState.x0)
      } else if (algKey === 'secant') {
        result = ALGORITHMS.secant.step(f, currentAlgState.x0, currentAlgState.x1)
      } else if (algKey === 'horner') {
        let coeffs
        try {
          coeffs = extractCoeffs(funcExpr)  // parse "x^3 - 6x^2 + 11x - 6" → [1,-6,11,-6]
        } catch (e) {
          setStatus('failed')
          setMessage('Error: ' + e.message)
          return { newIterations: currentIterations, newAlgState: currentAlgState, done: true }
        }
        result = hornerNewtonStep(coeffs, currentAlgState.x0)
        //newState.x0 = result.x  // update x0 for next iteration
      }
      else {
        result = ALGORITHMS.regulafalsi.step(f, currentAlgState.a, currentAlgState.b)
      }


      console.log("Algorithm result:", result)
    } catch (e) {
      setStatus('failed')
      setMessage('Error: ' + e.message)
      return { newIterations: currentIterations, newAlgState: currentAlgState, done: true }
    }

    const n = currentIterations.length + 1
    const newIter = {
      n,
      x: result.x,
      fx: result.fx,
      error: result.error,
      info: result.info,
      interval: result.a !== undefined ? { a: result.a, b: result.b } : null
    }
    const newIterations = [...currentIterations, newIter]

    let newAlgState = { ...currentAlgState }
    if (algKey === 'bisection' || algKey === 'regulafalsi') {
      newAlgState.a = result.a
      newAlgState.b = result.b
    } else if (algKey === 'newton') {
      newAlgState.x0 = result.x
    }
    else {
      newAlgState.x0 = currentAlgState.x1
      newAlgState.x1 = result.x
    }

    let done = false
    if (result.error < tol && n > 1) {
      setStatus('converged')
      setMessage(`✓ Converged to root ≈ ${result.x.toFixed(10)} in ${n} iterations`)
      done = true
    } else if (n >= maxIter) {
      setStatus('failed')
      setMessage(`Reached max iterations (${maxIter}). Best estimate: ${result.x.toFixed(8)}`)
      done = true
    } else {
      setStatus('running')
      setMessage(`Iteration ${n}: x = ${result.x.toFixed(8)}, error = ${result.error.toExponential(3)}`)
    }

    return { newIterations, newAlgState, done }
  }, [funcExpr, algKey, inputs, parseFunc, parseDerivative])

  const step = useCallback(() => {
    if (status === 'converged' || status === 'failed') return
    let currentState = algState
    if (!currentState || status === 'idle') {
      const init = {
        a: parseFloat(inputs.a),
        b: parseFloat(inputs.b),
        x0: parseFloat(inputs.x0),
        x1: parseFloat(inputs.x1),
      }
      currentState = init
      setAlgState(init)
      setIterations([])
    }

    const { newIterations, newAlgState, done } = doStep(iterations, currentState)
    setIterations(newIterations)
    setAlgState(newAlgState)
    return done
  }, [algState, iterations, inputs, status, doStep])

  const toggleAuto = useCallback(() => {
    if (isAuto) {
      clearInterval(autoRef.current)
      setIsAuto(false)
      return
    }
    setIsAuto(true)
    if (status === 'idle' || !algState) {
      const init = {
        a: parseFloat(inputs.a),
        b: parseFloat(inputs.b),
        x0: parseFloat(inputs.x0),
        x1: parseFloat(inputs.x1),
      }
      setAlgState(init)
      setIterations([])
    }

    let iters = (status === 'idle' || !algState) ? [] : [...iterations]
    let state = (status === 'idle' || !algState) ? {
      a: parseFloat(inputs.a), b: parseFloat(inputs.b),
      x0: parseFloat(inputs.x0), x1: parseFloat(inputs.x1)
    } : { ...algState }

    autoRef.current = setInterval(() => {
      const { newIterations, newAlgState, done } = doStep(iters, state)
      iters = newIterations
      state = newAlgState
      setIterations([...newIterations])
      setAlgState({ ...newAlgState })
      if (done) {
        clearInterval(autoRef.current)
        setIsAuto(false)
      }
    }, 600)
  }, [isAuto, algState, iterations, inputs, status, doStep])

  const setSpeed = useCallback((ms) => {
    if (isAuto) {
      clearInterval(autoRef.current)
      let iters = [...iterations]
      let state = { ...algState }
      autoRef.current = setInterval(() => {
        const { newIterations, newAlgState, done } = doStep(iters, state)
        iters = newIterations
        state = newAlgState
        setIterations([...newIterations])
        setAlgState({ ...newAlgState })
        if (done) { clearInterval(autoRef.current); setIsAuto(false) }
      }, ms)
    }
  }, [isAuto, iterations, algState, doStep])

  const exportCSV = useCallback(() => {
    if (!iterations.length) return
    const header = 'n,x,f(x),error\n'
    const rows = iterations.map(r => `${r.n},${r.x},${r.fx},${r.error}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${algKey}_iterations.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [iterations, algKey])

  return {
    funcExpr, setFuncExpr,
    funcError,
    algKey, setAlgKey,
    alg,
    inputs, setInputs,
    iterations,
    status, message,
    isAuto,
    reset, step, toggleAuto, setSpeed, exportCSV,
    parseFunc,
  }
}
