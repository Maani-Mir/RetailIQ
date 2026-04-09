import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const API = 'http://localhost:8000'
const COLORS = { Champions: '#10b981', Loyal: '#3b82f6', 'At Risk': '#f59e0b', Lost: '#ef4444' }

export default function Insights() {
  const [data, setData] = useState(null)

  useEffect(() => { axios.get(`${API}/insights`).then(r => setData(r.data)) }, [])

  if (!data) return <p style={{ color: '#6b7280' }}>Loading insights...</p>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Segment Insights</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>
        Average review sentiment broken down by customer segment
      </p>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.insights}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="segment" tick={{ fontSize: 13 }} />
            <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [v.toFixed(3), 'Avg sentiment']} />
            <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={2} />
            <Bar dataKey="avg_sentiment" name="Avg sentiment" radius={[6, 6, 0, 0]}
              fill="#4f46e5"
              label={{ position: 'top', fontSize: 12, formatter: v => v.toFixed(2) }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {data.insights.map(seg => (
          <div key={seg.segment} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
            padding: 20, borderLeft: `4px solid ${COLORS[seg.segment]}`
          }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: COLORS[seg.segment], marginBottom: 4 }}>
              {seg.segment}
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              {seg.customer_count.toLocaleString()} customers
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
              {seg.avg_sentiment > 0 ? '+' : ''}{seg.avg_sentiment}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>avg sentiment score</p>
          </div>
        ))}
      </div>
    </div>
  )
}