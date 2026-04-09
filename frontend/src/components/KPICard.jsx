export default function KPICard({ label, value, sub, color = '#4f46e5' }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '20px 24px', borderTop: `4px solid ${color}`
    }}>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}