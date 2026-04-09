import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

const SAMPLES = [
  "Absolutely love this store, fast delivery and great quality!",
  "Product was okay but shipping took forever and support never replied.",
  "Terrible experience. Item broke after one day. Never ordering again.",
]

export default function SentimentAnalyzer() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async (t) => {
    const input = t || text
    if (!input.trim()) return
    setLoading(true)
    const res = await axios.post(`${API}/sentiment`, { text: input })
    setResult(res.data)
    setText(input)
    setLoading(false)
  }

  const labelColor = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Sentiment Analyzer</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>
        Paste any customer review and get an instant sentiment breakdown
      </p>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a customer review here..."
          rows={4}
          style={{
            width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '12px 14px', fontSize: 14, resize: 'vertical',
            fontFamily: 'inherit', outline: 'none', marginBottom: 12
          }}
        />
        <button onClick={() => analyze()} disabled={loading} style={{
          background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Try a sample:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => analyze(s)} style={{
            background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, textAlign: 'left', cursor: 'pointer', color: '#374151'
          }}>"{s}"</button>
        ))}
      </div>

      {result && (
        <div style={{ background: '#fff', border: `2px solid ${labelColor[result.label]}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{
              background: labelColor[result.label], color: '#fff',
              borderRadius: 8, padding: '4px 16px', fontWeight: 700, fontSize: 18
            }}>{result.label}</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              Compound score: <strong>{result.compound}</strong>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[['Positive', result.positive, '#10b981'], ['Neutral', result.neutral, '#6b7280'], ['Negative', result.negative, '#ef4444']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{l}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}