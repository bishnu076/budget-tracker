import React from 'react'
import s from './Rule5020.module.css'

export default function Rule5020({ budget, fmt }) {
  const { split, totals } = budget
  const { needs, wants, saveDebt, t5020, savingsRate } = split
  const { incomeRef } = totals

  const rows = [
    { label: 'Needs  (rent, bills, min. debt)', target: t5020.needs, actual: needs, color: 'var(--blue)', pct: 50 },
    { label: 'Wants  (everyday spending)', target: t5020.wants, actual: wants, color: 'var(--red)', pct: 30 },
    { label: 'Save + debt payoff', target: t5020.save, actual: saveDebt, color: 'var(--green)', pct: 20 },
  ]
  const total = needs + wants + saveDebt || 1
  return (
    <div className={s.panel}>
      <h2 className={s.h}>How to split your income — 50 / 30 / 20</h2>
      <p className={s.sub}>Based on income of <b>{fmt(incomeRef)}</b>. Actual vs ideal:</p>
      <div className={s.bar}>
        {rows.map(r => <span key={r.label} style={{ width: `${r.pct}%`, background: r.color }} />)}
      </div>
      <div className={s.legend}>
        {rows.map(r => <span key={r.label}><i style={{ background: r.color }} />{r.pct}%</span>)}
      </div>
      <table className={s.tbl}>
        <thead><tr><th>Bucket</th><th>Target</th><th>Yours</th></tr></thead>
        <tbody>
          {rows.map(r => {
            const over = r.actual > r.target * 1.05
            const col = over ? 'var(--red)' : r.actual <= r.target ? 'var(--green)' : 'var(--gold)'
            return (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className={s.num}>{fmt(r.target)}</td>
                <td className={s.num} style={{ color: col }}>{fmt(r.actual)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className={s.rate}>Savings rate: <b style={{ color: savingsRate >= 20 ? 'var(--green)' : savingsRate >= 10 ? 'var(--gold)' : 'var(--red)' }}>{savingsRate.toFixed(1)}%</b> &nbsp;(target ≥ 20%)</div>
    </div>
  )
}
