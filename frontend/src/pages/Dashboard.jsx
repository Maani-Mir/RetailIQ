import { useEffect, useState } from 'react'
import axios from 'axios'
import KPICard from '../components/KPICard'

const API = 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { axios.get(`${API}/stats`).then(r => setStats(r.data)) }, [])

  if (!stats) return <p style={{ color: '#6b7280' }}>Loading...</p>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>
        Overview of your customer base
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <KPICard label="Total customers" value={stats.total_customers.toLocaleString()} color="#4f46e5" />
        <KPICard label="Segments found" value={stats.segments} color="#0ea5e9" />
        <KPICard label="Champions" value={stats.champions.toLocaleString()} sub="High value, loyal" color="#10b981" />
        <KPICard label="At risk" value={stats.at_risk.toLocaleString()} sub="Need re-engagement" color="#f59e0b" />
        <KPICard label="Lost" value={stats.lost.toLocaleString()} sub="Churned customers" color="#ef4444" />
        <KPICard label="Avg order value" value={`£${stats.avg_order_value}`} color="#8b5cf6" />
      </div>
    </div>
  )
}