import { ALGORITHMS } from '../algorithms/index.js'

export default function AlgoInfo({ algKey }) {
  const alg = ALGORITHMS[algKey]
  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: alg.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{alg.name}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>
        {alg.description}
      </p>
      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Formula</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent3)' }}>{alg.formula}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
        <span style={{ color: 'var(--text2)', fontWeight: 500 }}>Convergence: </span>{alg.convergence}
      </div>
    </div>
  )
}
