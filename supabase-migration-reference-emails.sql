-- Migration: Reference emails table
-- Run this in Supabase SQL Editor

create table if not exists public.reference_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text,
  body text not null,
  created_at timestamp with time zone default now()
);

alter table public.reference_emails enable row level security;

create policy "reference_emails read" 
  on public.reference_emails for select 
  using ( auth.uid() = user_id );

create policy "reference_emails insert" 
  on public.reference_emails for insert 
  with check ( auth.uid() = user_id );

create policy "reference_emails delete" 
  on public.reference_emails for delete 
  using ( auth.uid() = user_id );

-- Add index for faster queries
create index if not exists reference_emails_user_id_idx 
  on public.reference_emails(user_id);
