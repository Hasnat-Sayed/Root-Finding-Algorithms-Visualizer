import { useEffect, useRef } from 'react'

export default function FunctionPlot({ parseFunc, funcExpr, algKey, iterations, algState, inputs }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const f = parseFunc(funcExpr)
    if (!f) return

    // Determine plot range
    let xMin, xMax
    const a = parseFloat(inputs.a), b = parseFloat(inputs.b)
    const x0 = parseFloat(inputs.x0), x1 = parseFloat(inputs.x1)

    if (algKey === 'bisection' || algKey === 'regulafalsi') {
      const center = (a + b) / 2
      const span = Math.max(Math.abs(b - a) * 2.5, 4)
      xMin = center - span / 2
      xMax = center + span / 2
    } else {
      const center = (x0 + x1) / 2
      const span = Math.max(Math.abs(x1 - x0) * 4, 6)
      xMin = center - span / 2
      xMax = center + span / 2
    }

    // Sample function
    const N = 600
    const pts = []
    for (let i = 0; i <= N; i++) {
      const x = xMin + (xMax - xMin) * i / N
      try { pts.push({ x, y: f(x) }) } catch { pts.push({ x, y: NaN }) }
    }
    const ys = pts.map(p => p.y).filter(v => isFinite(v) && Math.abs(v) < 1e6)
    if (!ys.length) return
    let yMin = Math.min(...ys), yMax = Math.max(...ys)
    const yPad = (yMax - yMin) * 0.2 || 1
    yMin -= yPad; yMax += yPad

    const PAD = { l: 48, r: 16, t: 16, b: 36 }
    const pw = W - PAD.l - PAD.r
    const ph = H - PAD.t - PAD.b

    const tx = x => PAD.l + (x - xMin) / (xMax - xMin) * pw
    const ty = y => PAD.t + (1 - (y - yMin) / (yMax - yMin)) * ph

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let v = Math.ceil(xMin); v <= Math.floor(xMax); v++) {
      ctx.beginPath(); ctx.moveTo(tx(v), PAD.t); ctx.lineTo(tx(v), PAD.t + ph); ctx.stroke()
    }
    const yStep = Math.pow(10, Math.floor(Math.log10((yMax - yMin) / 5)))
    for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
      ctx.beginPath(); ctx.moveTo(PAD.l, ty(v)); ctx.lineTo(PAD.l + pw, ty(v)); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    if (yMin < 0 && yMax > 0) {
      ctx.beginPath(); ctx.moveTo(PAD.l, ty(0)); ctx.lineTo(PAD.l + pw, ty(0)); ctx.stroke()
    }
    if (xMin < 0 && xMax > 0) {
      ctx.beginPath(); ctx.moveTo(tx(0), PAD.t); ctx.lineTo(tx(0), PAD.t + ph); ctx.stroke()
    }

    // Axis labels
    ctx.fillStyle = 'rgba(148,163,184,0.7)'
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    for (let v = Math.ceil(xMin); v <= Math.floor(xMax); v += Math.max(1, Math.floor((xMax - xMin) / 8))) {
      ctx.fillText(v, tx(v), PAD.t + ph + 18)
    }
    ctx.textAlign = 'right'
    for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep * 2) {
      const label = Math.abs(v) < 1e-9 ? '0' : v.toFixed(Math.abs(v) < 0.1 ? 2 : 1)
      ctx.fillText(label, PAD.l - 6, ty(v) + 4)
    }

    // Interval shading for bisection / regula falsi
    if ((algKey === 'bisection' || algKey === 'regulafalsi') && algState) {
      const ia = algState.a, ib = algState.b
      ctx.fillStyle = 'rgba(124,58,237,0.08)'
      ctx.fillRect(tx(ia), PAD.t, tx(ib) - tx(ia), ph)
      ctx.strokeStyle = 'rgba(124,58,237,0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.moveTo(tx(ia), PAD.t); ctx.lineTo(tx(ia), PAD.t + ph); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx(ib), PAD.t); ctx.lineTo(tx(ib), PAD.t + ph); ctx.stroke()
      ctx.setLineDash([])
    }

    // Newton tangent line
    if (algKey === 'newton' && iterations.length > 0) {
      const last = iterations[iterations.length - 1]
      if (last.info?.tangentX !== undefined) {
        const xp = last.info.tangentX
        const yp = last.info.tangentY
        const slope = last.info.tangentSlope
        const tx1 = xMin, tx2 = xMax
        const ty1 = yp + slope * (tx1 - xp)
        const ty2 = yp + slope * (tx2 - xp)
        ctx.strokeStyle = 'rgba(249,115,22,0.5)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(tx(tx1), ty(ty1)); ctx.lineTo(tx(tx2), ty(ty2)); ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Secant line
    if (algKey === 'secant' && iterations.length >= 2) {
      const prev = iterations[iterations.length - 2]
      const curr = iterations[iterations.length - 1]
      ctx.strokeStyle = 'rgba(249,115,22,0.45)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      ctx.moveTo(tx(prev.x), ty(f(prev.x)))
      ctx.lineTo(tx(curr.x), ty(f(curr.x)))
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Function curve
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    let started = false
    for (const p of pts) {
      if (!isFinite(p.y) || p.y < yMin - yPad * 5 || p.y > yMax + yPad * 5) { started = false; continue }
      const px = tx(p.x), py = ty(p.y)
      if (!started) { ctx.moveTo(px, py); started = true } else ctx.lineTo(px, py)
    }
    ctx.stroke()

    // Current point
    if (iterations.length > 0) {
      const last = iterations[iterations.length - 1]
      const px = tx(last.x), py = ty(last.fx)

      // Drop line to x-axis
      if (yMin < 0 && yMax > 0) {
        ctx.strokeStyle = 'rgba(239,68,68,0.4)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ty(0)); ctx.stroke()
        ctx.setLineDash([])
      }

      // Point on curve
      ctx.fillStyle = '#ef4444'
      ctx.strokeStyle = '#0d0d14'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()

      // Label
      ctx.fillStyle = '#fca5a5'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`x=${last.x.toFixed(4)}`, px + 9, py - 5)
    }

    // Previous points (faded)
    const showN = Math.min(iterations.length - 1, 6)
    for (let i = iterations.length - showN - 1; i < iterations.length - 1; i++) {
      if (i < 0) continue
      const it = iterations[i]
      const alpha = 0.15 + 0.35 * (i / (iterations.length - 1))
      ctx.fillStyle = `rgba(167,139,250,${alpha})`
      ctx.beginPath(); ctx.arc(tx(it.x), ty(it.fx), 3, 0, 2 * Math.PI); ctx.fill()
    }

    // Root marker
    const last = iterations[iterations.length - 1]
    if (last && Math.abs(last.fx) < 0.01 && yMin < 0 && yMax > 0) {
      ctx.fillStyle = '#22c55e'
      ctx.strokeStyle = '#0d0d14'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(tx(last.x), ty(0), 7, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✓', tx(last.x), ty(0) + 4)
    }

  }, [funcExpr, algKey, iterations, algState, inputs, parseFunc])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={360}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
