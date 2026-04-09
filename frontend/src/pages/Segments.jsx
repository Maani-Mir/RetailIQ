import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid
} from 'recharts'

const API = 'http://localhost:8000'

const COLORS = {
  Champions: '#10b981', Loyal: '#3b82f6',
  'At Risk': '#f59e0b', Lost: '#ef4444'
}

export default function Segments() {
  const [data, setData] = useState(null)

  useEffect(() => { axios.get(`${API}/segments`).then(r => setData(r.data)) }, [])

  if (!data) return <p style={{ color: '#6b7280' }}>Loading segments...</p>

  const grouped = {}
  data.points.forEach(p => {
    if (!grouped[p.segment]) grouped[p.segment] = []
    grouped[p.segment].push(p)
  })

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Customer Segments</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>
        K-Means clustering on RFM features, visualised with PCA
      </p>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Cluster map</h2>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" name="PCA 1" tick={{ fontSize: 12 }} label={{ value: 'PCA 1', position: 'insideBottom', offset: -4, fontSize: 12 }} />
            <YAxis dataKey="y" name="PCA 2" tick={{ fontSize: 12 }} label={{ value: 'PCA 2', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                  <p style={{ fontWeight: 600, color: COLORS[d.segment] }}>{d.segment}</p>
                  <p>Recency: {d.recency} days</p>
                  <p>Frequency: {d.frequency} orders</p>
                  <p>Value: £{d.monetary}</p>
                </div>
              )
            }} />
            <Legend />
            {Object.entries(grouped).map(([seg, pts]) => (
              <Scatter key={seg} name={seg} data={pts} fill={COLORS[seg]} opacity={0.7} r={3} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Segment profiles</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.profiles}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg_monetary" name="Avg value (£)" fill="#4f46e5" radius={[4,4,0,0]} />
            <Bar dataKey="avg_frequency" name="Avg orders" fill="#0ea5e9" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}