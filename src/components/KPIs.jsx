import React from 'react'
import s from './KPIs.module.css'

const KPIS = [
  { key: 'leftForBudget', label: 'Left for Budgeting', accent: 'var(--teal)' },
  { key: 'totalBudgeted', label: 'Total Budgeted', accent: 'var(--blue)' },
  { key: 'leftToSpend', label: 'Left to Spend', accent: 'var(--green)' },
  { key: 'totalSpent', label: 'Total Spent', accent: 'var(--red)' },
  { key: 'endingBal', label: 'Ending Balance', accent: 'var(--gold)' },
  { key: 'netFlow', label: 'Net Cash Flow', accent: 'var(--purple)' },
]

export default function KPIs({ budget, fmt }) {
  const t = budget.totals
  return (
    <div className={s.grid}>
      {KPIS.map(k => (
        <div key={k.key} className={s.card} style={{ '--accent': k.accent }}>
          <div className={s.label}>{k.label}</div>
          <div className={s.val}>{fmt(t[k.key])}</div>
        </div>
      ))}
    </div>
  )
}
