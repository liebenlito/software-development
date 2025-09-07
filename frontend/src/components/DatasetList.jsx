import React, { useEffect, useState, useMemo } from 'react'
import DatasetDetail from './DatasetDetail'

const API_BASE = import.meta.env.VITE_API_BASE

export default function DatasetList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/datasets`)
        if (!res.ok) throw new Error('Failed to fetch datasets')
        const data = await res.json()
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total/pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const prevPage = () => setPage(p => Math.max(1, p - 1))
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1))

  if (loading) return <p>Memuat daftar dataset...</p>
  if (error) return <p style={{color:'red'}}>Error: {error}</p>

  return (
    <div>
      <h2>Riwayat Dataset</h2>

      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <button onClick={prevPage} disabled={page<=1}>Back</button>
        <button onClick={nextPage} disabled={page>=totalPages}>Next</button>
        <span style={{fontSize:12, color:'#666'}}>Halaman {page}/{totalPages} Total {total} item</span>
        <label style={{marginLeft:'auto', fontSize:12}}>
          Ukuran Baris:{' '}
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1)}}>
            {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {pageItems.length === 0 && <p>Belum ada dataset.</p>}
      {pageItems.map((item) => (
        <div key={item.id} style={{border:'1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12}}>
          <strong>#{item.id} — {item.filename}</strong>
          <div>Baris: {item.n_rows}, Kolom: {item.n_cols}</div>
          {item.numeric_columns?.length > 0 && (
            <div>Kolom numerik: {item.numeric_columns.join(', ')}</div>
          )}

          <div style={{marginTop:8}}>
            {openId === item.id ? (
              <>
                <DatasetDetail id={item.id} onClose={() => setOpenId(null)} />
              </>
            ) : (
              <button onClick={() => setOpenId(item.id)}>Lihat Detail</button>
            )}
          </div> 
        </div>
      ))}
    </div>
  )
}
