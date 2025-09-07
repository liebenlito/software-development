import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function UploadCSV() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/api/v1/datasets/upload`, {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || 'Upload failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>1) Unggah CSV</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || loading} style={{marginLeft: 8}}>
          {loading ? 'Mengunggah...' : 'Upload'}
        </button>
      </form>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}

      {result && (
        <div style={{marginTop: 16}}>
          <h3>Berhasil diunggah: {result.filename}</h3>
          <p>Baris: {result.n_rows}, Kolom: {result.n_cols}</p>
          <details>
            <summary>Lihat statistik</summary>
            <pre style={{background:'#f7f7f7', padding: 12, borderRadius: 6}}>
{JSON.stringify(result.stats, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
