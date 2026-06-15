import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

const TODAY = new Date()
const YM = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`

const DEFAULT_DATA = () => ({
  currency: '¥',
  startDate: `${YM}-01`,
  endDate: `${YM}-${new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate()}`,
  startBalance: 0,
  income: [
    { name: 'Salary (ZOZO / Laboro)', budget: 0, actual: 0 },
    { name: 'Overtime / Night allowance', budget: 0, actual: 0 },
    { name: 'Side income', budget: 0, actual: 0 },
    { name: 'Transport allowance', budget: 0, actual: 0 },
  ],
  expenses: [
    { name: 'Groceries', budget: 50000, actual: 4200 },
    { name: 'Eating out', budget: 0, actual: 0 },
    { name: 'Entertainment', budget: 0, actual: 0 },
    { name: 'Daily goods', budget: 0, actual: 0 },
    { name: 'Commute / Transport', budget: 0, actual: 0 },
    { name: 'Health / Medical', budget: 0, actual: 0 },
    { name: 'Clothing', budget: 0, actual: 0 },
    { name: 'Hobbies / Games', budget: 0, actual: 0 },
    { name: 'Education / School', budget: 0, actual: 0 },
    { name: 'Misc', budget: 0, actual: 0 },
  ],
  bills: [
    { name: 'Rent', due: '', budget: 25000, actual: 25000 },
    { name: 'Electricity', due: '', budget: 0, actual: 0 },
    { name: 'Gas', due: '', budget: 0, actual: 0 },
    { name: 'Water', due: '', budget: 0, actual: 0 },
    { name: 'Mobile phone', due: '', budget: 0, actual: 0 },
    { name: 'Internet / Wi-Fi', due: '', budget: 0, actual: 0 },
    { name: 'Insurance', due: '', budget: 0, actual: 0 },
  ],
  debts: [
    { name: 'Credit card 1', due: '', budget: 0, actual: 0 },
    { name: 'Credit card 2', due: '', budget: 0, actual: 0 },
    { name: 'Credit card 3', due: '', budget: 0, actual: 0 },
    { name: 'Loan 1', due: '', budget: 0, actual: 0 },
  ],
  savings: [
    { name: 'Emergency fund', budget: 0, actual: 0 },
    { name: 'Travel / Holiday', budget: 0, actual: 0 },
    { name: 'Big purchase', budget: 0, actual: 0 },
    { name: 'Investments', budget: 0, actual: 0 },
  ],
})

const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const sums = (arr, hasDue) => {
  let b = 0, a = 0
  arr.forEach(r => { b += num(r.budget); a += num(r.actual) })
  return { b, a }
}

export function useBudget() {
  const [month, setMonth] = useState(YM)
  const [data, setData] = useState(DEFAULT_DATA())
  const [status, setStatus] = useState('idle') // idle | loading | saving | saved | error
  const [user, setUser] = useState(null)
  const saveTimer = useRef(null)

  // auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  // load when month or user changes
  useEffect(() => { loadData() }, [month, user])

  async function loadData() {
    setStatus('loading')
    if (!user) {
      // fallback to localStorage
      try {
        const raw = localStorage.getItem(`budget_${month}`)
        setData(raw ? JSON.parse(raw) : DEFAULT_DATA())
      } catch { setData(DEFAULT_DATA()) }
      setStatus('idle')
      return
    }
    const { data: row, error } = await supabase
      .from('budgets')
      .select('payload')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()
    if (error) { setStatus('error'); return }
    setData(row ? row.payload : DEFAULT_DATA())
    setStatus('idle')
  }

  const saveData = useCallback(async (d) => {
    setStatus('saving')
    if (!user) {
      try { localStorage.setItem(`budget_${month}`, JSON.stringify(d)) } catch {}
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
      return
    }
    const { error } = await supabase.from('budgets').upsert(
      { user_id: user.id, month, payload: d },
      { onConflict: 'user_id,month' }
    )
    setStatus(error ? 'error' : 'saved')
    setTimeout(() => setStatus('idle'), 1500)
  }, [user, month])

  const update = useCallback((newData) => {
    setData(newData)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveData(newData), 800)
  }, [saveData])

  // computed totals
  const inc = sums(data.income)
  const exp = sums(data.expenses)
  const bil = sums(data.bills)
  const deb = sums(data.debts)
  const sav = sums(data.savings)
  const incomeRef = inc.b > 0 ? inc.b : inc.a
  const totalBudgeted = exp.b + bil.b + deb.b + sav.b
  const totalSpent = exp.a + bil.a + deb.a + sav.a
  const leftForBudget = incomeRef - totalBudgeted
  const leftToSpend = totalBudgeted - totalSpent
  const endingBal = num(data.startBalance) + inc.a - totalSpent
  const netFlow = inc.a - totalSpent

  // day info
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  const MS = 86400000
  const totalDays = Math.max(1, Math.round((end - start) / MS) + 1)
  const passedDays = Math.min(Math.max(Math.round((new Date() - start) / MS) + 1, 0), totalDays)
  const leftDays = Math.max(0, totalDays - passedDays)
  const safePerDay = leftDays > 0 ? Math.max(0, (exp.b - exp.a) / leftDays) : 0
  const projExp = passedDays > 0 ? exp.a / passedDays * totalDays : exp.a

  // 50/30/20
  const needs = bil.a + deb.a
  const wants = exp.a
  const saveDebt = sav.a
  const t5020 = { needs: incomeRef * 0.5, wants: incomeRef * 0.3, save: incomeRef * 0.2 }

  // savings rate
  const savingsRate = inc.a > 0 ? (sav.a / inc.a) * 100 : 0

  // per-category overs
  const overspent = []
  data.expenses.forEach(r => { if (num(r.budget) > 0 && num(r.actual) > num(r.budget)) overspent.push({ name: r.name, over: num(r.actual) - num(r.budget) }) })
  data.bills.forEach(r => { if (num(r.budget) > 0 && num(r.actual) > num(r.budget)) overspent.push({ name: r.name, over: num(r.actual) - num(r.budget) }) })
  overspent.sort((a, b) => b.over - a.over)

  const remaining = data.expenses.filter(r => num(r.budget) > 0 && num(r.actual) < num(r.budget))
    .map(r => ({ name: r.name, left: num(r.budget) - num(r.actual) }))
    .sort((a, b) => b.left - a.left)

  const paceStatus = exp.b > 0 ? (projExp > exp.b * 1.02 ? 'over' : 'ok') : 'nobudget'

  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })
  const signOut = () => supabase.auth.signOut()

  const exportCSV = () => {
    const rows = [['Section', 'Name', 'Due', 'Budget', 'Actual']]
    ;['income', 'expenses', 'bills', 'debts', 'savings'].forEach(sec =>
      data[sec].forEach(r => rows.push([sec, r.name, r.due || '', r.budget, r.actual]))
    )
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `budget_${month}.csv`
    a.click()
  }

  return {
    month, setMonth,
    data, update,
    status, user, signIn, signOut,
    totals: { inc, exp, bil, deb, sav, incomeRef, totalBudgeted, totalSpent, leftForBudget, leftToSpend, endingBal, netFlow },
    days: { totalDays, passedDays, leftDays, safePerDay, projExp, paceStatus },
    split: { needs, wants, saveDebt, t5020, savingsRate },
    overspent, remaining,
    exportCSV,
  }
}
