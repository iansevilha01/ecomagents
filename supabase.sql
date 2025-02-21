-- First, temporarily disable the check constraint if it exists
ALTER TABLE IF EXISTS public.profiles 
DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Update existing records first
UPDATE public.profiles
SET plan = 'operacional'
WHERE plan NOT IN ('operacional', 'gerencial', 'executivo');

-- Now add the check constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('operacional', 'gerencial', 'executivo'));

-- Set the default value for plan
ALTER TABLE public.profiles
ALTER COLUMN plan SET DEFAULT 'operacional';

-- Update credits limits for existing users based on their plans
UPDATE public.profiles
SET credits_limit = 
  CASE 
    WHEN plan = 'operacional' THEN 25000
    WHEN plan = 'gerencial' THEN 50000
    WHEN plan = 'executivo' THEN 100000
    ELSE 25000
  END;

-- Create or replace function to check credits limit
CREATE OR REPLACE FUNCTION check_credits_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.credits_used > NEW.credits_limit THEN
    RAISE EXCEPTION 'Limite de créditos excedido';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for credits limit
DROP TRIGGER IF EXISTS check_credits_limit_trigger ON profiles;
CREATE TRIGGER check_credits_limit_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_credits_limit();

-- Create or replace function to automatically set credits limit based on plan
CREATE OR REPLACE FUNCTION update_credits_limit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.credits_limit := 
    CASE 
      WHEN NEW.plan = 'operacional' THEN 25000
      WHEN NEW.plan = 'gerencial' THEN 50000
      WHEN NEW.plan = 'executivo' THEN 100000
      ELSE 25000
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for updating credits limit
DROP TRIGGER IF EXISTS update_credits_limit_trigger ON profiles;
CREATE TRIGGER update_credits_limit_trigger
  BEFORE INSERT OR UPDATE OF plan ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_limit();
