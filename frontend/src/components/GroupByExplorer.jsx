import React, { useState, useMemo, useEffect} from "react";
import GroupByPanel from "./GroupByPanel";

const API_BASE = import.meta.env.VITE_API_BASE

export default function GroupByExplorer() {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedID, setSelectedID] = useState(null)
    const [detail, setDetail] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState(null)

    // Ambil daftar dataset
    useEffect(() => {
        const load = async () => {
            setLoading(true); setError(null)
            try {
                const res = await fetch(`${API_BASE}/api/v1/datasets`)
                if (!res.ok) throw new Error('Gagal memuat dataset')
                const data = await res.json()
                setList(data)

                if (data.length > 0) {
                    const latest = [...data].sort((a,b) => b.id - a.id)[0]
                    setSelectedID(latest.id)
                }
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Jika pilihan ada, ambil dataset id dan detailnya
    useEffect(() => {
        if (!selectedID) {
            setDetail(null)
            return
        }
        const loadDetail = async () => {
            setDetailLoading(true); setDetailError(null)
            try {
                const res = await fetch(`${API_BASE}/api/v1/datasets/${selectedID}`)
                if (!res.ok) throw new Error('Gagal memuat detail dataset')
                const data = await res.json()
                setDetail(data)
            } catch (e) {
                setDetailError(e.message)
            } finally {
                setDetailLoading(false)
            }
        }
        loadDetail()
    }, [selectedID])

    const categoricalCols = useMemo(
        () => detail?.categorical_columns || [],
        [detail]
    )

    return (
        <div style={{border:'1px solid #ddd', borderRadius:12, padding:16, marginTop:16}}>
            <h2 style={{marginTop:0}}>Pilih Dataset</h2>

            {loading ? (
                <p>Memuat daftar dataset...</p>
            ) : error ? (
                <p style={{color:'red'}}>Error: {error}</p>
            ) : (
                <div style={{overflowX:'auto', marginBottom:12}}>
                    <table style={{borderCollapse:'collapse', width:'100%'}}>
                        <thead>
                            <tr>
                                <th style={{border:'1px solid #ddd', padding:8}}>Pilih</th>
                                <th style={{border:'1px solid #ddd', padding:8}}>ID</th>
                                <th style={{border:'1px solid #ddd', padding:8}}>Filename</th>
                                <th style={{border:'1px solid #ddd', padding:8}}>Jumlah Data</th>
                                <th style={{border:'1px solid #ddd', padding:8}}>Kolom Numerik</th>
                                <th style={{border:'1px solid #ddd', padding:8}}>Kolom Kategorik</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map(item => (
                                <tr key={item.id}>
                                    <td style={{border:'1px solid #eee', padding:8, textAlign:'center'}}>
                                        <input 
                                        type='radio' 
                                        name='selectedDataset' 
                                        checked={selectedID === item.id}
                                        onChange={() => setSelectedID(item.id)}
                                        />
                                    </td>
                                    <td style={{border:'1px solid #eee', padding:8}}>{item.id}</td>
                                    <td style={{border:'1px solid #eee', padding:8}}>{item.filename}</td>
                                    <td style={{border:'1px solid #eee', padding:8}}>{item.n_rows}</td>
                                    <td style={{border:'1px solid #eee', padding:8}}>{item.numeric_columns?.length ?? 0}</td>
                                    <td style={{border:'1px solid #eee', padding:8}}>{item.categorical_columns?.length ?? 0}</td>
                                </tr>
                            ))}
                            {list.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{padding:12, textAlign:'center', color:'#777'}}>
                                        (Belum ada dataset.)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedID && (
                <div>
                    <strong>Dataset terpilih:</strong> #{selectedID}
                    {detailLoading && <span>memuat detail...</span>}
                    {detailError && <span style={{color:'red'}}> - {detailError}</span>}
                </div>
            )}
            
            {detail && (
                <GroupByPanel
                    datasetID={detail.id}
                    categoricalCols={categoricalCols}
                />
            )}
        </div>
    )
}