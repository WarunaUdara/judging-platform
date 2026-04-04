create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('superadmin', 'organizer', 'evaluator', 'pending');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'competition_status') then
    create type public.competition_status as enum ('draft', 'active', 'scoring', 'closed');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'competition_type') then
    create type public.competition_type as enum ('hackathon', 'designathon', 'custom');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scorecard_status') then
    create type public.scorecard_status as enum ('draft', 'submitted');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'evaluator_role') then
    create type public.evaluator_role as enum ('evaluator', 'head_judge');
  end if;
end
$$;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  photo_url text,
  role public.user_role not null default 'pending',
  org_id uuid references public.organisations(id) on delete set null,
  competition_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  type public.competition_type not null default 'custom',
  description text not null default '',
  status public.competition_status not null default 'draft',
  team_min_size integer not null default 1,
  team_max_size integer not null default 5,
  allowed_domains text[] not null default '{}'::text[],
  scoring_config jsonb not null default jsonb_build_object(
    'allowPartialSubmit', false,
    'showLeaderboardTo', 'evaluators_and_organizers',
    'scoreVisibilityMode', 'live',
    'allowRescoring', false
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.criteria (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  description text not null default '',
  weight numeric(5,2) not null,
  max_score numeric(8,2) not null,
  sort_order integer not null,
  is_required boolean not null default true,
  category text not null default 'General'
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  domain text not null,
  project_title text not null default '',
  submission_url text not null default '',
  members jsonb not null default '[]'::jsonb,
  notes text not null default '',
  status text not null default 'registered',
  imported_at timestamptz not null default now()
);

create table if not exists public.competition_evaluators (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  evaluator_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role public.evaluator_role not null default 'evaluator',
  assigned_team_ids uuid[] not null default '{}'::uuid[],
  is_active boolean not null default true,
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id),
  unique (competition_id, evaluator_id)
);

create table if not exists public.scorecards (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  evaluator_id uuid not null references public.users(id) on delete cascade,
  status public.scorecard_status not null default 'draft',
  scores jsonb not null default '{}'::jsonb,
  total_raw_score numeric(10,3) not null default 0,
  weighted_score numeric(10,3) not null default 0,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (competition_id, team_id, evaluator_id)
);

create table if not exists public.leaderboard_cache (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  team_name text not null,
  domain text not null,
  average_weighted_score numeric(10,3) not null,
  rank integer not null,
  submitted_score_count integer not null,
  total_evaluators integer not null,
  last_updated timestamptz not null default now(),
  primary key (competition_id, team_id)
);

create table if not exists public.invitations (
  token text primary key,
  email text not null,
  role public.user_role not null,
  competition_id uuid references public.competitions(id) on delete cascade,
  org_id uuid references public.organisations(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used boolean not null default false,
  used_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_uid uuid references auth.users(id),
  actor_email text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  competition_id uuid references public.competitions(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('superadmin', 'organizer')
  );
$$;

create or replace function public.can_access_competition(target_competition_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.competition_evaluators ce
      where ce.evaluator_id = auth.uid()
        and ce.competition_id = target_competition_id
        and ce.is_active = true
    );
$$;

alter table public.organisations enable row level security;
alter table public.users enable row level security;
alter table public.competitions enable row level security;
alter table public.criteria enable row level security;
alter table public.teams enable row level security;
alter table public.competition_evaluators enable row level security;
alter table public.scorecards enable row level security;
alter table public.leaderboard_cache enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_logs enable row level security;

create policy "users_select_own_or_admin"
  on public.users
  for select
  using (auth.uid() = id or public.is_admin());

create policy "users_update_own_or_admin"
  on public.users
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "users_insert_admin"
  on public.users
  for insert
  with check (public.is_admin() or auth.uid() = id);

create policy "org_read_admin"
  on public.organisations
  for select
  using (public.is_admin());

create policy "org_write_admin"
  on public.organisations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "competitions_select_by_access"
  on public.competitions
  for select
  using (public.can_access_competition(id));

create policy "competitions_write_admin"
  on public.competitions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "criteria_select_by_competition_access"
  on public.criteria
  for select
  using (public.can_access_competition(competition_id));

create policy "criteria_write_admin"
  on public.criteria
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "teams_select_by_competition_access"
  on public.teams
  for select
  using (public.can_access_competition(competition_id));

create policy "teams_write_admin"
  on public.teams
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "competition_evaluators_select_by_competition_access"
  on public.competition_evaluators
  for select
  using (public.can_access_competition(competition_id));

create policy "competition_evaluators_write_admin"
  on public.competition_evaluators
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "scorecards_select_by_competition_access"
  on public.scorecards
  for select
  using (public.can_access_competition(competition_id));

create policy "scorecards_insert_by_access"
  on public.scorecards
  for insert
  with check (
    public.can_access_competition(competition_id)
    and (public.is_admin() or evaluator_id = auth.uid())
  );

create policy "scorecards_update_by_access"
  on public.scorecards
  for update
  using (
    public.can_access_competition(competition_id)
    and (public.is_admin() or evaluator_id = auth.uid())
  )
  with check (
    public.can_access_competition(competition_id)
    and (public.is_admin() or evaluator_id = auth.uid())
  );

create policy "leaderboard_select_by_competition_access"
  on public.leaderboard_cache
  for select
  using (public.can_access_competition(competition_id));

create policy "leaderboard_write_admin"
  on public.leaderboard_cache
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "invitations_select_by_access"
  on public.invitations
  for select
  using (
    public.is_admin()
    or lower(email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  );

create policy "invitations_write_admin"
  on public.invitations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "audit_logs_read_admin"
  on public.audit_logs
  for select
  using (public.is_admin());

create policy "audit_logs_insert_by_access"
  on public.audit_logs
  for insert
  with check (public.can_access_competition(competition_id) or public.is_admin());

create policy "audit_logs_update_admin"
  on public.audit_logs
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "audit_logs_delete_admin"
  on public.audit_logs
  for delete
  using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1), 'User')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name,
    last_login_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
