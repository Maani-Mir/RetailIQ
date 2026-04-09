import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/segments', label: 'Segments' },
  { to: '/sentiment', label: 'Sentiment Analyzer' },
  { to: '/insights', label: 'Segment Insights' },
]

export default function Navbar() {
  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #e5e7eb',
      padding: '0 32px', display: 'flex', alignItems: 'center', gap: 8, height: 56
    }}>
      <span style={{ fontWeight: 700, fontSize: 16, marginRight: 24, color: '#4f46e5' }}>
        RetailIQ
      </span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
          padding: '6px 14px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? '#4f46e5' : '#6b7280',
          background: isActive ? '#eef2ff' : 'transparent'
        })}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}