CREATE TABLE IF NOT EXISTS public.system_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.system_settings FOR SELECT USING (true);

INSERT INTO public.system_settings (key, value) VALUES ('admin_password', '40371898870')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;