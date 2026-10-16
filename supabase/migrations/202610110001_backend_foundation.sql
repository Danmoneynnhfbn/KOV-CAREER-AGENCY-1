-- KOV private account and operations foundation.
-- Apply only to the intended Supabase project after taking a backup.

create extension if not exists pgcrypto with schema extensions;
create sequence if not exists public.candidate_public_id_seq start with 1;
create sequence if not exists public.employer_public_id_seq start with 1;

create table if not exists public.app_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'candidate'
        check (role in ('candidate', 'employer', 'administrator')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = ''
as $$
    select role from public.app_users where user_id = (select auth.uid())
$$;

create or replace function public.is_app_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
    select coalesce(public.current_app_role() = 'administrator', false)
$$;

create or replace function public.bootstrap_candidate_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
    insert into public.app_users (user_id, role)
    values (new.id, 'candidate')
    on conflict (user_id) do nothing;
    return new;
end
$$;

drop trigger if exists on_auth_user_created_kov on auth.users;
create trigger on_auth_user_created_kov after insert on auth.users
    for each row execute function public.bootstrap_candidate_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end
$$;

create table if not exists public.candidate_profiles (
    id uuid primary key default extensions.gen_random_uuid(),
    user_id uuid not null unique references public.app_users(user_id) on delete cascade,
    public_id text not null unique default
        ('KOV-C-' || lpad(nextval('public.candidate_public_id_seq')::text, 5, '0')),
    professional_title text,
    professional_summary text,
    skills text[] not null default '{}',
    years_experience numeric(4, 1) check (years_experience >= 0),
    target_roles text[] not null default '{}',
    target_seniority text,
    target_industries text[] not null default '{}',
    target_geography text[] not null default '{}',
    location_region text,
    vetting_status text not null default 'pending'
        check (vetting_status in ('pending', 'in_review', 'approved', 'rejected')),
    badge_approved boolean not null default false,
    directory_visible boolean not null default false,
    last_activity_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.candidate_private (
    candidate_id uuid primary key references public.candidate_profiles(id) on delete cascade,
    legal_name text,
    email text,
    phone text,
    expected_compensation text,
    preferred_companies text[] not null default '{}',
    career_objectives text,
    consent_record jsonb not null default '{}'::jsonb,
    screening_notes text,
    legal_hold boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.employers (
    id uuid primary key default extensions.gen_random_uuid(),
    public_id text not null unique default
        ('KOV-E-' || lpad(nextval('public.employer_public_id_seq')::text, 5, '0')),
    company_name text not null,
    corporate_email text not null,
    website text,
    description text,
    target_roles text[] not null default '{}',
    target_seniority text,
    target_geography text[] not null default '{}',
    target_industries text[] not null default '{}',
    consent_record jsonb not null default '{}'::jsonb,
    verification_status text not null default 'pending'
        check (verification_status in ('pending', 'in_review', 'verified', 'rejected', 'suspended')),
    verified_at timestamptz,
    verification_notes text,
    subscription_status text not null default 'inactive'
        check (subscription_status in ('pending', 'active', 'past_due', 'cancelled', 'expired', 'suspended', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (verification_status <> 'verified' or verified_at is not null)
);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'employers_corporate_email_domain_check'
          and conrelid = 'public.employers'::regclass
    ) then
        alter table public.employers
            add constraint employers_corporate_email_domain_check
            check (lower(split_part(corporate_email, '@', 2)) not in (
                '126.com', '163.com', 'aol.com', 'fastmail.com', 'gmx.com', 'gmx.de',
                'googlemail.com', 'gmail.com', 'hey.com', 'hushmail.com', 'icloud.com',
                'live.com', 'mail.com', 'mac.com', 'me.com', 'msn.com', 'outlook.com',
                'pm.me', 'proton.me', 'protonmail.com', 'qq.com', 'rediffmail.com',
                'tutanota.com', 'tutanota.de', 'yahoo.ca', 'yahoo.co.uk', 'yahoo.com',
                'yahoo.com.au', 'yahoo.de', 'yahoo.fr', 'yahoo.in', 'yandex.com',
                'yandex.ru', 'zoho.com'
            ));
    end if;
end
$$;

create table if not exists public.employer_memberships (
    employer_id uuid not null references public.employers(id) on delete cascade,
    user_id uuid not null references public.app_users(user_id) on delete cascade,
    membership_role text not null default 'member'
        check (membership_role in ('owner', 'member')),
    created_at timestamptz not null default now(),
    primary key (employer_id, user_id)
);

create or replace function public.provision_candidate_account(
    p_user_id uuid,
    p_legal_name text,
    p_email text,
    p_professional_title text,
    p_professional_summary text,
    p_skills text[],
    p_years_experience numeric,
    p_target_roles text[],
    p_target_seniority text,
    p_target_industries text[],
    p_target_geography text[],
    p_location_region text,
    p_career_objectives text,
    p_privacy_acknowledged boolean
)
returns table (candidate_id uuid, public_id text)
language plpgsql
security definer
set search_path = ''
as $$
declare
    profile_id uuid;
    candidate_number text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Backend account provisioning is restricted';
    end if;
    if not p_privacy_acknowledged then
        raise exception 'Privacy acknowledgement is required';
    end if;
    insert into public.candidate_profiles (
        user_id, professional_title, professional_summary, skills,
        years_experience, target_roles, target_seniority, target_industries,
        target_geography, location_region
    ) values (
        p_user_id, p_professional_title, p_professional_summary, p_skills,
        p_years_experience, p_target_roles, p_target_seniority, p_target_industries,
        p_target_geography, p_location_region
    ) returning id, candidate_profiles.public_id into profile_id, candidate_number;
    insert into public.candidate_private (
        candidate_id, legal_name, email, career_objectives, consent_record
    ) values (
        profile_id, p_legal_name, p_email, p_career_objectives,
        jsonb_build_object('privacy_acknowledged', true, 'recorded_at', now())
    );
    return query select profile_id, candidate_number;
end
$$;
revoke all on function public.provision_candidate_account(
    uuid, text, text, text, text, text[], numeric, text[], text, text[], text[],
    text, text, boolean
) from public, anon, authenticated;
grant execute on function public.provision_candidate_account(
    uuid, text, text, text, text, text[], numeric, text[], text, text[], text[],
    text, text, boolean
) to service_role;

create or replace function public.provision_employer_account(
    p_user_id uuid,
    p_company_name text,
    p_corporate_email text,
    p_website text,
    p_description text,
    p_target_roles text[],
    p_target_seniority text,
    p_target_geography text[],
    p_target_industries text[],
    p_privacy_acknowledged boolean
)
returns table (employer_id uuid, public_id text)
language plpgsql
security definer
set search_path = ''
as $$
declare
    company_id uuid;
    employer_number text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Backend account provisioning is restricted';
    end if;
    if not p_privacy_acknowledged then
        raise exception 'Privacy acknowledgement is required';
    end if;
    update public.app_users set role = 'employer', updated_at = now()
    where user_id = p_user_id and role = 'candidate';
    if not found then
        raise exception 'Account cannot be provisioned as an employer';
    end if;
    insert into public.employers (
        company_name, corporate_email, website, description, target_roles,
        target_seniority, target_geography, target_industries, consent_record
    ) values (
        p_company_name, p_corporate_email, p_website, p_description, p_target_roles,
        p_target_seniority, p_target_geography, p_target_industries,
        jsonb_build_object('privacy_acknowledged', true, 'recorded_at', now())
    ) returning id, employers.public_id into company_id, employer_number;
    insert into public.employer_memberships (employer_id, user_id, membership_role)
    values (company_id, p_user_id, 'owner');
    return query select company_id, employer_number;
end
$$;
revoke all on function public.provision_employer_account(
    uuid, text, text, text, text, text[], text, text[], text[], boolean
) from public, anon, authenticated;
grant execute on function public.provision_employer_account(
    uuid, text, text, text, text, text[], text, text[], text[], boolean
) to service_role;

create table if not exists public.company_verification_records (
    id uuid primary key default extensions.gen_random_uuid(),
    employer_id uuid not null references public.employers(id) on delete cascade,
    status text not null
        check (status in ('in_review', 'verified', 'rejected', 'suspended')),
    evidence_storage_path text,
    reviewer_user_id uuid references public.app_users(user_id) on delete set null,
    reviewer_notes text,
    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
    plan_key text primary key,
    audience text not null check (audience in ('candidate', 'employer')),
    display_name text not null,
    amount_minor integer not null check (amount_minor >= 0),
    currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
    interval_unit text not null check (interval_unit in ('month', 'year', 'one_time')),
    retainer_amount_minor integer,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (retainer_amount_minor is null or retainer_amount_minor >= 0)
);

insert into public.subscription_plans
    (plan_key, audience, display_name, amount_minor, currency, interval_unit, retainer_amount_minor)
values
    ('candidate-free', 'candidate', 'Candidate registration', 0, 'USD', 'one_time', null),
    ('candidate-premium-monthly', 'candidate', 'Premium reverse-recruiting', 50000, 'USD', 'month', null),
    ('employer-monthly', 'employer', 'Employer directory access', 1500, 'USD', 'month', null)
on conflict (plan_key) do nothing;

create table if not exists public.commercial_settings (
    singleton boolean primary key default true check (singleton),
    candidate_registration_minor integer not null default 0 check (candidate_registration_minor = 0),
    candidate_retainer_minor integer,
    placement_fee_min_minor bigint not null default 250000 check (placement_fee_min_minor >= 0),
    placement_fee_reference_max_minor bigint not null default 1500000
        check (placement_fee_reference_max_minor >= placement_fee_min_minor),
    currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
    updated_at timestamptz not null default now(),
    check (candidate_retainer_minor is null or candidate_retainer_minor >= 0)
);
insert into public.commercial_settings (singleton)
values (true)
on conflict (singleton) do nothing;

create table if not exists public.subscriptions (
    id uuid primary key default extensions.gen_random_uuid(),
    plan_key text not null references public.subscription_plans(plan_key) on delete restrict,
    candidate_id uuid references public.candidate_profiles(id) on delete restrict,
    employer_id uuid references public.employers(id) on delete restrict,
    status text not null default 'pending'
        check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired', 'suspended')),
    provider text,
    provider_subscription_id text unique,
    current_period_start timestamptz,
    current_period_end timestamptz,
    provider_customer_id text,
    provider_checkout_session_id text unique,
    cancelled_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check ((candidate_id is not null) <> (employer_id is not null))
);
create unique index if not exists subscriptions_one_open_plan_per_candidate_idx
    on public.subscriptions (candidate_id, plan_key)
    where candidate_id is not null and status in ('pending', 'active', 'past_due');
create unique index if not exists subscriptions_one_open_plan_per_employer_idx
    on public.subscriptions (employer_id, plan_key)
    where employer_id is not null and status in ('pending', 'active', 'past_due');

create or replace function public.reserve_stripe_subscription_checkout(
    p_plan_key text,
    p_candidate_id uuid,
    p_employer_id uuid
)
returns setof public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
    expected_audience text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Subscription checkout reservation is restricted';
    end if;
    if ((p_candidate_id is not null) = (p_employer_id is not null)) then
        raise exception 'Exactly one account owner is required';
    end if;
    expected_audience := case when p_candidate_id is not null then 'candidate' else 'employer' end;
    if not exists (
        select 1 from public.subscription_plans
        where plan_key = p_plan_key and audience = expected_audience and active
    ) then
        raise exception 'The subscription plan is not active';
    end if;
    insert into public.subscriptions (
        plan_key, candidate_id, employer_id, status, provider
    ) values (
        p_plan_key, p_candidate_id, p_employer_id, 'pending', 'stripe'
    )
    on conflict do nothing;
    return query
    select * from public.subscriptions
    where plan_key = p_plan_key
      and candidate_id is not distinct from p_candidate_id
      and employer_id is not distinct from p_employer_id
      and status in ('pending', 'active', 'past_due')
    order by created_at desc
    limit 1
    for update;
end
$$;
revoke all on function public.reserve_stripe_subscription_checkout(text, uuid, uuid)
    from public, anon, authenticated;
grant execute on function public.reserve_stripe_subscription_checkout(text, uuid, uuid)
    to service_role;

create table if not exists public.cv_files (
    id uuid primary key default extensions.gen_random_uuid(),
    candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
    storage_path text not null unique,
    original_filename text not null,
    media_type text not null check (media_type = 'application/pdf'),
    byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760),
    uploaded_at timestamptz not null default now(),
    last_activity_at timestamptz not null default now(),
    expires_at timestamptz not null default (now() + interval '30 days'),
    deleted_at timestamptz,
    cleanup_attempts integer not null default 0 check (cleanup_attempts >= 0),
    last_cleanup_error text,
    legal_hold boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists cv_files_cleanup_idx
    on public.cv_files (expires_at) where deleted_at is null and legal_hold = false;

create table if not exists public.introductions (
    id uuid primary key default extensions.gen_random_uuid(),
    candidate_id uuid not null references public.candidate_profiles(id) on delete restrict,
    employer_id uuid not null references public.employers(id) on delete restrict,
    status text not null default 'Pending'
        check (status in ('Pending', 'Interviewing', 'Placed', 'Rejected')),
    interview_at timestamptz,
    placement_start_date date,
    placement_fee_minor bigint check (placement_fee_minor is null or placement_fee_minor >= 0),
    currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
    invoice_due_date date,
    payment_status text not null default 'not_due'
        check (payment_status in ('not_due', 'pending', 'paid', 'past_due', 'void', 'failed')),
    internal_notes text,
    created_by uuid references public.app_users(user_id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (status <> 'Placed' or (placement_start_date is not null and placement_fee_minor is not null)),
    check (invoice_due_date is null or (status = 'Placed' and placement_start_date is not null))
);
create index if not exists introductions_candidate_idx on public.introductions(candidate_id);
create index if not exists introductions_employer_idx on public.introductions(employer_id);
create index if not exists introductions_status_idx on public.introductions(status);

create or replace function public.set_introduction_invoice_due_date()
returns trigger language plpgsql set search_path = ''
as $$
begin
    if new.status = 'Placed' and new.placement_start_date is not null then
        new.invoice_due_date := new.placement_start_date + 30;
    elsif new.status <> 'Placed' then
        new.invoice_due_date := null;
    end if;
    return new;
end
$$;
drop trigger if exists introductions_invoice_due_date on public.introductions;
create trigger introductions_invoice_due_date
    before insert or update of status, placement_start_date on public.introductions
    for each row execute function public.set_introduction_invoice_due_date();

create table if not exists public.introduction_history (
    id uuid primary key default extensions.gen_random_uuid(),
    introduction_id uuid not null references public.introductions(id) on delete cascade,
    previous_status text check (previous_status is null or previous_status in ('Pending', 'Interviewing', 'Placed', 'Rejected')),
    new_status text not null check (new_status in ('Pending', 'Interviewing', 'Placed', 'Rejected')),
    changed_by uuid references public.app_users(user_id) on delete set null,
    change_note text,
    changed_at timestamptz not null default now()
);
create or replace function public.record_introduction_status()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.introduction_history (introduction_id, previous_status, new_status, changed_by)
        values (new.id, null, new.status, new.created_by);
    elsif new.status is distinct from old.status then
        insert into public.introduction_history (introduction_id, previous_status, new_status, changed_by)
        values (new.id, old.status, new.status, auth.uid());
        update public.candidate_profiles
        set last_activity_at = now()
        where id = new.candidate_id;
    end if;
    return new;
end
$$;
drop trigger if exists introductions_status_history on public.introductions;
create trigger introductions_status_history after insert or update of status
    on public.introductions for each row execute function public.record_introduction_status();

create or replace function public.touch_candidate_profile_activity()
returns trigger language plpgsql set search_path = ''
as $$
begin
    if row(
        new.professional_title, new.professional_summary, new.skills, new.years_experience,
        new.target_roles, new.target_seniority, new.target_industries, new.target_geography,
        new.location_region
    ) is distinct from row(
        old.professional_title, old.professional_summary, old.skills, old.years_experience,
        old.target_roles, old.target_seniority, old.target_industries, old.target_geography,
        old.location_region
    ) then
        new.last_activity_at := now();
    end if;
    return new;
end
$$;
drop trigger if exists candidate_profile_activity on public.candidate_profiles;
create trigger candidate_profile_activity
    before update of professional_title, professional_summary, skills, years_experience,
        target_roles, target_seniority, target_industries, target_geography, location_region
    on public.candidate_profiles
    for each row execute function public.touch_candidate_profile_activity();

create or replace function public.touch_candidate_private_activity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
    if row(
        new.legal_name, new.email, new.phone, new.expected_compensation,
        new.preferred_companies, new.career_objectives
    ) is distinct from row(
        old.legal_name, old.email, old.phone, old.expected_compensation,
        old.preferred_companies, old.career_objectives
    ) then
        update public.candidate_profiles
        set last_activity_at = now()
        where id = new.candidate_id;
    end if;
    return new;
end
$$;
drop trigger if exists candidate_private_activity on public.candidate_private;
create trigger candidate_private_activity
    before update of legal_name, email, phone, expected_compensation,
        preferred_companies, career_objectives
    on public.candidate_private
    for each row execute function public.touch_candidate_private_activity();

create table if not exists public.invoices (
    id uuid primary key default extensions.gen_random_uuid(),
    introduction_id uuid not null unique references public.introductions(id) on delete restrict,
    invoice_reference text not null unique,
    amount_minor bigint not null check (amount_minor >= 0),
    currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
    issued_at timestamptz,
    due_date date not null,
    status text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'past_due', 'void')),
    paid_at timestamptz,
    provider_payment_reference text,
    stripe_checkout_session_id text unique,
    stripe_checkout_idempotency_key text unique,
    notes text,
    created_by uuid references public.app_users(user_id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.invoices
    add column if not exists stripe_checkout_idempotency_key text unique;

create table if not exists public.payment_events (
    id uuid primary key default extensions.gen_random_uuid(),
    provider text not null,
    provider_event_id text not null,
    event_type text not null,
    processed_at timestamptz,
    processing_error text,
    received_at timestamptz not null default now(),
    unique (provider, provider_event_id)
);
create table if not exists public.payment_transactions (
    id uuid primary key default extensions.gen_random_uuid(),
    subscription_id uuid references public.subscriptions(id) on delete restrict,
    invoice_id uuid references public.invoices(id) on delete restrict,
    provider text not null,
    provider_transaction_id text not null,
    status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
    amount_minor bigint not null check (amount_minor >= 0),
    currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
    created_at timestamptz not null default now(),
    unique (provider, provider_transaction_id),
    check (subscription_id is not null or invoice_id is not null)
);
create table if not exists public.audit_events (
    id uuid primary key default extensions.gen_random_uuid(),
    actor_user_id uuid references public.app_users(user_id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);
create table if not exists public.background_job_runs (
    id uuid primary key default extensions.gen_random_uuid(),
    job_name text not null,
    status text not null check (status in ('running', 'succeeded', 'failed')),
    processed_count integer not null default 0 check (processed_count >= 0),
    failure_count integer not null default 0 check (failure_count >= 0),
    safe_error_summary text,
    started_at timestamptz not null default now(),
    finished_at timestamptz
);
create table if not exists public.email_delivery_events (
    id uuid primary key default extensions.gen_random_uuid(),
    idempotency_key text not null unique,
    recipient_user_id uuid references public.app_users(user_id) on delete set null,
    template_key text not null,
    provider_message_id text,
    status text not null check (status in ('queued', 'sent', 'failed')),
    safe_error_summary text,
    created_at timestamptz not null default now(),
    sent_at timestamptz
);
create table if not exists public.contact_leads (
    id uuid primary key default extensions.gen_random_uuid(),
    name text not null check (length(name) between 2 and 161),
    email text not null check (length(email) between 5 and 254),
    audience text not null
        check (audience in ('Senior Professional', 'Company / Hiring Team', 'Executive Search Firm', 'Other')),
    phone text,
    target_role text not null check (length(target_role) between 2 and 200),
    salary_range text,
    linkedin_url text,
    message text,
    company_name text,
    location_market text,
    target_seniority text,
    timeline text,
    requester_hash text not null check (requester_hash ~ '^[a-f0-9]{64}$'),
    created_at timestamptz not null default now()
);
create index if not exists contact_leads_requester_created_idx
    on public.contact_leads (requester_hash, created_at desc);

create or replace function public.submit_contact_lead(
    p_name text,
    p_email text,
    p_audience text,
    p_phone text,
    p_target_role text,
    p_salary_range text,
    p_linkedin_url text,
    p_message text,
    p_company_name text,
    p_location_market text,
    p_target_seniority text,
    p_timeline text,
    p_requester_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    recent_lead_count integer;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Contact submission is restricted';
    end if;
    if p_requester_hash !~ '^[a-f0-9]{64}$' then
        raise exception 'Contact requester hash is invalid';
    end if;
    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtext(p_requester_hash)
    );
    select count(*) into recent_lead_count
    from public.contact_leads
    where requester_hash = p_requester_hash
      and created_at >= now() - interval '15 minutes';
    if recent_lead_count >= 5 then
        return jsonb_build_object('accepted', false);
    end if;
    insert into public.contact_leads (
        name, email, audience, phone, target_role, salary_range, linkedin_url,
        message, company_name, location_market, target_seniority, timeline,
        requester_hash
    ) values (
        p_name, lower(p_email), p_audience, p_phone, p_target_role, p_salary_range,
        p_linkedin_url, p_message, p_company_name, p_location_market,
        p_target_seniority, p_timeline, p_requester_hash
    );
    return jsonb_build_object('accepted', true);
end
$$;
revoke all on function public.submit_contact_lead(
    text, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.submit_contact_lead(
    text, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

create or replace function public.draft_placement_invoice(
    p_introduction_id uuid,
    p_actor_id uuid,
    p_invoice_reference text
)
returns setof public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
    introduction_row public.introductions%rowtype;
    invoice_row public.invoices%rowtype;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Invoice drafting is restricted';
    end if;
    select * into introduction_row
    from public.introductions
    where id = p_introduction_id
    for update;
    if not found
        or introduction_row.status <> 'Placed'
        or introduction_row.placement_start_date is null
        or introduction_row.placement_fee_minor is null
        or introduction_row.invoice_due_date is null then
        return;
    end if;
    insert into public.invoices (
        introduction_id, invoice_reference, amount_minor, currency,
        due_date, status, created_by
    ) values (
        p_introduction_id, p_invoice_reference, introduction_row.placement_fee_minor,
        introduction_row.currency, introduction_row.invoice_due_date, 'draft', p_actor_id
    )
    on conflict (introduction_id) do nothing
    returning * into invoice_row;
    if not found then
        select * into invoice_row
        from public.invoices
        where introduction_id = p_introduction_id;
    else
        insert into public.audit_events (
            actor_user_id, action, entity_type, entity_id, metadata
        ) values (
            p_actor_id, 'placement_invoice_drafted', 'invoice', invoice_row.id,
            jsonb_build_object('introduction_id', p_introduction_id)
        );
    end if;
    return next invoice_row;
end
$$;
revoke all on function public.draft_placement_invoice(uuid, uuid, text)
    from public, anon, authenticated;
grant execute on function public.draft_placement_invoice(uuid, uuid, text)
    to service_role;

create or replace function public.issue_placement_invoice(
    p_invoice_id uuid,
    p_actor_id uuid
)
returns setof public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
    issued_invoice public.invoices%rowtype;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Invoice issuance is restricted';
    end if;
    update public.invoices
    set status = 'issued', issued_at = now(), updated_at = now()
    where id = p_invoice_id and status = 'draft'
    returning * into issued_invoice;
    if not found then
        return;
    end if;
    update public.introductions
    set payment_status = 'pending', updated_at = now()
    where id = issued_invoice.introduction_id;
    insert into public.audit_events (
        actor_user_id, action, entity_type, entity_id, metadata
    ) values (
        p_actor_id, 'placement_invoice_issued', 'invoice', p_invoice_id,
        jsonb_build_object('invoice_reference', issued_invoice.invoice_reference)
    );
    return next issued_invoice;
end
$$;
revoke all on function public.issue_placement_invoice(uuid, uuid)
    from public, anon, authenticated;
grant execute on function public.issue_placement_invoice(uuid, uuid)
    to service_role;

create or replace function public.reserve_stripe_invoice_checkout(p_invoice_id uuid)
returns setof public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
    invoice_row public.invoices%rowtype;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Invoice checkout reservation is restricted';
    end if;
    select * into invoice_row
    from public.invoices
    where id = p_invoice_id
    for update;
    if not found or invoice_row.status not in ('issued', 'past_due') then
        return;
    end if;
    if invoice_row.stripe_checkout_session_id is null
        and invoice_row.stripe_checkout_idempotency_key is null then
        update public.invoices
        set stripe_checkout_idempotency_key = extensions.gen_random_uuid()::text
        where id = p_invoice_id
        returning * into invoice_row;
    end if;
    return next invoice_row;
end
$$;
revoke all on function public.reserve_stripe_invoice_checkout(uuid)
    from public, anon, authenticated;
grant execute on function public.reserve_stripe_invoice_checkout(uuid)
    to service_role;

create or replace function public.process_stripe_webhook_event(
    p_event_id text,
    p_event_type text,
    p_payload jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    event_object jsonb := p_payload -> 'data' -> 'object';
    prior_processed_at timestamptz;
    stripe_subscription_id text;
    stripe_session_id text;
    stripe_customer_id text;
    stripe_status text;
    app_status text;
    period_start timestamptz;
    period_end timestamptz;
    plan_name text;
    candidate_key uuid;
    employer_key uuid;
    invoice_key uuid;
    invoice_row public.invoices%rowtype;
    introduction_key uuid;
    subscription_row_id uuid;
    affected_rows integer;
    payment_intent_id text;
    amount_total bigint;
    currency_code text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Billing event processing is restricted';
    end if;
    if p_event_id is null or p_event_type is null or event_object is null then
        raise exception 'Billing event is incomplete';
    end if;

    insert into public.payment_events (provider, provider_event_id, event_type)
    values ('stripe', p_event_id, p_event_type)
    on conflict (provider, provider_event_id) do nothing;
    select processed_at into prior_processed_at
    from public.payment_events
    where provider = 'stripe' and provider_event_id = p_event_id
    for update;
    if prior_processed_at is not null then
        return 'duplicate';
    end if;

    if p_event_type in (
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted'
    ) then
        stripe_subscription_id := event_object ->> 'id';
        stripe_customer_id := event_object ->> 'customer';
        plan_name := event_object -> 'metadata' ->> 'plan_key';
        candidate_key := nullif(event_object -> 'metadata' ->> 'candidate_id', '')::uuid;
        employer_key := nullif(event_object -> 'metadata' ->> 'employer_id', '')::uuid;
        stripe_status := event_object ->> 'status';
        period_start := case
            when coalesce(
                event_object ->> 'current_period_start',
                event_object -> 'items' -> 'data' -> 0 ->> 'current_period_start'
            ) is null then null
            else to_timestamp(coalesce(
                event_object ->> 'current_period_start',
                event_object -> 'items' -> 'data' -> 0 ->> 'current_period_start'
            )::double precision)
        end;
        period_end := case
            when coalesce(
                event_object ->> 'current_period_end',
                event_object -> 'items' -> 'data' -> 0 ->> 'current_period_end'
            ) is null then null
            else to_timestamp(coalesce(
                event_object ->> 'current_period_end',
                event_object -> 'items' -> 'data' -> 0 ->> 'current_period_end'
            )::double precision)
        end;
        app_status := case
            when p_event_type = 'customer.subscription.deleted' or stripe_status = 'canceled'
                then 'cancelled'
            when stripe_status in ('active', 'trialing') then 'active'
            when stripe_status in ('past_due', 'unpaid') then 'past_due'
            when stripe_status = 'paused' then 'suspended'
            when stripe_status in ('incomplete', 'incomplete_expired') then 'expired'
            else 'pending'
        end;
        if stripe_subscription_id is null or plan_name is null
            or ((candidate_key is not null) = (employer_key is not null))
            or not exists (
                select 1 from public.subscription_plans
                where plan_key = plan_name
                  and audience = case when candidate_key is not null then 'candidate' else 'employer' end
            ) then
            raise exception 'Stripe subscription metadata is incomplete';
        end if;
        update public.subscriptions
        set provider_subscription_id = stripe_subscription_id,
            status = app_status,
            provider_customer_id = coalesce(stripe_customer_id, provider_customer_id),
            current_period_start = coalesce(period_start, current_period_start),
            current_period_end = coalesce(period_end, current_period_end),
            cancelled_at = case when app_status = 'cancelled' then now() else null end
        where (
                provider_subscription_id = stripe_subscription_id
                and plan_key = plan_name
                and candidate_id is not distinct from candidate_key
                and employer_id is not distinct from employer_key
            )
           or (provider_subscription_id is null
               and plan_key = plan_name
               and candidate_id is not distinct from candidate_key
               and employer_id is not distinct from employer_key
               and status = 'pending');
        get diagnostics affected_rows = row_count;
        if affected_rows = 0 then
            insert into public.subscriptions (
                plan_key, candidate_id, employer_id, status, provider,
                provider_subscription_id, provider_customer_id,
                current_period_start, current_period_end, cancelled_at
            ) values (
                plan_name, candidate_key, employer_key, app_status, 'stripe',
                stripe_subscription_id, stripe_customer_id,
                period_start,
                period_end,
                case when app_status = 'cancelled' then now() else null end
            )
            on conflict (provider_subscription_id) do nothing;
        end if;
    elsif p_event_type in (
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed',
        'checkout.session.expired'
    ) then
        stripe_session_id := event_object ->> 'id';
        if event_object ->> 'mode' = 'subscription'
            and p_event_type <> 'checkout.session.expired' then
            stripe_subscription_id := event_object ->> 'subscription';
            stripe_customer_id := event_object ->> 'customer';
            plan_name := event_object -> 'metadata' ->> 'plan_key';
            candidate_key := nullif(event_object -> 'metadata' ->> 'candidate_id', '')::uuid;
            employer_key := nullif(event_object -> 'metadata' ->> 'employer_id', '')::uuid;
            if stripe_subscription_id is null or plan_name is null
                or ((candidate_key is not null) = (employer_key is not null))
                or not exists (
                    select 1 from public.subscription_plans
                    where plan_key = plan_name
                      and audience = case when candidate_key is not null then 'candidate' else 'employer' end
                ) then
                raise exception 'Stripe checkout metadata is incomplete';
            end if;
            update public.subscriptions
            set provider_subscription_id = stripe_subscription_id,
                provider_checkout_session_id = stripe_session_id,
                provider_customer_id = coalesce(stripe_customer_id, provider_customer_id)
            where provider = 'stripe'
              and status = 'pending'
              and provider_subscription_id is null
              and plan_key = plan_name
              and candidate_id is not distinct from candidate_key
              and employer_id is not distinct from employer_key;
            get diagnostics affected_rows = row_count;
            if affected_rows = 0 then
                insert into public.subscriptions (
                    plan_key, candidate_id, employer_id, status, provider,
                    provider_subscription_id, provider_customer_id, provider_checkout_session_id
                ) values (
                    plan_name, candidate_key, employer_key, 'pending', 'stripe',
                    stripe_subscription_id, stripe_customer_id, stripe_session_id
                )
                on conflict (provider_subscription_id) do update set
                    provider_checkout_session_id = excluded.provider_checkout_session_id,
                    provider_customer_id = coalesce(excluded.provider_customer_id, subscriptions.provider_customer_id);
            end if;
        elsif event_object ->> 'mode' = 'subscription'
            and p_event_type = 'checkout.session.expired' then
            update public.subscriptions
            set status = 'expired', provider_checkout_session_id = null
            where provider = 'stripe'
              and status = 'pending'
              and (
                  provider_checkout_session_id = stripe_session_id
                  or (
                      provider_checkout_session_id is null
                      and plan_key = event_object -> 'metadata' ->> 'plan_key'
                      and candidate_id is not distinct from nullif(
                          event_object -> 'metadata' ->> 'candidate_id', ''
                      )::uuid
                      and employer_id is not distinct from nullif(
                          event_object -> 'metadata' ->> 'employer_id', ''
                      )::uuid
                  )
              );
        elsif event_object ->> 'mode' = 'payment'
            and p_event_type in (
                'checkout.session.completed',
                'checkout.session.async_payment_succeeded'
            ) then
            invoice_key := nullif(event_object -> 'metadata' ->> 'invoice_id', '')::uuid;
            if invoice_key is null then
                raise exception 'Stripe invoice checkout metadata is incomplete';
            end if;
            select * into invoice_row
            from public.invoices
            where id = invoice_key
            for update;
            if not found then
                raise exception 'The invoice for this Stripe checkout was not found';
            end if;
            if invoice_row.stripe_checkout_session_id is not null
                and invoice_row.stripe_checkout_session_id <> stripe_session_id then
                raise exception 'The Stripe checkout does not match the invoice session';
            end if;
            if invoice_row.stripe_checkout_idempotency_key is not null
                and invoice_row.stripe_checkout_idempotency_key is distinct from
                    (event_object -> 'metadata' ->> 'checkout_reservation') then
                raise exception 'The Stripe checkout reservation does not match the invoice';
            end if;
            if invoice_row.status not in ('issued', 'past_due', 'paid') then
                raise exception 'The invoice is not eligible for payment';
            end if;
            amount_total := nullif(event_object ->> 'amount_total', '')::bigint;
            currency_code := event_object ->> 'currency';
            if event_object ->> 'payment_status' = 'paid' then
                if amount_total is distinct from invoice_row.amount_minor
                    or upper(coalesce(currency_code, '')) <> invoice_row.currency then
                    raise exception 'Stripe invoice amount or currency does not match';
                end if;
                payment_intent_id := coalesce(event_object ->> 'payment_intent', stripe_session_id);
                update public.invoices
                set status = 'paid', paid_at = coalesce(paid_at, now()),
                    provider_payment_reference = payment_intent_id,
                    stripe_checkout_session_id = coalesce(stripe_checkout_session_id, stripe_session_id)
                where id = invoice_key and status in ('issued', 'past_due', 'paid')
                returning introduction_id into introduction_key;
                if not found then
                    raise exception 'The invoice is no longer eligible for payment';
                end if;
                update public.introductions
                set payment_status = 'paid'
                where id = introduction_key;
                insert into public.payment_transactions (
                    invoice_id, provider, provider_transaction_id, status, amount_minor, currency
                ) values (
                    invoice_key, 'stripe', payment_intent_id, 'succeeded',
                    invoice_row.amount_minor, invoice_row.currency
                )
                on conflict (provider, provider_transaction_id) do nothing;
            end if;
        elsif event_object ->> 'mode' = 'payment'
            and p_event_type in ('checkout.session.async_payment_failed', 'checkout.session.expired') then
            invoice_key := nullif(event_object -> 'metadata' ->> 'invoice_id', '')::uuid;
            if invoice_key is null then
                raise exception 'Stripe invoice checkout metadata is incomplete';
            end if;
            select introduction_id into introduction_key
            from public.invoices
            where id = invoice_key
            for update;
            if not found then
                raise exception 'The invoice for this Stripe checkout was not found';
            end if;
            if invoice_row.stripe_checkout_idempotency_key is not null
                and invoice_row.stripe_checkout_idempotency_key is distinct from
                    (event_object -> 'metadata' ->> 'checkout_reservation') then
                raise exception 'The Stripe checkout reservation does not match the invoice';
            end if;
            if p_event_type = 'checkout.session.async_payment_failed' then
                update public.invoices
                set status = 'past_due',
                    stripe_checkout_session_id = null,
                    stripe_checkout_idempotency_key = null
                where id = invoice_key
                  and status in ('issued', 'past_due')
                  and (stripe_checkout_session_id is null
                    or stripe_checkout_session_id = event_object ->> 'id');
                if found then
                    update public.introductions set payment_status = 'past_due'
                    where id = introduction_key;
                end if;
            else
                update public.invoices
                set stripe_checkout_session_id = null,
                    stripe_checkout_idempotency_key = null
                where id = invoice_key
                  and status in ('issued', 'past_due')
                  and (stripe_checkout_session_id is null
                    or stripe_checkout_session_id = event_object ->> 'id');
            end if;
        end if;
    elsif p_event_type in ('invoice.payment_failed', 'invoice.payment_succeeded', 'invoice.paid') then
        stripe_subscription_id := coalesce(
            event_object ->> 'subscription',
            event_object -> 'parent' -> 'subscription_details' ->> 'subscription'
        );
        if stripe_subscription_id is not null then
            select id into subscription_row_id
            from public.subscriptions
            where provider = 'stripe'
              and provider_subscription_id = stripe_subscription_id
              and status <> 'cancelled'
            for update;
        end if;
        if subscription_row_id is not null then
            update public.subscriptions
            set status = case when p_event_type = 'invoice.payment_failed' then 'past_due' else 'active' end
            where id = subscription_row_id;
            if p_event_type in ('invoice.payment_succeeded', 'invoice.paid') then
                amount_total := nullif(event_object ->> 'amount_paid', '')::bigint;
                currency_code := event_object ->> 'currency';
                payment_intent_id := coalesce(event_object ->> 'payment_intent', event_object ->> 'id');
                if amount_total is not null and currency_code is not null
                    and payment_intent_id is not null then
                    insert into public.payment_transactions (
                        subscription_id, provider, provider_transaction_id,
                        status, amount_minor, currency
                    ) values (
                        subscription_row_id, 'stripe', payment_intent_id,
                        'succeeded', amount_total, upper(currency_code)
                    )
                    on conflict (provider, provider_transaction_id) do nothing;
                end if;
            end if;
        end if;
    end if;

    update public.payment_events
    set processed_at = now(), processing_error = null
    where provider = 'stripe' and provider_event_id = p_event_id;
    return 'processed';
end
$$;
revoke all on function public.process_stripe_webhook_event(text, text, jsonb)
    from public, anon, authenticated;
grant execute on function public.process_stripe_webhook_event(text, text, jsonb)
    to service_role;

create or replace function public.prevent_public_id_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
    if new.public_id is distinct from old.public_id then
        raise exception 'Public identifiers are immutable';
    end if;
    return new;
end
$$;
drop trigger if exists candidate_public_id_immutable on public.candidate_profiles;
create trigger candidate_public_id_immutable before update of public_id on public.candidate_profiles
    for each row execute function public.prevent_public_id_change();
drop trigger if exists employer_public_id_immutable on public.employers;
create trigger employer_public_id_immutable before update of public_id on public.employers
    for each row execute function public.prevent_public_id_change();

do $$
declare table_name text;
begin
    foreach table_name in array array[
        'app_users', 'candidate_profiles', 'candidate_private', 'employers',
        'employer_memberships', 'company_verification_records', 'subscription_plans',
        'commercial_settings',
        'subscriptions', 'cv_files', 'introductions', 'introduction_history',
        'invoices', 'payment_events', 'payment_transactions', 'audit_events',
        'background_job_runs', 'email_delivery_events', 'contact_leads'
    ] loop
        execute format('alter table public.%I enable row level security', table_name);
    end loop;
end
$$;

do $$
declare policy_row record;
begin
    for policy_row in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = any(array[
              'app_users', 'candidate_profiles', 'candidate_private', 'employers',
              'employer_memberships', 'company_verification_records',
              'subscription_plans', 'commercial_settings', 'subscriptions',
              'cv_files', 'introductions', 'introduction_history', 'invoices',
              'payment_events', 'payment_transactions', 'audit_events',
              'background_job_runs', 'email_delivery_events', 'contact_leads'
          ])
    loop
        execute format('drop policy %I on %I.%I',
            policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    end loop;
end
$$;

create policy app_users_read_self_or_admin on public.app_users for select to authenticated
    using (user_id = (select auth.uid()) or (select public.is_app_admin()));
create policy candidates_read_self_or_admin on public.candidate_profiles for select to authenticated
    using (user_id = (select auth.uid()) or (select public.is_app_admin()));
create policy candidates_update_self_nonprivileged on public.candidate_profiles for update to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()) and vetting_status = 'pending'
        and badge_approved = false and directory_visible = false);
create policy candidates_admin_all on public.candidate_profiles for all to authenticated
    using ((select public.is_app_admin())) with check ((select public.is_app_admin()));

create policy candidate_private_read_self_or_admin on public.candidate_private for select to authenticated
    using ((select public.is_app_admin()) or exists (
        select 1 from public.candidate_profiles cp
        where cp.id = candidate_id and cp.user_id = (select auth.uid())
    ));
create policy candidate_private_update_self_or_admin on public.candidate_private for update to authenticated
    using ((select public.is_app_admin()) or exists (
        select 1 from public.candidate_profiles cp
        where cp.id = candidate_id and cp.user_id = (select auth.uid())
    ))
    with check ((select public.is_app_admin()) or exists (
        select 1 from public.candidate_profiles cp
        where cp.id = candidate_id and cp.user_id = (select auth.uid())
    ));
create policy employer_memberships_read_self_or_admin on public.employer_memberships for select to authenticated
    using (user_id = (select auth.uid()) or (select public.is_app_admin()));
create policy employers_read_member_or_admin on public.employers for select to authenticated
    using ((select public.is_app_admin()) or exists (
        select 1 from public.employer_memberships em
        where em.employer_id = id and em.user_id = (select auth.uid())
    ));
create policy employers_update_owner_or_admin on public.employers for update to authenticated
    using ((select public.is_app_admin()) or exists (
        select 1 from public.employer_memberships em
        where em.employer_id = id and em.user_id = (select auth.uid()) and em.membership_role = 'owner'
    ))
    with check ((select public.is_app_admin()) or (
        verification_status = 'pending' and verified_at is null and verification_notes is null
        and subscription_status = 'inactive' and exists (
            select 1 from public.employer_memberships em
            where em.employer_id = id and em.user_id = (select auth.uid()) and em.membership_role = 'owner'
        )
    ));
create policy verification_read_admin_only on public.company_verification_records for select to authenticated
    using ((select public.is_app_admin()));

create policy subscription_plans_read_active on public.subscription_plans for select to anon, authenticated
    using (active);
create policy commercial_settings_admin_only on public.commercial_settings for select to authenticated
    using ((select public.is_app_admin()));
create policy subscriptions_read_owner_or_admin on public.subscriptions for select to authenticated
    using ((select public.is_app_admin())
        or exists (select 1 from public.candidate_profiles cp
            where cp.id = candidate_id and cp.user_id = (select auth.uid()))
        or exists (select 1 from public.employer_memberships em
            where em.employer_id = subscriptions.employer_id and em.user_id = (select auth.uid())));
create policy cv_files_read_owner_or_admin on public.cv_files for select to authenticated
    using ((select public.is_app_admin()) or exists (
        select 1 from public.candidate_profiles cp
        where cp.id = candidate_id and cp.user_id = (select auth.uid())
    ));

create policy introductions_admin_only on public.introductions for all to authenticated
    using ((select public.is_app_admin())) with check ((select public.is_app_admin()));
create policy introduction_history_admin_only on public.introduction_history for select to authenticated
    using ((select public.is_app_admin()));
create policy invoices_admin_only on public.invoices for all to authenticated
    using ((select public.is_app_admin())) with check ((select public.is_app_admin()));
create policy payment_events_admin_only on public.payment_events for all to authenticated
    using ((select public.is_app_admin())) with check ((select public.is_app_admin()));
create policy payment_transactions_admin_only on public.payment_transactions for select to authenticated
    using ((select public.is_app_admin()));
create policy audit_events_admin_only on public.audit_events for select to authenticated
    using ((select public.is_app_admin()));
create policy background_jobs_admin_only on public.background_job_runs for select to authenticated
    using ((select public.is_app_admin()));
create policy email_events_admin_only on public.email_delivery_events for select to authenticated
    using ((select public.is_app_admin()));
create policy contact_leads_admin_only on public.contact_leads for select to authenticated
    using ((select public.is_app_admin()));

revoke all privileges on all tables in schema public from anon, authenticated;
grant select on public.app_users, public.candidate_profiles, public.employer_memberships,
    public.cv_files, public.introductions, public.introduction_history,
    public.invoices, public.payment_events, public.payment_transactions, public.audit_events,
    public.background_job_runs, public.email_delivery_events, public.contact_leads
    to authenticated;
grant select on public.subscription_plans to anon, authenticated;
grant select (
    candidate_id, legal_name, email, phone, expected_compensation, preferred_companies,
    career_objectives, consent_record, created_at, updated_at
) on public.candidate_private to authenticated;
grant select (
    id, public_id, company_name, corporate_email, website, description, target_roles,
    target_seniority, target_geography, target_industries, verification_status,
    verified_at, subscription_status, created_at, updated_at
) on public.employers to authenticated;
grant select (
    id, employer_id, status, reviewer_user_id, reviewed_at, created_at
) on public.company_verification_records to authenticated;
grant select (
    id, plan_key, candidate_id, employer_id, status, current_period_start,
    current_period_end, cancelled_at, created_at, updated_at
) on public.subscriptions to authenticated;
grant update (
    professional_title, professional_summary, skills, years_experience, target_roles,
    target_seniority, target_industries, target_geography, location_region
) on public.candidate_profiles to authenticated;
grant update (
    legal_name, phone, expected_compensation, preferred_companies, career_objectives
) on public.candidate_private to authenticated;
grant update (
    company_name, website, description, target_roles, target_seniority,
    target_geography, target_industries
) on public.employers to authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke all on function public.current_app_role() from public, anon, authenticated;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

do $$
declare table_name text;
begin
    foreach table_name in array array[
        'candidate_profiles', 'candidate_private', 'employers', 'subscription_plans',
        'subscriptions', 'cv_files', 'introductions', 'invoices'
    ] loop
        execute format('drop trigger if exists set_updated_at on public.%I', table_name);
        execute format('create trigger set_updated_at before update on public.%I '
            'for each row execute function public.set_updated_at()', table_name);
    end loop;
end
$$;

-- The bucket is private. Path convention is <auth-user-uuid>/<opaque-file-uuid>.pdf.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-cvs', 'candidate-cvs', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf'];
drop policy if exists candidate_cv_read_own on storage.objects;
drop policy if exists candidate_cv_insert_own on storage.objects;
drop policy if exists candidate_cv_update_own on storage.objects;
drop policy if exists candidate_cv_delete_own on storage.objects;
create policy candidate_cv_read_own on storage.objects for select to authenticated
    using (bucket_id = 'candidate-cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy candidate_cv_insert_own on storage.objects for insert to authenticated
    with check (bucket_id = 'candidate-cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy candidate_cv_update_own on storage.objects for update to authenticated
    using (bucket_id = 'candidate-cvs' and (storage.foldername(name))[1] = (select auth.uid())::text)
    with check (bucket_id = 'candidate-cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy candidate_cv_delete_own on storage.objects for delete to authenticated
    using (bucket_id = 'candidate-cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);