-- Run this once in your Supabase SQL editor
-- It creates the budgets table with Row Level Security

create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  month       text not null,           -- e.g. "2026-06"
  payload     jsonb not null,          -- full budget object
  updated_at  timestamptz default now(),
  unique(user_id, month)
);

-- RLS: users can only see/edit their own rows
alter table public.budgets enable row level security;

create policy "Users read own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users upsert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);
