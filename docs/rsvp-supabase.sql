-- 송년회 RSVP 테이블 (Supabase > SQL Editor 에 붙여넣고 Run)
create table if not exists public.rsvps (
  id         text primary key,
  key_hash   text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- 브라우저에서 직접 접근은 막고, Render 서버(service_role 키)만 읽고 쓰게 한다
alter table public.rsvps enable row level security;
