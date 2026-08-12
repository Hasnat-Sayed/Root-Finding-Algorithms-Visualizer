import { useState, useRef, useCallback } from 'react'
import { useRootFinder } from './hooks/useRootFinder.js'
import { ALGORITHMS, PRESET_FUNCTIONS } from './algorithms/index.js'
import FunctionPlot from './components/FunctionPlot.jsx'
import ErrorChart from './components/ErrorChart.jsx'
import IterationTable from './components/IterationTable.jsx'
import AlgoInfo from './components/AlgoInfo.jsx'
import './App.css'

export default function App() {
  const rf = useRootFinder()
  const speedRef = useRef(600)
  const [tab, setTab] = useState('table') // table | error | info
  const [showPresets, setShowPresets] = useState(false)

  const applyPreset = (preset) => {
    rf.setFuncExpr(preset.expr)
    rf.setInputs(prev => ({
      ...prev,
      a: preset.defaultA,
      b: preset.defaultB,
      x0: preset.defaultX0,
      x1: preset.defaultX1,
    }))
    setShowPresets(false)
    setTimeout(() => rf.reset(), 50)
  }

  const algEntries = Object.entries(ALGORITHMS)

  const statusColor = {
    idle: 'var(--text3)',
    running: 'var(--accent2)',
    converged: '#22c55e',
    failed: '#ef4444',
  }[rf.status] || 'var(--text3)'

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-dot" />
            <span className="logo-text">RootFinder</span>
            <span className="logo-sub">Numerical Methods Visualizer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {rf.iterations.length > 0 && (
              <button onClick={rf.exportCSV} style={{ fontSize: 12, padding: '5px 12px' }}>
                ↓ Export CSV
              </button>
            )}
            <a href="https://en.wikipedia.org/wiki/Root-finding_algorithms" target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 8 }}>
              Docs ↗
            </a>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Left sidebar — controls */}
        <aside className="sidebar">
          {/* Function input */}
          <section className="card">
            <div className="card-title">Function</div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label>f(x) =</label>
                  <input
                    type="text"
                    value={rf.funcExpr}
                    onChange={e => rf.setFuncExpr(e.target.value)}
                    placeholder="e.g. x^3 - x - 2"
                    style={{ fontFamily: 'var(--mono)' }}
                  />
                </div>
                <div style={{ paddingTop: 23 }}>
                  <button onClick={() => setShowPresets(v => !v)} style={{ padding: '7px 10px', fontSize: 12 }}>
                    ☰
                  </button>
                </div>
              </div>
              {showPresets && (
                <div className="presets-dropdown">
                  {PRESET_FUNCTIONS.map(p => (
                    <button key={p.expr} className="preset-item" onClick={() => applyPreset(p)}>
                      f(x) = {p.label}
                    </button>
                  ))}
                </div>
              )}
              {rf.funcError && (
                <div className="error-badge">{rf.funcError}</div>
              )}
            </div>
          </section>

          {/* Algorithm selector */}
          <section className="card">
            <div className="card-title">Algorithm</div>
            <div className="algo-grid">
              {algEntries.map(([key, alg]) => (
                <button
                  key={key}
                  className={`algo-btn ${rf.algKey === key ? 'active' : ''}`}
                  style={{ '--alg-color': alg.color }}
                  onClick={() => { rf.setAlgKey(key); rf.reset() }}
                >
                  <div className="algo-dot" />
                  <span>{alg.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Parameters */}
          <section className="card">
            <div className="card-title">Parameters</div>
            <div className="param-grid">
              {(rf.algKey === 'bisection' || rf.algKey === 'regulafalsi') ? (
                <>
                  <div>
                    <label>a (left bound)</label>
                    <input type="number" value={rf.inputs.a} step="0.1"
                      onChange={e => rf.setInputs(p => ({ ...p, a: e.target.value }))} />
                  </div>
                  <div>
                    <label>b (right bound)</label>
                    <input type="number" value={rf.inputs.b} step="0.1"
                      onChange={e => rf.setInputs(p => ({ ...p, b: e.target.value }))} />
                  </div>
                </>
              ) : rf.algKey === 'newton' ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>x₀ (initial guess)</label>
                  <input type="number" value={rf.inputs.x0} step="0.1"
                    onChange={e => rf.setInputs(p => ({ ...p, x0: e.target.value }))} />
                </div>
              ) : (
                <>
                  <div>
                    <label>x₀</label>
                    <input type="number" value={rf.inputs.x0} step="0.1"
                      onChange={e => rf.setInputs(p => ({ ...p, x0: e.target.value }))} />
                  </div>
                  <div>
                    <label>x₁</label>
                    <input type="number" value={rf.inputs.x1} step="0.1"
                      onChange={e => rf.setInputs(p => ({ ...p, x1: e.target.value }))} />
                  </div>
                </>
              )}
              <div>
                <label>Tolerance</label>
                <input type="number" value={rf.inputs.tol} step="0.000001"
                  onChange={e => rf.setInputs(p => ({ ...p, tol: e.target.value }))} />
              </div>
              <div>
                <label>Max Iterations</label>
                <input type="number" value={rf.inputs.maxIter} min="1" max="200"
                  onChange={e => rf.setInputs(p => ({ ...p, maxIter: e.target.value }))} />
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="card">
            <div className="card-title">Controls</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              <button onClick={rf.reset}>↺ Reset</button>
              <button
                className="primary"
                onClick={rf.step}
                disabled={rf.status === 'converged' || rf.status === 'failed'}
              >
                Step →
              </button>
              <button
                className={rf.isAuto ? 'primary' : ''}
                style={{ gridColumn: '1 / -1' }}
                onClick={rf.toggleAuto}
                disabled={rf.status === 'converged' || rf.status === 'failed'}
              >
                {rf.isAuto ? '⏸ Pause' : '▶ Run Auto'}
              </button>
            </div>
            <div>
              <label>Speed</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Slow</span>
                <input type="range" min="100" max="1400" defaultValue="600"
                  onChange={e => { speedRef.current = 1500 - parseInt(e.target.value); rf.setSpeed(speedRef.current) }}
                  style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Fast</span>
              </div>
            </div>
          </section>

          {/* Status */}
          <div className="status-bar">
            <div className="status-dot" style={{ background: statusColor }} />
            <span style={{ fontSize: 12, color: statusColor, fontFamily: 'var(--mono)' }}>
              {rf.message || 'Ready'}
            </span>
          </div>
        </aside>

        {/* Right — visualization */}
        <div className="viz-area">
          {/* Stats row */}
          <div className="stats-row">
            {[
              { label: 'Iteration', value: rf.iterations.length },
              { label: 'Current x', value: rf.iterations.length ? rf.iterations[rf.iterations.length - 1].x.toFixed(8) : '—' },
              { label: 'f(x)', value: rf.iterations.length ? rf.iterations[rf.iterations.length - 1].fx.toExponential(4) : '—' },
              { label: 'Error', value: rf.iterations.length ? rf.iterations[rf.iterations.length - 1].error.toExponential(4) : '—' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Plot */}
          <div className="plot-card">
            <FunctionPlot
              parseFunc={rf.parseFunc}
              funcExpr={rf.funcExpr}
              algKey={rf.algKey}
              iterations={rf.iterations}
              algState={rf.algState || rf.inputs}
              inputs={rf.inputs}
            />
          </div>

          {/* Bottom tabs */}
          <div className="bottom-card">
            <div className="tabs">
              {['table', 'error', 'info'].map(t => (
                <button
                  key={t}
                  className={`tab-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                   style={{ fontSize: 14, color: 'var(--text1)' }}
                >
                  {t === 'table' ? '📋 Iteration Table' : t === 'error' ? '📉 Error Chart' : 'ℹ️ Algorithm Info'}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {tab === 'table' && <IterationTable iterations={rf.iterations} status={rf.status} />}
              {tab === 'error' && <ErrorChart iterations={rf.iterations} />}
              {tab === 'info' && <AlgoInfo algKey={rf.algKey} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
