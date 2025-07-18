-- Criação da tabela de relatórios agendados
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  filters JSONB DEFAULT '{}',
  include_charts BOOLEAN DEFAULT true,
  include_raw_data BOOLEAN DEFAULT true,
  next_run_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS scheduled_reports_user_id_idx ON scheduled_reports (user_id);
CREATE INDEX IF NOT EXISTS scheduled_reports_next_run_at_idx ON scheduled_reports (next_run_at);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_scheduled_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at
DROP TRIGGER IF EXISTS update_scheduled_reports_updated_at_trigger ON scheduled_reports;
CREATE TRIGGER update_scheduled_reports_updated_at_trigger
BEFORE UPDATE ON scheduled_reports
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_reports_updated_at();

-- Função para calcular a próxima execução com base na frequência
CREATE OR REPLACE FUNCTION calculate_next_run_at(frequency TEXT, current_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_run TIMESTAMPTZ;
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      next_run := current_time + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_run := current_time + INTERVAL '7 days';
    WHEN 'monthly' THEN
      next_run := current_time + INTERVAL '1 month';
    ELSE
      next_run := current_time + INTERVAL '1 day';
  END CASE;
  
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir next_run_at na inserção
CREATE OR REPLACE FUNCTION set_initial_next_run_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_run_at IS NULL THEN
    NEW.next_run_at := calculate_next_run_at(NEW.frequency, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_initial_next_run_at_trigger ON scheduled_reports;
CREATE TRIGGER set_initial_next_run_at_trigger
BEFORE INSERT ON scheduled_reports
FOR EACH ROW
EXECUTE FUNCTION set_initial_next_run_at();

-- Trigger para atualizar next_run_at quando a frequência é alterada
CREATE OR REPLACE FUNCTION update_next_run_at_on_frequency_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.frequency <> OLD.frequency THEN
    NEW.next_run_at := calculate_next_run_at(NEW.frequency, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_next_run_at_trigger ON scheduled_reports;
CREATE TRIGGER update_next_run_at_trigger
BEFORE UPDATE ON scheduled_reports
FOR EACH ROW
WHEN (NEW.frequency IS DISTINCT FROM OLD.frequency)
EXECUTE FUNCTION update_next_run_at_on_frequency_change();

-- Políticas RLS para segurança
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled reports"
  ON scheduled_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled reports"
  ON scheduled_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled reports"
  ON scheduled_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled reports"
  ON scheduled_reports FOR DELETE
  USING (auth.uid() = user_id);