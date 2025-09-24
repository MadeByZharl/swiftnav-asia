-- Update database structure according to requirements

-- First, update employees table with new roles
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS login VARCHAR(100),
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add unique constraint to login if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_login_key') THEN
        ALTER TABLE employees ADD CONSTRAINT employees_login_key UNIQUE (login);
    END IF;
END
$$;

-- Add two_gis_link to branches
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS two_gis_link VARCHAR(255),
ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Add unique constraint to branches code
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branches_code_key') THEN
        ALTER TABLE branches ADD CONSTRAINT branches_code_key UNIQUE (code);
    END IF;
END
$$;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  name VARCHAR(150),
  phone VARCHAR(30),
  city VARCHAR(100),
  client_code INTEGER UNIQUE,
  language VARCHAR(10) DEFAULT 'ru',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update orders table structure
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ALTER COLUMN user_id DROP NOT NULL;

-- Create order_history table
CREATE TABLE IF NOT EXISTS order_history (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES employees(id),
  note TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(12,2),
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  action VARCHAR(100),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_track_number ON orders(track_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_employee_id ON audit_logs(employee_id);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Enable RLS on new tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Everyone can view clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Admins and china workers can manage clients" ON clients 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND e.role IN ('admin', 'china_worker')
  )
);

-- RLS policies for order_history
CREATE POLICY "Everyone can view order history" ON order_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert order history" ON order_history 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM employees e WHERE e.user_id = auth.uid())
);

-- RLS policies for payments
CREATE POLICY "Everyone can view payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Admins can manage payments" ON payments 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND e.role = 'admin'
  )
);

-- RLS policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND e.role = 'admin'
  )
);
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM employees e WHERE e.user_id = auth.uid())
);