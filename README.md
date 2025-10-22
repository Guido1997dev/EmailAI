MailSprint AI — SaaS boilerplate (Next.js 14, Supabase, Stripe, OpenAI)

Quickstart

1. Copy env variables

```
cp .env.example .env.local
```

2. Fill required keys (Supabase, Stripe, OpenAI), then run dev

```
npm run dev
```

Supabase

- Create a project, get `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- SQL (profiles table):

```
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tone_of_voice text,
  is_pro boolean default false,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "profiles read" on public.profiles for select using ( auth.uid() = id );
create policy "profiles upsert" on public.profiles for insert with check ( auth.uid() = id );
create policy "profiles update" on public.profiles for update using ( auth.uid() = id );
```

Stripe

- Create a Product + Price (recurring). Put price id in `STRIPE_PRICE_ID_PRO`.
- Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Create webhook endpoint pointing to `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

OpenAI

- Add `OPENAI_API_KEY`.

Routes

- `/` marketing landing
- `/auth` Supabase auth
- `/dashboard` settings + test
- `/dashboard/billing` upgrade and portal
- `/api/generateMail` LLM email generation
- `/api/stripe/*` Stripe checkout, portal, webhook

Chrome extension (Gmail sidebar)

1. Go to `chrome://extensions`, toggle Developer Mode.
2. Click "Load unpacked" and select the `extension/` folder.
3. Open Gmail and press Command+M (Mac) / Ctrl+M (Windows) to toggle the overlay.
4. The panel loads from your app at `/panel` so your login session is reused. If it says you’re not logged in, visit your local app (e.g. `http://localhost:3000`) and sign in, then toggle again.
5. Click “Laad context” to fetch the current conversation content; generate; “Plak in Gmail” inserts into the reply editor.
