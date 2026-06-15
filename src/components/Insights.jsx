import React from 'react'
import s from './Insights.module.css'

export default function Insights({ budget, fmt }) {
  const { totals, days, split, overspent, remaining } = budget
  const { inc, exp, bil, deb, sav, incomeRef, totalBudgeted, endingBal } = totals
  const { savingsRate, t5020, needs, wants, saveDebt } = split

  const tips = []

  // 1. income vs budget
  if (incomeRef > 0 && totalBudgeted > incomeRef) {
    tips.push({ type: 'bad', title: 'Budget exceeds income', body: <>Your planned outgoings exceed income by <b>{fmt(totalBudgeted - incomeRef)}</b>. Trim a category before the month ends.</> })
  } else if (incomeRef > 0 && totalBudgeted <= incomeRef) {
    const slack = incomeRef - totalBudgeted
    tips.push({ type: 'good', title: 'Budget fits income', body: <><b>{fmt(slack)}</b> unallocated after all budgeted items — consider sending it to savings or debt.</> })
  }

  // 2. overspent categories
  if (overspent.length) {
    tips.push({ type: 'bad', title: `Over budget in ${overspent.length} categor${overspent.length > 1 ? 'ies' : 'y'}`, body: <>{overspent.slice(0, 3).map(o => <span key={o.name}><b>{o.name}</b> +{fmt(o.over)}&nbsp;</span>)}{overspent.length > 3 && `and ${overspent.length - 3} more`}. Prioritise cutting these.</> })
  }

  // 3. remaining room
  if (remaining.length) {
    tips.push({ type: 'info', title: 'Spending room available', body: <>Most headroom: {remaining.slice(0, 3).map(r => <span key={r.name}><b>{r.name}</b> {fmt(r.left)}&nbsp;</span>)}.</> })
  }

  // 4. savings rate
  if (inc.a > 0) {
    const target = incomeRef * 0.2
    tips.push({ type: savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warn' : 'bad', title: `Savings rate ${savingsRate.toFixed(0)}%`, body: savingsRate >= 20 ? <><b>{fmt(sav.a)}</b> saved of <b>{fmt(inc.a)}</b> income. Excellent — you're above the 20% target.</> : <><b>{fmt(sav.a)}</b> saved so far. Target is <b>{fmt(target)}</b> (20%). You're <b>{fmt(target - sav.a)}</b> short — increase a savings goal.</> })
  }

  // 5. debt tip
  if (deb.a > 0 || deb.b > 0) {
    tips.push({ type: 'warn', title: 'Debt payments', body: <><b>{fmt(deb.a || deb.b)}</b> going to debt this period. After essentials, put any surplus toward the highest-interest balance first (avalanche method).</> })
  }

  // 6. daily safe spend
  if (days.leftDays > 0 && exp.b > 0) {
    tips.push({ type: 'info', title: 'Daily allowance', body: <>Keep everyday spending under <b>{fmt(days.safePerDay)}/day</b> for the next {days.leftDays} day{days.leftDays !== 1 ? 's' : ''} to land on budget.</> })
  }

  // 7. ending balance
  if (endingBal < 0) {
    tips.push({ type: 'bad', title: 'Heading into negative', body: <>At current actuals, you'll end the period at <b style={{ color: 'var(--red)' }}>{fmt(endingBal)}</b>. Cut spending or add income now.</> })
  } else if (inc.a > 0) {
    tips.push({ type: 'good', title: 'Finishing positive', body: <>On current numbers you'll end with <b>{fmt(endingBal)}</b> — a healthy position.</> })
  }

  // 8. 50/30/20 warnings
  if (incomeRef > 0) {
    if (needs > t5020.needs * 1.05) tips.push({ type: 'warn', title: 'Needs bucket over 50%', body: <>Bills + debt = <b>{fmt(needs)}</b>, above the 50% target of <b>{fmt(t5020.needs)}</b>. Try to reduce fixed costs long-term.</> })
    if (wants > t5020.wants * 1.1) tips.push({ type: 'warn', title: 'Wants bucket over 30%', body: <>Everyday spending = <b>{fmt(wants)}</b>, above the 30% target of <b>{fmt(t5020.wants)}</b>. Time to cut discretionary spending.</> })
  }

  if (!tips.length) return (
    <div className={s.panel}>
      <h2 className={s.heading}>Smart Insights</h2>
      <p style={{ color: 'var(--mut)', fontSize: 13 }}>Enter your income and budget amounts above — personalised tips will appear here instantly.</p>
    </div>
  )

  return (
    <div className={s.panel}>
      <h2 className={s.heading}>Smart Insights</h2>
      <div className={s.grid}>
        {tips.map((t, i) => (
          <div key={i} className={`${s.tip} ${s[t.type]}`}>
            <div className={s.tt}>{t.title}</div>
            <div className={s.td}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
