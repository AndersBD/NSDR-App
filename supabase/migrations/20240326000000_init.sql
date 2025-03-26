-- Create meditations table
create table "public"."meditations" (
  "id" serial primary key,
  "title" text not null,
  "duration" integer not null,
  "file_name" text not null,
  "file_url" text not null,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feedback table
create table "public"."feedback" (
  "id" serial primary key,
  "user_id" uuid references auth.users(id),
  "meditation_id" integer references meditations(id),
  "wellbeing_change" integer not null check (wellbeing_change between -2 and 2),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) policies
alter table "public"."meditations" enable row level security;
alter table "public"."feedback" enable row level security;

-- Meditations policies (readable by everyone, writable by authenticated users)
create policy "Meditations are viewable by everyone"
  on "public"."meditations"
  for select
  using (true);

create policy "Meditations are insertable by authenticated users only"
  on "public"."meditations"
  for insert
  with check (auth.role() = 'authenticated');

-- Feedback policies
create policy "Feedback is insertable by anyone"
  on "public"."feedback"
  for insert
  with check (true);

create policy "Users can read their own feedback"
  on "public"."feedback"
  for select
  using (auth.uid() = user_id);
