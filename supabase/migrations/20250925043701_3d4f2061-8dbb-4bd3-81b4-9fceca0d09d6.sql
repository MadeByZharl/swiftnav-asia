-- Update employee roles according to specifications
-- Add branch_worker role and remove kz_worker

-- First check if we need to update existing data
UPDATE employees 
SET role = 'branch_worker' 
WHERE role = 'kz_worker';

-- Now let's make sure the role constraint allows the correct values
-- We'll need to drop and recreate any check constraints if they exist
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;

-- Add proper check constraint for roles
ALTER TABLE employees 
ADD CONSTRAINT employees_role_check 
CHECK (role IN ('admin', 'china_worker', 'branch_worker'));