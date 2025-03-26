// Environment configuration with type safety
const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY as string,
};

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set.'
  );
}

export default env;
