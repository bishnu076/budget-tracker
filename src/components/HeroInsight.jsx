import React from 'react'
import s from './HeroInsight.module.css'

export default function HeroInsight({ budget, fmt }) {
  const { days, totals } = budget
  const { safePerDay, leftDays, projExp, paceStatus } = days
  const { exp } = totals

  const paceColor = paceStatus === 'over' ? 'var(--red)' : paceStatus === 'ok' ? 'var(--green)' : 'var(--mut)'
  const paceLabel = paceStatus === 'over' ? '⚠ Overspending' : paceStatus === 'ok' ? '✓ On track' : 'Set a budget'
  const paceDesc = paceStatus === 'over'
    ? <>Projected month-end spend <b>{fmt(projExp)}</b> — <b style={{ color: 'var(--red)' }}>{fmt(projExp - exp.b)} over budget</b>. Ease off now.</>
    : paceStatus === 'ok'
    ? <>Projected <b>{fmt(projExp)}</b> by month end, within your <b>{fmt(exp.b)}</b> budget. Keep it up.</>
    : 'Add expense budgets above to see your pace projection.'

  return (
    <div className={s.hero}>
      <div className={s.block}>
        <div className={s.big}>{fmt(safePerDay)}</div>
        <div className={s.lbl}>Safe to spend / day</div>
        <div className={s.desc}>
          on everyday expenses for the next <b>{leftDays}</b> day{leftDays !== 1 ? 's' : ''}&nbsp;·&nbsp;
          <b>{fmt(Math.max(0, exp.b - exp.a))}</b> remaining of {fmt(exp.b)} expense budget
        </div>
      </div>
      <div className={s.divider} />
      <div className={s.block}>
        <div className={s.big} style={{ color: paceColor }}>{paceLabel}</div>
        <div className={s.desc}>{paceDesc}</div>
      </div>
    </div>
  )
}
