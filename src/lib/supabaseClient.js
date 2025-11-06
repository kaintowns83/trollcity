import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://piyzvrgtspdxhtxcbiwi.supabase.co'
const supabaseKey = 'sb_publishable_alWM4_ElwByRkhGmbu0OrQ_wOGy5Fyo' 

export const supabase = createClient(supabaseUrl, supabaseKey)
