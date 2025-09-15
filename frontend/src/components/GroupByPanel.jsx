import React, { useMemo, useState} from "react";

const API_BASE = import.meta.VITE_API_BASE

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

            const res = await fetch(`${API_BASE}/api/v1/datasets/${datasetID}/groupby?` + params.toString())
            if (!res.ok) {
                const msg = await res.text().catch(() => 'Gagal mengambil data')
                throw new Error(msg)
            }

            const data = await res.json()
            setResult(data)
        } catch(e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const rows = result.rows || []
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
        <div>
            <h3></h3>


            {/* Pilih kolom kategorik */}
            <div>

            </div>

            {/* pilihan */}
            <div>

            </div>

            {/* Hasil */}
            <div>
                <div>

                </div>
            </div>
        </div>
    )
}