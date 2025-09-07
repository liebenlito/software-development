import React from 'react'
import UploadCSV from './components/UploadCSV'
import DatasetList from './components/DatasetList'

export default function App() {
  return (
    <div style={{fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 960, margin: '0 auto'}}>
      <h1>📊 Statistik Data (FastAPI + React)</h1>
      <p>Unggah CSV, hitung statistik dasar (mean, median, std, min, max), dan simpan metadata ke MySQL.</p>
      <UploadCSV />
      <hr style={{margin: '24px 0'}} />
      <DatasetList />
    </div>
  )
}
