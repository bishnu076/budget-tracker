import React from 'react'
import { useBudget } from './hooks/useBudget'
import KPIs from './components/KPIs'
import HeroInsight from './components/HeroInsight'
import Insights from './components/Insights'
import Charts from './components/Charts'
import SummaryTable from './components/SummaryTable'
import Rule5020 from './components/Rule5020'
import BudgetTable from './components/BudgetTable'
import styles from './App.module.css'

const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n }

export default function App() {
  const budget = useBudget()
  const { month, setMonth, data, update, status, user, signIn, signOut, exportCSV } = budget

  const setField = (field, value) => update({ ...data, [field]: value })

  const updateRow = (sec, i, field, value) => {
    const copy = data[sec].map((r, idx) => idx === i ? { ...r, [field]: value } : r)
    update({ ...data, [sec]: copy })
  }
  const addRow = (sec) => {
    const blank = sec === 'bills' || sec === 'debts'
      ? { name: '', due: '', budget: 0, actual: 0 }
      : { name: '', budget: 0, actual: 0 }
    update({ ...data, [sec]: [...data[sec], blank] })
  }
  const delRow = (sec, i) => update({ ...data, [sec]: data[sec].filter((_, idx) => idx !== i) })

  const fmt = n => {
    const sign = n < 0 ? '-' : ''
    return sign + data.currency + Math.round(Math.abs(n)).toLocaleString()
  }

  const statusText = {
    saving: '💾 Saving…',
    saved: '✓ Saved',
    error: '⚠ Save failed',
    loading: '⏳ Loading…',
  }[status] || (user ? '☁ Cloud sync on' : '📱 Saved locally on this device')

  return (
    <div className={styles.wrap}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Monthly Budget Tracker</h1>
          <p className={styles.sub}>Enter budgets &amp; actuals — get live tips, daily allowance &amp; pace warnings</p>
        </div>
        <div className={styles.headerRight}>
          {user
            ? <div className={styles.userRow}>
                <span className={styles.userEmail}>{user.email}</span>
                <button className={styles.btnSm} onClick={signOut}>Sign out</button>
              </div>
            : <button className={styles.btnAccent} onClick={signIn}>
                ☁ Sign in with Google to sync across devices
              </button>
          }
          <span className={styles.savedNote}>{statusText}</span>
        </div>
      </div>

      {/* ── Setup bar ── */}
      <div className={styles.setupBar}>
        <div className={styles.field}>
          <label>Month</label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => {
              const d = new Date()
              d.setMonth(d.getMonth() - 12 + i)
              const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              return <option key={v} value={v}>{v}</option>
            })}
          </select>
        </div>
        <div className={styles.field}>
          <label>Start date</label>
          <input type="date" value={data.startDate} onChange={e => setField('startDate', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>End date</label>
          <input type="date" value={data.endDate} onChange={e => setField('endDate', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Starting balance</label>
          <input type="number" value={data.startBalance || ''} placeholder="0"
            onChange={e => setField('startBalance', num(e.target.value))} />
        </div>
        <div className={styles.field} style={{ maxWidth: 80 }}>
          <label>Currency</label>
          <input type="text" value={data.currency} maxLength={3}
            onChange={e => setField('currency', e.target.value)} />
        </div>
        <div className={styles.toolbtns}>
          <button className={styles.btn} onClick={exportCSV}>Export CSV</button>
          <button className={styles.btn} onClick={() => window.print()}>Print / PDF</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <KPIs budget={budget} fmt={fmt} />

      {/* ── Hero insight ── */}
      <HeroInsight budget={budget} fmt={fmt} />

      {/* ── Smart insights ── */}
      <Insights budget={budget} fmt={fmt} />

      {/* ── Charts ── */}
      <Charts budget={budget} fmt={fmt} />

      {/* ── Summary + 50/30/20 ── */}
      <div className={styles.twoCol}>
        <SummaryTable budget={budget} fmt={fmt} />
        <Rule5020 budget={budget} fmt={fmt} />
      </div>

      {/* ── Budget tables ── */}
      <div className={styles.tables}>
        <div className={styles.col}>
          <BudgetTable sec="income" label="INCOME" color="var(--green)" rows={data.income}
            cols={['name','budget','actual']} updateRow={updateRow} addRow={addRow} delRow={delRow} fmt={fmt} />
          <BudgetTable sec="savings" label="SAVINGS" color="var(--teal)" rows={data.savings}
            cols={['name','budget','actual']} updateRow={updateRow} addRow={addRow} delRow={delRow} fmt={fmt} />
        </div>
        <div className={styles.col}>
          <BudgetTable sec="expenses" label="EXPENSES" color="var(--red)" rows={data.expenses}
            cols={['name','budget','actual','left']} updateRow={updateRow} addRow={addRow} delRow={delRow} fmt={fmt} />
          <BudgetTable sec="bills" label="BILLS" color="var(--blue)" rows={data.bills}
            cols={['name','due','budget','actual']} updateRow={updateRow} addRow={addRow} delRow={delRow} fmt={fmt} />
          <BudgetTable sec="debts" label="DEBTS" color="var(--gold)" rows={data.debts}
            cols={['name','due','budget','actual']} updateRow={updateRow} addRow={addRow} delRow={delRow} fmt={fmt} />
        </div>
      </div>

    </div>
  )
}
