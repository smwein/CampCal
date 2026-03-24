-- CampCalendar Database Schema
-- Run this in the Supabase SQL Editor after creating your project
-- Prerequisites: Enable PostGIS and pg_trgm extensions first

-- Extensions
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ============================================================
-- TABLES
-- ============================================================

-- Families group users who share kids/calendars
create table families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Users (extended from Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  zip_code text,
  created_at timestamptz not null default now()
);

-- Family members (enables co-parent access)
create table family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique(family_id, user_id)
);

-- Kid profiles
create table kids (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  birth_date date,
  color text not null default '#3498DB',
  created_at timestamptz not null default now()
);

-- Camps (shared across all users, community-sourced)
create table camps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  address text,
  zip_code text,
  location geography(point, 4326),
  category text not null default 'mixed'
    check (category in ('sports', 'arts', 'science', 'outdoors', 'academic', 'mixed')),
  duration_type text not null default 'full_day'
    check (duration_type in ('full_day', 'half_day', 'extended')),
  age_min int,
  age_max int,
  cost_cents int,
  url text,
  created_by_user_id uuid references auth.users(id),
  confirmed_by_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Camp sessions (a camp can run multiple weeks)
create table camp_sessions (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references camps(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  days_of_week int not null default 31, -- bitmask: bit0=Mon..bit4=Fri, 31=Mon-Fri
  created_at timestamptz not null default now()
);

-- Assignments link kids to camp sessions
create table assignments (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  camp_session_id uuid not null references camp_sessions(id) on delete cascade,
  status text not null default 'planned'
    check (status in ('planned', 'registered', 'waitlisted')),
  created_at timestamptz not null default now()
);

-- Coverage overrides (vacations, grandparent visits, etc.)
create table coverage_overrides (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type text not null default 'vacation'
    check (type in ('vacation', 'grandparent', 'other')),
  label text,
  created_at timestamptz not null default now()
);

-- Camp reports for community moderation
create table camp_reports (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references camps(id) on delete cascade,
  reported_by_user_id uuid not null references auth.users(id),
  reason text not null check (reason in ('incorrect_info', 'duplicate', 'spam', 'closed')),
  note text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Spatial index for camp location queries
create index camps_location_idx on camps using gist (location);

-- Trigram index for camp name dedup
create index camps_name_trgm_idx on camps using gin (name gin_trgm_ops);

-- Common lookups
create index kids_family_id_idx on kids (family_id);
create index assignments_kid_id_idx on assignments (kid_id);
create index assignments_camp_session_id_idx on assignments (camp_session_id);
create index camp_sessions_camp_id_idx on camp_sessions (camp_id);
create index coverage_overrides_kid_id_idx on coverage_overrides (kid_id);
create index profiles_family_id_idx on profiles (family_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table families enable row level security;
alter table profiles enable row level security;
alter table family_members enable row level security;
alter table kids enable row level security;
alter table camps enable row level security;
alter table camp_sessions enable row level security;
alter table assignments enable row level security;
alter table coverage_overrides enable row level security;
alter table camp_reports enable row level security;

-- Helper: get the current user's family_id
create or replace function get_my_family_id()
returns uuid as $$
  select family_id from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Families: users can only see their own family
create policy "Users can view own family"
  on families for select using (id = get_my_family_id());

-- Profiles: users can see family members
create policy "Users can view family profiles"
  on profiles for select using (family_id = get_my_family_id());
create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());
create policy "Users can insert own profile"
  on profiles for insert with check (id = auth.uid());

-- Family members
create policy "Users can view family members"
  on family_members for select using (family_id = get_my_family_id());
create policy "Owners can manage family members"
  on family_members for all using (
    family_id = get_my_family_id()
    and exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = auth.uid()
        and fm.role = 'owner'
    )
  );

-- Kids: scoped to family
create policy "Users can view family kids"
  on kids for select using (family_id = get_my_family_id());
create policy "Users can manage family kids"
  on kids for all using (family_id = get_my_family_id());

-- Camps: anyone can READ (community data), only creator can UPDATE
create policy "Anyone can view camps"
  on camps for select using (true);
create policy "Authenticated users can create camps"
  on camps for insert with check (auth.uid() is not null);
create policy "Creator can update own camps"
  on camps for update using (created_by_user_id = auth.uid());

-- Camp sessions: readable by all (tied to public camps)
create policy "Anyone can view camp sessions"
  on camp_sessions for select using (true);
create policy "Authenticated users can create camp sessions"
  on camp_sessions for insert with check (auth.uid() is not null);

-- Assignments: scoped to family (via kid)
create policy "Users can view family assignments"
  on assignments for select using (
    exists (select 1 from kids where kids.id = assignments.kid_id and kids.family_id = get_my_family_id())
  );
create policy "Users can manage family assignments"
  on assignments for all using (
    exists (select 1 from kids where kids.id = assignments.kid_id and kids.family_id = get_my_family_id())
  );

-- Coverage overrides: scoped to family (via kid)
create policy "Users can view family overrides"
  on coverage_overrides for select using (
    exists (select 1 from kids where kids.id = coverage_overrides.kid_id and kids.family_id = get_my_family_id())
  );
create policy "Users can manage family overrides"
  on coverage_overrides for all using (
    exists (select 1 from kids where kids.id = coverage_overrides.kid_id and kids.family_id = get_my_family_id())
  );

-- Camp reports: users can create, admins can view all
create policy "Users can create reports"
  on camp_reports for insert with check (auth.uid() is not null);
create policy "Users can view own reports"
  on camp_reports for select using (reported_by_user_id = auth.uid());

-- ============================================================
-- TRIGGER: Auto-create family + profile on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  new_family_id uuid;
begin
  -- Create a new family
  insert into families default values returning id into new_family_id;

  -- Create the profile
  insert into profiles (id, family_id, name)
  values (new.id, new_family_id, coalesce(new.raw_user_meta_data->>'name', 'Parent'));

  -- Add as family owner
  insert into family_members (family_id, user_id, role)
  values (new_family_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
