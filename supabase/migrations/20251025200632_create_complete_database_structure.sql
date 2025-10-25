/*
  # Create complete OpticAI database structure

  1. New Tables
    - `tenants` - optical stores
    - `profiles` - user profiles linked to tenants
    - `tenant_counters` - OS number counters per tenant
    - `ordens` - service orders (OS)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Important Notes
    - Complete structure for optical store management system
    - Includes order tracking with arrival status
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  endereco text,
  telefone text,
  numero text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role text DEFAULT 'staff',
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create tenant_counters table
CREATE TABLE IF NOT EXISTS public.tenant_counters (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  last_num_os integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create ordens table
CREATE TABLE IF NOT EXISTS public.ordens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  num_os integer NOT NULL,
  cliente_nome text NOT NULL,
  telefone_cliente text NOT NULL,
  cpf text,
  endereco text,
  data_nascimento date,
  data_venda date NOT NULL,
  data_entrega date,
  data_chegada_real timestamptz,
  valor_total numeric(10,2),
  forma_pagamento text,
  credito_parcelas integer,
  status_pagamento text,
  esf_od text,
  cil_od text,
  eixo_od text,
  esf_oe text,
  cil_oe text,
  eixo_oe text,
  adicao text,
  tipo_lente text NOT NULL,
  descricao_lente text,
  observacao text,
  descricao_pedido text,
  observacao_cliente text,
  dnp_od text,
  dnp_oe text,
  altura_od text,
  altura_oe text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, num_os)
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens ENABLE ROW LEVEL SECURITY;

-- Policies for tenants
CREATE POLICY "Users can view own tenant"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant"
  ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for tenant_counters
CREATE POLICY "Users can view own tenant counter"
  ON public.tenant_counters
  FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant counter"
  ON public.tenant_counters
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant counter"
  ON public.tenant_counters
  FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policies for ordens
CREATE POLICY "Users can view own tenant orders"
  ON public.ordens
  FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant orders"
  ON public.ordens
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant orders"
  ON public.ordens
  FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tenant orders"
  ON public.ordens
  FOR DELETE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ordens_tenant_id ON public.ordens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ordens_num_os ON public.ordens(tenant_id, num_os DESC);
CREATE INDEX IF NOT EXISTS idx_ordens_data_entrega ON public.ordens(data_entrega);
CREATE INDEX IF NOT EXISTS idx_ordens_data_chegada_real ON public.ordens(data_chegada_real);

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