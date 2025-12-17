
export default function SetupPage() {
    return (
        <div className="p-8 max-w-3xl mx-auto bg-slate-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-rose-500">Database Setup</h1>
            <p className="mb-4">Since we cannot run SQL directly from the browser easily without Supabase admin rights here, please run the following SQL in your Supabase Dashboard SQL Editor:</p>

            <div className="bg-black p-4 rounded-lg overflow-x-auto border border-slate-700">
                <pre className="text-xs text-green-400">
                    {`-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'subscriber'
);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  status text default 'inactive',
  end_date timestamptz
);

-- RLS
alter table public.profiles enable row level security;
create policy "Public profiles" on public.profiles for select using (true);
`}
                </pre>
            </div>
            <p className="mt-4 text-sm text-slate-400">Copy the full schema from the artifact provided earlier.</p>
        </div>
    );
}
