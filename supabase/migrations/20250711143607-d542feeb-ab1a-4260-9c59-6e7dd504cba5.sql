
-- Criar tabela de organizações/tenants
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de membros da organização
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Atualizar tabela de perfis para incluir organização atual
ALTER TABLE public.profiles 
ADD COLUMN current_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Atualizar todas as tabelas existentes para incluir organization_id
ALTER TABLE public.categories 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.budgets 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para organizations
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organization" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas RLS para organization_members
CREATE POLICY "Users can view members of their organizations" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners and admins can manage members" ON public.organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Atualizar políticas RLS existentes para incluir organization_id
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view categories in their organizations" ON public.categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create categories in their organizations" ON public.categories
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update categories in their organizations" ON public.categories
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete categories in their organizations" ON public.categories
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Atualizar políticas para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view transactions in their organizations" ON public.transactions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions in their organizations" ON public.transactions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in their organizations" ON public.transactions
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in their organizations" ON public.transactions
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Atualizar políticas para budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can create own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view budgets in their organizations" ON public.budgets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create budgets in their organizations" ON public.budgets
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update budgets in their organizations" ON public.budgets
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete budgets in their organizations" ON public.budgets
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Função para criar organização padrão quando usuário se registra
CREATE OR REPLACE FUNCTION public.create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Criar organização padrão
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(NEW.first_name, 'Meu') || ' Negócio',
    'org-' || LOWER(REPLACE(NEW.id::text, '-', ''))
  )
  RETURNING id INTO org_id;
  
  -- Adicionar usuário como owner da organização
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');
  
  -- Definir como organização atual do usuário
  UPDATE public.profiles 
  SET current_organization_id = org_id 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para criar organização padrão
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_organization();

-- Atualizar função de categorias padrão para incluir organization_id
CREATE OR REPLACE FUNCTION public.create_default_categories_with_org()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Obter organização atual do usuário
  SELECT current_organization_id INTO org_id
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  IF org_id IS NOT NULL THEN
    -- Categorias de despesa
    INSERT INTO public.categories (name, type, color, user_id, organization_id) VALUES
      ('Alimentação', 'expense', '#ef4444', NEW.user_id, org_id),
      ('Transporte', 'expense', '#f97316', NEW.user_id, org_id),
      ('Moradia', 'expense', '#eab308', NEW.user_id, org_id),
      ('Saúde', 'expense', '#84cc16', NEW.user_id, org_id),
      ('Educação', 'expense', '#06b6d4', NEW.user_id, org_id),
      ('Lazer', 'expense', '#8b5cf6', NEW.user_id, org_id),
      ('Roupas', 'expense', '#ec4899', NEW.user_id, org_id),
      ('Outros', 'expense', '#64748b', NEW.user_id, org_id);
    
    -- Categorias de receita
    INSERT INTO public.categories (name, type, color, user_id, organization_id) VALUES
      ('Salário', 'income', '#22c55e', NEW.user_id, org_id),
      ('Freelance', 'income', '#10b981', NEW.user_id, org_id),
      ('Investimentos', 'income', '#059669', NEW.user_id, org_id),
      ('Outros', 'income', '#047857', NEW.user_id, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para criar categorias com organização
DROP TRIGGER IF EXISTS on_organization_member_added ON public.organization_members;
CREATE TRIGGER on_organization_member_added
  AFTER INSERT ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories_with_org();

-- Função para atualizar spent_amount nos orçamentos considerando organização
CREATE OR REPLACE FUNCTION public.update_budget_spent_amount_multi_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o valor gasto no orçamento correspondente
  UPDATE public.budgets 
  SET spent_amount = (
    SELECT COALESCE(SUM(ABS(amount)), 0)
    FROM public.transactions 
    WHERE category_id = budgets.category_id 
    AND organization_id = budgets.organization_id
    AND type = 'expense'
    AND date >= DATE_TRUNC('month', CURRENT_DATE)
    AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  )
  WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
  AND organization_id = COALESCE(NEW.organization_id, OLD.organization_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para considerar multi-tenancy
DROP TRIGGER IF EXISTS update_budget_on_transaction_change ON public.transactions;
CREATE TRIGGER update_budget_on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_spent_amount_multi_tenant();
