-- Explicitly grant access to service_role to ensure scripts work
-- This should not be necessary if the key has bypassrls, but solves 'permission denied' 42501 errors

create policy "Service Role Full Access Subscriptions"
  on public.subscriptions
  for all
  to service_role
  using (true)
  with check (true);

create policy "Service Role Full Access Profiles"
  on public.profiles
  for all
  to service_role
  using (true)
  with check (true);
