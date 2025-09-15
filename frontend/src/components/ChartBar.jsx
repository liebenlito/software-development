import React, { useMemo } from "react";
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ChartBar({ labels = [], values = [], height = 220, title = ''}) {
    const data = useMemo(() => ({
        labels,
        datasets: [
            {
                label: 'Jumlah',
                data: values,
                backgroundColor: '#1f71be80',
            },
        ],
    }), [labels, values])

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false},
            title: {  display: !!title, text: title},
            tooltip: { intersect: false, mode: 'index'},
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    callback: (v, i) => {
                        const label = labels[i] ?? ''
                        return String(label).length > 16 ? String.label.slice(0, 16) + '...' : label
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: { precision: 0},
            },
        },
    }), [labels, title])

    return (
        <div style={{ height }}>
            <Bar data={data} options={options} />
        </div>
    )
}