import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ednspguthfefhtpzmnbf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbnNwZ3V0aGZlZmh0cHptbmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTI5MjgsImV4cCI6MjA5NTUyODkyOH0.iJihzd3sHpF5Dlx9s5UckAp8yP7ddWVbnOmB5mAhMOM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
