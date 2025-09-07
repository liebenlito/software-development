import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

/**
 * props:
 *  - hist: { counts: number[], bin_edges: number[] }
 *  - title?: string
 */
export default function ChartHistogram({ hist, title = 'Histogram' }) {
  const counts = Array.isArray(hist?.counts) ? hist.counts : []
  const edges = Array.isArray(hist?.bin_edges) ? hist.bin_edges : []

  const labels = useMemo(() => {
    if (!edges?.length || counts.length === 0) return []
    // label pakai midpoint tiap bin
    const mids = []
    for (let i = 0; i < counts.length; i++) {
      const a = edges[i]
      const b = edges[i + 1]
      const mid = (Number(a) + Number(b)) / 2
      mids.push(Number.isFinite(mid) ? mid.toFixed(2) : `${a}-${b}`)
    }
    return mids
  }, [counts, edges])

  const data = {
    labels,
    datasets: [
      {
        label: 'Frequency',
        data: counts,
        backgroundColor: '#1f71be80'
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: title },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Count: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Bins (midpoint)' } },
      y: { title: { display: true, text: 'Frekuensi' }, beginAtZero: true, ticks: { precision: 0 } },
    },
  }

  if (!hist || !Array.isArray(hist.counts) || hist.counts.length === 0) return <p>(Histogram tidak tersedia)</p>
  
  return <Bar data={data} options={options} />
}
