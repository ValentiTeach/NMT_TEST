// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

// ⚠️ ЗАМІНІТЬ ЦІ ЗНАЧЕННЯ НА ВАШІ!
const supabaseUrl = 'https://gyzqzztcflscyrtryfky.supabase.co'
const supabaseAnonKey = 'sb_publishable_1fLXLyvMfHUzWfw85eLxjw_tkFonVjF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
