-- =========================================
-- COMPANIES (FIRMA) + INVITE CODES
-- Ekzekuto kete skedar ne Supabase SQL Editor
-- =========================================

create extension if not exists "pgcrypto";

-- Tabela e firmave
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nipt text unique,
  email text,
  phone text,
  address text,
  logo_url text,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Kodet e ftesës
create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  role text not null default 'employee' check (role in ('owner','admin','employee')),
  used_by uuid references auth.users(id),
  used_at timestamptz,
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

-- Anetaret e firmes
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'employee',
  created_at timestamptz not null default now(),
  unique(company_id, user_id)
);

-- Admin global
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.companies enable row level security;
alter table public.company_invites enable row level security;
alter table public.company_members enable row level security;
alter table public.app_admins enable row level security;

create or replace function public.is_app_admin()
returns boolean language sql stable as $$
  select exists(select 1 from public.app_admins where user_id = auth.uid());
$$;

drop policy if exists "admin manages companies" on public.companies;
create policy "admin manages companies" on public.companies for all
  using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "members read own company" on public.companies;
create policy "members read own company" on public.companies for select
  using (exists (select 1 from public.company_members m where m.company_id = companies.id and m.user_id = auth.uid()));

drop policy if exists "admin manages invites" on public.company_invites;
create policy "admin manages invites" on public.company_invites for all
  using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "anyone can read invite by code" on public.company_invites;
create policy "anyone can read invite by code" on public.company_invites for select using (true);

drop policy if exists "admin manages members" on public.company_members;
create policy "admin manages members" on public.company_members for all
  using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "user reads own membership" on public.company_members;
create policy "user reads own membership" on public.company_members for select using (user_id = auth.uid());

-- RPC per regjistrim me kod
create or replace function public.redeem_invite(p_code text)
returns uuid language plpgsql security definer as $$
declare
  v_invite public.company_invites%rowtype;
begin
  select * into v_invite from public.company_invites
   where code = upper(p_code)
     and used_by is null
     and (expires_at is null or expires_at > now())
   limit 1;

  if not found then
    raise exception 'Kodi i ftesës është i pavlefshëm ose ka skaduar';
  end if;

  insert into public.company_members(company_id, user_id, role)
  values (v_invite.company_id, auth.uid(), v_invite.role)
  on conflict (company_id, user_id) do nothing;

  update public.company_invites
     set used_by = auth.uid(), used_at = now()
   where id = v_invite.id;

  return v_invite.company_id;
end;
$$;

grant execute on function public.redeem_invite(text) to authenticated;
