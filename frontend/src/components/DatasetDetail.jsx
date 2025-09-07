import React, { useEffect, useState, useMemo } from "react"
// import Histogram from "./Histogram"
import ChartHistogram from "./ChartHistogram"

const API_BASE = import.meta.env.VITE_API_BASE

export default function DatasetDetail({ id, onClose}) {
    const [data, setData] = useState(null)
    const [err, setErr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedCol, setSelectedCol] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/datasets/${id}`)
                if (!res.ok) throw new Error('Gagal mengambil detail dataset')
                const d = await res.json()
                setData(d)
            } catch (e) { 
                setErr(e.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const defaultCol = useMemo(() => {
        if (!data || !data.numeric_columns || data.numeric_columns.length === 0) return null
        const stats = data.stats || {}

        // Cari kolom dengan count terbesar
        let best = data.numeric_columns[0]
        let bestCount = (stats[best]?.count ?? 0)
        for (const c of data.numeric_columns) {
            const cnt = (stats[c]?.count ?? 0)
            if (cnt > bestCount) {
                best = c
                bestCount = cnt
            }
        }
        return best
    }, [data])

    useEffect(() => {
        if (defaultCol && !selectedCol) {
            setSelectedCol(defaultCol)
        }
    }, [defaultCol, selectedCol])

    if (loading) return <p>Memuat detail...</p>
    if (err) return <p style={{color: 'red'}}>Error: {err}</p>
    if (!data) return null

    const preview = data.preview_rows || []
    const columns = preview.length > 0 ? Object.keys(preview[0]) : []

    const numericCols = data.numeric_columns || []
    const stats = data.stats || {}
    const curr = selectedCol ? stats[selectedCol] : null

    return (
        <div style={{border:'1px solid #bbb', borderRadius:12, padding:16, marginTop:12, background:'#fafafa'}}>
            <div>
                <h3 style={{margin:0}}>Detail Dataset #{data.id} - {data.filename}</h3>
                <button onClick={onClose}>Tutup</button>
            </div>
            <p style={{margin: '8px 0'}}>Baris: {data.n_rows}, Kolom: {data.n_cols}</p>
            
            <details>
                <summary><strong>Preview Data</strong></summary>
                {preview.length === 0 ? (
                    <p>(Tidak ada preview)</p>
                ) : (
                    <div style={{overflowX:'auto', marginTop:8}}>
                        <table style={{borderCollapse:'collapse', width:'100%'}}>
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th key={col} style={{border:'1px solid #ddd', padding:8, textAlign:'left'}}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, idx) => (
                                    <tr key={idx}>
                                        {columns.map(col => (
                                            <td key={col} style={{border:'1px solid #eee', padding:8}}>
                                                {String(row[col])}
                                            </td>
                                        ))}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </details>

            <div style={{marginTop:16}}>
                <strong>Pilih kolom untuk menampilkan statistik & historgram:</strong><br />
                <select 
                    value={selectedCol || ''}
                    onChange={(e) => setSelectedCol(e.target.value)}
                    style={{marginTop:8}}
                >
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {selectedCol && curr && (
                <div style={{marginTop:12}}>
                    <h4 style={{margin:'8px 0'}}>Statistik: {selectedCol}</h4>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8}}>
                        <Stat label="count" value={curr.count} />
                        <Stat label="mean" value={curr.mean} />
                        <Stat label="std" value={curr.std} />
                        <Stat label="min" value={curr.min} />
                        <Stat label="Q1" value={curr.q1} />
                        <Stat label="median" value={curr.median} />
                        <Stat label="Q3" value={curr.q3} />
                        <Stat label="max" value={curr.max} />
                        <Stat label="skew" value={curr.skew} />
                        <Stat label="kurtosis" value={curr.kurtosis} />
                    </div>

                    {/* <div style={{marginTop:12}}>
                        <h4 style={{margin:'8px 0'}}></h4>
                        <Histogram hist={curr.hist} height={140} />
                    </div> */}

                    {/* chart.js */}
                    <div style={{marginTop:16}}>
                        <ChartHistogram hist={curr.hist} title={`Histogram - ${selectedCol}`} />
                    </div>

                </div>
            )}

            <details style={{marginTop:12}}>
                <summary><strong>JSON stats data</strong></summary>
                <pre style={{background:'#fff', padding:12, borderRadius:8, overflowX:'auto'}}>
                    {JSON.stringify(stats, null, 2)}
                </pre>
            </details>
        </div>
    )
}

function Stat({ label, value}) {
    const v = (value === null || value === undefined) ? '-' : 
              (typeof value === 'number' ? Number(value).toFixed(2) : String(value))
    
    return (
        <div style={{border:'1px solid #ddd', borderRadius:8, padding:8, background:'#fff'}}>
            <div style={{fontSize:12, color:'#666'}}>{label}</div>
            <div style={{fontWeight:600}}>{v}</div>
        </div>
    )
}