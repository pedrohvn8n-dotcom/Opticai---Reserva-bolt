/*
  # Add status_pagamento field to orders_service table

  1. Changes
    - Add `status_pagamento` column to `orders_service` table
      - Type: text
      - Default: 'a_pagar_entrega'
      - Allows storing payment status: 'pago', 'a_pagar_entrega', or custom text
  
  2. Important Notes
    - This field tracks whether payment has been completed
    - Options: 'pago' (Paid), 'a_pagar_entrega' (To pay on delivery), or custom text
    - Field is optional and can be left empty
*/

-- Check if orders_service table exists, if not create basic structure
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders_service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  num_os integer NOT NULL,
  data_venda date NOT NULL,
  data_entrega date,
  cliente_nome text NOT NULL,
  cliente_telefone text,
  valor_total numeric(10,2) DEFAULT 0,
  forma_pagamento text,
  credito_parcelas text,
  descricao_pedido text,
  observacao_cliente text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add status_pagamento column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders_service'
    AND column_name = 'status_pagamento'
  ) THEN
    ALTER TABLE public.orders_service 
    ADD COLUMN status_pagamento text DEFAULT 'a_pagar_entrega';
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_service ENABLE ROW LEVEL SECURITY;

-- Create tenant_counters table
CREATE TABLE IF NOT EXISTS public.tenant_counters (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  last_num_os integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tenant_counters ENABLE ROW LEVEL SECURITY;

-- Policies for tenants
CREATE POLICY "Users can view own tenant" 
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for orders_service
CREATE POLICY "Users can view own tenant orders" 
  ON public.orders_service FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant orders" 
  ON public.orders_service FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant orders" 
  ON public.orders_service FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tenant orders" 
  ON public.orders_service FOR DELETE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policies for tenant_counters
CREATE POLICY "Users can view own tenant counter" 
  ON public.tenant_counters FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant counter" 
  ON public.tenant_counters FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant counter" 
  ON public.tenant_counters FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Function to get next OS number atomically
CREATE OR REPLACE FUNCTION get_next_os_number(p_tenant_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
BEGIN
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