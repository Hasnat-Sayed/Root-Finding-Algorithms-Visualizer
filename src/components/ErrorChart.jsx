import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function safeLog(v) {
  if (!v || v <= 0) return null
  return parseFloat(Math.log10(v).toFixed(4))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--mono)'
    }}>
      <div style={{ color: 'var(--text2)', marginBottom: 2 }}>Iteration {label}</div>
      <div style={{ color: '#a78bfa' }}>log₁₀(error) = {payload[0]?.value?.toFixed(4)}</div>
    </div>
  )
}

export default function ErrorChart({ iterations }) {
  if (iterations.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20, color: 'var(--text1)', fontSize: 16 }}>
        Run at least 2 iterations to see error convergence
      </div>
    )
  }

  const data = iterations.map(it => ({
    n: it.n,
    logError: safeLog(it.error)
  })).filter(d => d.logError !== null)


  console.log("Iterations:", iterations)
console.log("Chart data:", data)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="n"
          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--mono)' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
          label={{ value: 'Iteration', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--mono)' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'log₁₀(err)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="logError"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ fill: '#a78bfa', strokeWidth: 0, r: 3 }}
          activeDot={{ fill: '#c4b5fd', r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
