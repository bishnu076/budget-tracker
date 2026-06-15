import React from 'react'
import s from './BudgetTable.module.css'

const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n }

export default function BudgetTable({ sec, label, color, rows, cols, updateRow, addRow, delRow, fmt }) {
  const hasDue = cols.includes('due')
  const hasLeft = cols.includes('left')

  return (
    <div className={s.panel}>
      <div className={s.secTitle} style={{ '--c': color, borderBottomColor: color }}>
        {label}
      </div>
      <div className={s.tableWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th className={s.thl}>{sec === 'income' ? 'Source' : sec === 'bills' ? 'Bill' : sec === 'debts' ? 'Debt' : sec === 'savings' ? 'Goal' : 'Category'}</th>
              {hasDue && <th>Due</th>}
              <th>{sec === 'income' ? 'Expected' : 'Budget'}</th>
              <th>Actual</th>
              {hasLeft && <th>Left</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const left = hasLeft ? num(row.budget) - num(row.actual) : null
              return (
                <tr key={i} className={s.row}>
                  <td>
                    <input
                      className={s.name}
                      value={row.name}
                      placeholder="Name…"
                      onChange={e => updateRow(sec, i, 'name', e.target.value)}
                    />
                  </td>
                  {hasDue && (
                    <td>
                      <input
                        type="date"
                        className={s.date}
                        value={row.due || ''}
                        onChange={e => updateRow(sec, i, 'due', e.target.value)}
                      />
                    </td>
                  )}
                  <td>
                    <input
                      type="number"
                      step="100"
                      className={s.money}
                      value={row.budget || ''}
                      placeholder="0"
                      onChange={e => updateRow(sec, i, 'budget', num(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="100"
                      className={s.money}
                      value={row.actual || ''}
                      placeholder="0"
                      onChange={e => updateRow(sec, i, 'actual', num(e.target.value))}
                    />
                  </td>
                  {hasLeft && (
                    <td className={`${s.left} ${left < 0 ? s.bad : ''}`}>
                      {num(row.budget) > 0 || num(row.actual) > 0 ? fmt(left) : '—'}
                    </td>
                  )}
                  <td>
                    <button className={s.del} onClick={() => delRow(sec, i)} title="Remove row">✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button className={s.add} onClick={() => addRow(sec)}>+ Add row</button>
    </div>
  )
}
