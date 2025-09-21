-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'china_worker', 'branch_worker')),
  branch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL,
  track_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for employees.branch_id
ALTER TABLE public.employees ADD CONSTRAINT fk_employees_branch 
FOREIGN KEY (branch_id) REFERENCES public.branches(id);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Admins can view all employees" 
ON public.employees FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.user_id = auth.uid() AND e.role = 'admin'
  )
);

CREATE POLICY "Users can view their own employee record" 
ON public.employees FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert employees" 
ON public.employees FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.user_id = auth.uid() AND e.role = 'admin'
  )
);

CREATE POLICY "Admins can update employees" 
ON public.employees FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.user_id = auth.uid() AND e.role = 'admin'
  )
);

CREATE POLICY "Users can update their own employee record" 
ON public.employees FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for branches
CREATE POLICY "Everyone can view branches" 
ON public.branches FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage branches" 
ON public.branches FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.user_id = auth.uid() AND e.role = 'admin'
  )
);

-- RLS Policies for orders
CREATE POLICY "Everyone can view orders" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Everyone can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update orders" 
ON public.orders FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.branches (name, city, address, phone) VALUES
('Алматы', 'Almaty', 'ул. Абая, 123', '+77001234567'),
('Караганда', 'Karaganda', 'ул. Бухар жырау, 50', '+77007654321');

-- Insert sample orders
INSERT INTO public.orders (user_id, track_number, status, branch_id, history) 
SELECT 
  1001,
  'YT8793828551429',
  'Прибыл в филиал Almaty',
  b.id,
  '[
    {"stage": "Добавлен трек в боте", "date": "2025-09-14"},
    {"stage": "Прибыл в Китай", "date": "2025-09-15"},
    {"stage": "Прибыл в филиал Almaty", "date": "2025-09-20"}
  ]'::jsonb
FROM public.branches b WHERE b.city = 'Almaty' LIMIT 1;