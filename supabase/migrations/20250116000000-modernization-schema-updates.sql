-- Modernização da Aplicação Financeira - Atualizações do Schema
-- Adicionar campos faltantes e otimizações conforme design

-- 1. Atualizar tabela profiles para incluir preferências
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 2. Adicionar campos faltantes na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS recurrence_rule JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 3. Adicionar campos faltantes na tabela budgets
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS period_start DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month');

-- 4. Adicionar campos faltantes na tabela categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Criar tabela user_settings para preferências do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  currency TEXT DEFAULT 'BRL',
  language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications JSONB DEFAULT '{"email": true, "push": true, "budget_alerts": true}',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  number_format TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Adicionar índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON public.budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- 7. Atualizar função para criar configurações padrão do usuário
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar configurações padrão quando perfil é criado
DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_user_settings();

-- 8. Atualizar função de atualização de spent_amount para considerar períodos
CREATE OR REPLACE FUNCTION public.update_budget_spent_amount_with_period()
RETURNS TRIGGER AS $
DECLARE
  budget_record RECORD;
BEGIN
  -- Buscar todos os orçamentos que podem ser afetados
  FOR budget_record IN 
    SELECT id, category_id, user_id, period_start, period_end, organization_id
    FROM public.budgets 
    WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    AND user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND is_active = true
  LOOP
    -- Atualizar o valor gasto no orçamento considerando o período
    UPDATE public.budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(ABS(amount)), 0)
      FROM public.transactions 
      WHERE category_id = budget_record.category_id 
      AND user_id = budget_record.user_id
      AND (organization_id = budget_record.organization_id OR (organization_id IS NULL AND budget_record.organization_id IS NULL))
      AND type = 'expense'
      AND date >= budget_record.period_start
      AND date <= budget_record.period_end
    ),
    updated_at = NOW()
    WHERE id = budget_record.id;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para usar a nova função
DROP TRIGGER IF EXISTS update_budget_on_transaction_change ON public.transactions;
CREATE TRIGGER update_budget_on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_spent_amount_with_period();

-- 9. Adicionar triggers para updated_at em todas as tabelas
DROP TRIGGER IF EXISTS handle_updated_at_categories ON public.categories;
CREATE TRIGGER handle_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_transactions ON public.transactions;
CREATE TRIGGER handle_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_budgets ON public.budgets;
CREATE TRIGGER handle_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_settings ON public.user_settings;
CREATE TRIGGER handle_updated_at_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Função para limpar dados antigos (opcional, para performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void AS $
BEGIN
  -- Remover transações muito antigas (mais de 5 anos) se necessário
  -- DELETE FROM public.transactions WHERE date < CURRENT_DATE - INTERVAL '5 years';
  
  -- Remover orçamentos inativos muito antigos
  DELETE FROM public.budgets 
  WHERE is_active = false 
  AND updated_at < CURRENT_DATE - INTERVAL '1 year';
  
  -- Log da limpeza
  RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Atualizar categorias existentes para ter is_active = true
UPDATE public.categories SET is_active = true WHERE is_active IS NULL;

-- 12. Atualizar orçamentos existentes para ter período mensal padrão
UPDATE public.budgets 
SET 
  period_start = DATE_TRUNC('month', CURRENT_DATE),
  period_end = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
WHERE period_start IS NULL OR period_end IS NULL;

-- 13. Comentários para documentação
COMMENT ON TABLE public.user_settings IS 'Configurações e preferências do usuário';
COMMENT ON COLUMN public.transactions.tags IS 'Tags para categorização adicional das transações';
COMMENT ON COLUMN public.transactions.recurrence_rule IS 'Regras de recorrência em formato JSON';
COMMENT ON COLUMN public.budgets.period_type IS 'Tipo de período do orçamento: weekly, monthly, yearly';
COMMENT ON COLUMN public.budgets.period_start IS 'Data de início do período do orçamento';
COMMENT ON COLUMN public.budgets.period_end IS 'Data de fim do período do orçamento';