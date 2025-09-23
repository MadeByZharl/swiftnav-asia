-- Update employee roles to use specific worker types
CREATE TYPE public.employee_role AS ENUM ('admin', 'china_worker', 'kz_worker');

-- Add constraint to use the new enum for employee roles
ALTER TABLE public.employees ALTER COLUMN role TYPE employee_role USING role::employee_role;

-- Insert sample admin user (password will be hashed in auth)
INSERT INTO public.employees (name, email, phone, role, user_id) VALUES 
('Admin User', 'admin@khancargo.com', '+77001112233', 'admin', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (email) DO NOTHING;