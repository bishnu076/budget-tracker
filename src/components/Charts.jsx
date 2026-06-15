import React from 'react'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js'
import s from './Charts.module.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)
ChartJS.defaults.color = '#9AA7BD'
ChartJS.defaults.font.family = 'Inter'
ChartJS.defaults.font.size = 11

const HEX = { income: '#34D399', expenses: '#F87171', bills: '#60A5FA', debts: '#FBBF24', savings: '#2DD4BF' }

export default function Charts({ budget, fmt }) {
  const { totals, days, data } = budget
  const { inc, exp, bil, deb, sav } = totals

  const cats = ['Income', 'Expenses', 'Bills', 'Debts', 'Savings']
  const colors = Object.values(HEX)
  const actuals = [inc.a, exp.a, bil.a, deb.a, sav.a]
  const budgets = [inc.b, exp.b, bil.b, deb.b, sav.b]
  const donutData = actuals.some(v => v > 0) ? actuals : budgets

  const donut = { labels: cats, datasets: [{ data: donutData, backgroundColor: colors, borderColor: '#16223B', borderWidth: 3, hoverOffset: 8 }] }
  const bar = { labels: cats, datasets: [{ label: 'Budget', data: budgets, backgroundColor: '#3B82F688', borderColor: '#3B82F6', borderWidth: 1, borderRadius: 4 }, { label: 'Actual', data: actuals, backgroundColor: '#34D39988', borderColor: '#34D399', borderWidth: 1, borderRadius: 4 }] }

  // balance line
  const T = days.totalDays, sb = parseFloat(data.startBalance) || 0
  const spent = exp.a + bil.a + deb.a + sav.a
  const flow = inc.a - spent
  const step = Math.max(1, Math.round(T / 10))
  const pts = []
  for (let d = 0; d <= T; d += step) pts.push({ x: `Day ${d}`, y: Math.round(sb + flow * (d / T)) })
  if (pts[pts.length - 1].x !== `Day ${T}`) pts.push({ x: `Day ${T}`, y: Math.round(sb + flow) })

  const line = { labels: pts.map(p => p.x), datasets: [{ data: pts.map(p => p.y), borderColor: '#2DD4BF', backgroundColor: 'rgba(45,212,191,.12)', fill: true, tension: .35, pointRadius: 2, pointHoverRadius: 5 }] }

  const baseOpts = { maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10, padding: 10 } } } }
  const moneyY = { scales: { y: { grid: { color: 'rgba(154,167,189,.1)' }, ticks: { callback: v => (v >= 1000 ? fmt(v).replace(/,\d{3}$/, 'k') : fmt(v)) } }, x: { grid: { display: false } } } }

  return (
    <div className={s.grid}>
      <div className={s.panel}>
        <h2 className={s.h}>Cash flow summary</h2>
        <div className={s.box}><Doughnut data={donut} options={{ ...baseOpts, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } } } }} /></div>
      </div>
      <div className={s.panel}>
        <h2 className={s.h}>Budget vs actual</h2>
        <div className={s.box}><Bar data={bar} options={{ ...baseOpts, ...moneyY }} /></div>
      </div>
      <div className={s.panel}>
        <h2 className={s.h}>Balance overview</h2>
        <div className={s.box}><Line data={line} options={{ ...baseOpts, plugins: { legend: { display: false } }, ...moneyY }} /></div>
      </div>
    </div>
  )
}
