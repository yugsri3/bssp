-- Public donation submissions can never mark themselves as paid.
create or replace function public.force_pending_donation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := 'pending';
  return new;
end;
$$;

drop trigger if exists donation_submissions_force_pending on public.donation_submissions;
create trigger donation_submissions_force_pending
before insert on public.donation_submissions
for each row execute function public.force_pending_donation();

alter table public.donation_submissions enable row level security;

-- The public site may submit donation records, but cannot edit or delete them.
drop policy if exists "Public can insert pending donations" on public.donation_submissions;
create policy "Public can insert pending donations"
on public.donation_submissions
for insert
to anon, authenticated
with check (status = 'pending');

revoke update, delete on table public.donation_submissions from anon;
revoke update, delete on table public.donation_submissions from authenticated;
