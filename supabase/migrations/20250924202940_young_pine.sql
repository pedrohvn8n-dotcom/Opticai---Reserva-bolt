/*
  # Create tenant_counters table

  1. New Tables
    - `tenant_counters`
      - `tenant_id` (uuid, primary key, foreign key to tenants.id)
      - `last_num_os` (integer, default 0) - tracks the last used OS number for each tenant
      - `created_at` (timestamp) - when the counter was created
      - `updated_at` (timestamp) - when the counter was last updated

  2. Security
    - Enable RLS on `tenant_counters` table
    - Add policy for authenticated users to read/update their tenant's counter
    - Add policy for service role to have full access

  3. Functions
    - Create function to get next OS number atomically
    - Create function to initialize counter for new tenants
*/

-- Create the tenant_counters table
CREATE TABLE IF NOT EXISTS public.tenant_counters (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  last_num_os integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tenant_counters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "tenant_counters_select_own"
  ON public.tenant_counters
  FOR SELECT
  TO authenticated
  USING (tenant_id = (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "tenant_counters_update_own"
  ON public.tenant_counters
  FOR UPDATE
  TO authenticated
  USING (tenant_id = (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  ))
  WITH CHECK (tenant_id = (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "tenant_counters_insert_own"
  ON public.tenant_counters
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  ));

-- Service role policy for full access
CREATE POLICY "tenant_counters_service_role_all"
  ON public.tenant_counters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to get next OS number atomically
CREATE OR REPLACE FUNCTION get_next_os_number(p_tenant_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
BEGIN
  -- Insert or update the counter atomically
  INSERT INTO public.tenant_counters (tenant_id, last_num_os, updated_at)
  VALUES (p_tenant_id, 1, now())
  ON CONFLICT (tenant_id)
  DO UPDATE SET 
    last_num_os = tenant_counters.last_num_os + 1,
    updated_at = now()
  RETURNING last_num_os INTO next_num;
  
  RETURN next_num;
END;
$$;

-- Function to initialize counter for existing tenants
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants LOOP
    INSERT INTO public.tenant_counters (tenant_id, last_num_os)
    VALUES (tenant_record.id, 0)
    ON CONFLICT (tenant_id) DO NOTHING;
  END LOOP;
END;
$$;