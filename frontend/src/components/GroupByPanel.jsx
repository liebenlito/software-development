import React, { useMemo, useState } from "react"
import ChartBar from "./ChartBar"

const API_BASE = import.meta.env.VITE_API_BASE

export default function GroupByPanel({ datasetID, categoricalCols = [] }) {
    const [selected, setSelected] = useState([])
    const [sort, setSort] = useState('count:desc')
    const [limit, setLimit] = useState(20)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)

    const toggle = (col) => {
        setSelected((prev) =>
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        )
    }

    const canRun = useMemo(() => selected.length > 0, [selected])

    const run = async () => {
        if (!canRun) return
        setLoading(true); setError(null)
        try {
            const params = new URLSearchParams()
            selected.forEach(by => params.append('by', by))
            params.set('limit', String(limit))
            params.set('sort', sort)

            const url = `${API_BASE}/api/v1/datasets/${datasetID}/groupby?` + params.toString()
            // console.log(url) 
            const res = await fetch(url)
            if (!res.ok) {
                const msg = await res.text().catch(() => 'Gagal mengambil data')
                throw new Error(msg)
            }

            const data = await res.json()
            setResult(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const rows = result?.rows || []
    const isSingle = selected.length === 1
    const groupCol = isSingle ? selected[0] : null

    const chartData = useMemo(() => {
        if (!isSingle) return []
        return rows.map(r => ({
            label: r[groupCol] ?? '(null)',
            count: r.count ?? 0
        }))
    }, [rows, isSingle, groupCol])

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Kategori</h3>
            {/* Pilih kolom kategorik */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                {categoricalCols.length === 0 && <em>Tidak ada kolom kategorik.</em>}
                {categoricalCols.map(col => (
                    <label key={col} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #eee',
                        borderRadius: 8,
                        padding: '6px 10px',
                        background: '#fff'
                    }}><input type="checkbox" checked={selected.includes(col)} onChange={() => toggle(col)} />{col}</label>
                ))}
            </div>

            {/* pilihan */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
                <label>Urutan:</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="count:desc">Descending</option>
                    <option value="count:asc">Ascending</option>
                </select>

                <label>Limit:</label>
                <input type="number" min={1} max={10000} value={limit} onChange={(e) => setLimit(Math.max(1, Math.min(10000, Number(e.target.value) || 20)))} />

                <button onClick={run} disabled={!canRun || loading}>
                    {loading ? 'Menghitung...' : 'Jalankan GroupBy'}
                </button>
            </div>

            {error && (
                <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>Error: {error}</p>
            )}

            {/* Hasil */}
            {result && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                        <strong>Berdasarkan:</strong> {result.by?.join(' , ') || '-'}
                        <strong>Total Grup:</strong> {result.total_groups ?? rows.length}
                    </div>

                    {isSingle && chartData.length > 0 && (
                        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10, marginBottom: 12, background: '#fff' }}>
                            <strong>Bar Chart -- {groupCol}</strong>
                            <ChartBar
                                labels={chartData.map(d => String(d.label ?? '(null)'))}
                                values={chartData.map(d => Number(d.count ?? 0))}
                                height={260}
                                title={`Distribusi ${groupCol}`}
                            />
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    {selected.map(col => (
                                        <th key={col} style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>{col}</th>
                                    ))}
                                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, idx) => (
                                    <tr key={idx}>
                                        {selected.map(col => (
                                            <td key={col} style={{ border: '1px solid #eee', padding: 8 }}>
                                                {String(r[col])}
                                            </td>
                                        ))}
                                        <td style={{ border: '1px solid #eee', padding: 8, textAlign: 'right' }}>{r.count}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={selected.length + 1} style={{ padding: 12, textAlign: 'center', color: '#777' }}>
                                            (Tidak ada data.)
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}