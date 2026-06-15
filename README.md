# Budget Tracker
**Live:** https://bishnu076.github.io/budget-tracker

Dark-neon personal budget dashboard with cloud sync, live smart insights, daily allowance calculator, 50/30/20 rule, and three charts.

---

## One-time Supabase setup

Run this SQL once in your Supabase SQL editor (rfgahqjayrvrhgebdmdw):

```sql
create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  month       text not null,
  payload     jsonb not null,
  updated_at  timestamptz default now(),
  unique(user_id, month)
);

alter table public.budgets enable row level security;

create policy "Users read own budgets"   on public.budgets for select using (auth.uid() = user_id);
create policy "Users upsert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users delete own budgets" on public.budgets for delete using (auth.uid() = user_id);
```

Then in Supabase → Authentication → URL Configuration, add:
- Site URL: `https://bishnu076.github.io/budget-tracker`
- Redirect URL: `https://bishnu076.github.io/budget-tracker`

---

## GitHub setup (one time)

1. Create repo `budget-tracker` on github.com/bishnu076
2. In repo Settings → Pages → Source: **GitHub Actions**
3. In repo Settings → Secrets → Actions, add two secrets:
   - `VITE_SUPABASE_URL` = `https://rfgahqjayrvrhgebdmdw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_fQ8MovJKLOu4fWTaZka_og_wRtajKc3`

---

## Deploy

```bash
git init
git add .
git commit -m "Initial budget tracker"
git branch -M main
git remote add origin https://github.com/bishnu076/budget-tracker.git
git push -u origin main
```

GitHub Actions will build and deploy automatically. Live in ~2 minutes.

---

## Local dev

```bash
npm install
npm run dev
```
