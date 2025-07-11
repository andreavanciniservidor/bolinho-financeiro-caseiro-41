
-- Inserir categorias padrão para todos os usuários existentes
-- Categorias de despesa
INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Alimentação', 'expense', '#ef4444', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Transporte', 'expense', '#f97316', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Moradia', 'expense', '#eab308', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Saúde', 'expense', '#84cc16', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Educação', 'expense', '#06b6d4', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Lazer', 'expense', '#8b5cf6', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Roupas', 'expense', '#ec4899', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Outros', 'expense', '#64748b', id FROM auth.users
ON CONFLICT DO NOTHING;

-- Categorias de receita
INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Salário', 'income', '#22c55e', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Freelance', 'income', '#10b981', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Investimentos', 'income', '#059669', id FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, type, color, user_id) 
SELECT 'Outros', 'income', '#047857', id FROM auth.users
ON CONFLICT DO NOTHING;
