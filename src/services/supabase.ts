import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcodzafdzfqigdagwfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY29kemFmZHpmcWlnZGFnd2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTE3MjMsImV4cCI6MjA5MjQyNzcyM30.yXlX4nk0wBhtKSxUtANWEaGmBf3mVnGm2Qk0hXdQEtE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
