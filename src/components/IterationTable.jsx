import { useRef, useEffect } from 'react'

export default function IterationTable({ iterations, status }) {
  const tbodyRef = useRef(null)

  useEffect(() => {
    if (tbodyRef.current) {
      tbodyRef.current.parentElement.parentElement.scrollTop = tbodyRef.current.parentElement.parentElement.scrollHeight
    }
  }, [iterations.length])

  if (!iterations.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text3)', fontSize: 12 }}>
        No iterations yet
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '100%' }}>
      <table>
        <thead>
          <tr>
            <th>n</th>
            <th>x</th>
            <th>f(x)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {iterations.map((row, idx) => (
            <tr
              key={row.n}
              className={
                status === 'converged' && idx === iterations.length - 1
                  ? 'converged'
                  : idx === iterations.length - 1
                  ? 'latest'
                  : ''
              }
            >
              <td style={{ color: 'var(--text3)' }}>{row.n}</td>
              <td style={{ color: 'var(--accent3)' }}>{row.x.toFixed(10)}</td>
              <td style={{ color: Math.abs(row.fx) < 0.001 ? '#22c55e' : 'var(--text)' }}>
                {row.fx.toExponential(4)}
              </td>
              <td style={{ color: row.error < 1e-6 ? '#22c55e' : 'var(--orange2)' }}>
                {row.error.toExponential(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
