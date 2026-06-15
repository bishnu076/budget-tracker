import React from 'react'
import s from './SummaryTable.module.css'

const HEX = { Income: '#34D399', Expenses: '#F87171', Bills: '#60A5FA', Debts: '#FBBF24', Savings: '#2DD4BF' }

export default function SummaryTable({ budget, fmt }) {
  const { inc, exp, bil, deb, sav } = budget.totals
  const rows = [['Income', inc.b, inc.a], ['Expenses', exp.b, exp.a], ['Bills', bil.b, bil.a], ['Debts', deb.b, deb.a], ['Savings', sav.b, sav.a]]
  return (
    <div className={s.panel}>
      <h2 className={s.h}>Summary — budget vs actual</h2>
      <table className={s.tbl}>
        <thead><tr><th>Group</th><th>Budget</th><th>Actual</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r[0]}>
              <td><span className={s.dot} style={{ background: HEX[r[0]] }} />{r[0]}</td>
              <td className={s.num}>{fmt(r[1])}</td>
              <td className={s.num} style={{ color: 'var(--green)' }}>{fmt(r[2])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
