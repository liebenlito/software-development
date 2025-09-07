import React from "react"

export default function Histogram({ hist, height = 120}) {
    if (!hist || !Array.isArray(hist.counts) || hist.counts.length === 0) return <p>(Histogram tidak tersedia)</p>

    const counts = hist.counts
    const edges = hist.bin_edges
    if (counts.length === 0 || edges.length === 0) return <p>(Histogram kosong)</p>

    const maxCount = Math.max(...counts, 1)
    const bar = counts.map((c, i) => {
        const h = Math.round((c / maxCount) * height)
        return (
            <div key={i} style={{
                display: 'inline-block',
                width: `${100 / counts.length}%`,
                height,
                verticalAlign: 'bottom',
                padding: '0 2px',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    height: h,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    background: '#e0e0e0'
                }} title={`bin ${i+1}: ${c}`} />

            </div>
        )
    })

    const min = edges[0]
    const max = edges[edges.length - 1]

    return(
        <div>
            <div style={{display:'flex', gap:8, fontSize:12, marginBottom:6}}>
                <span>min: {Number.isFinite(min) ? min.toFixed(3) : String(min)}</span>
                <span>max: {Number.isFinite(max) ? min.toFixed(3) : String(max)}</span>
                <span>bins: {counts}</span>
            </div>
            <div style={{border:'1px solid #ddd', borderRadius:8, padding:6}}>
                {bar}
            </div>
        </div>
        
    )
}

