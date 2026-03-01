import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jjttzlyxiumjnilqufpi.supabase.co';
const supabaseAnonKey = 'sb_publishable_Qdv0dQ7oA9TU-3VBnguP6Q_fgHJw6e-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
