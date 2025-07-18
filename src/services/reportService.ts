import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getMemoryCache, setMemoryCache } from '@/utils/cacheUtils';

export interface ScheduledReport {
  id: string;
  user_id: string;
  name: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  filters: any;
  include_charts: boolean;
  include_raw_data: boolean;
  format: 'pdf' | 'excel';
  last_sent_at?: string;
  next_send_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleReportOptions {
  name: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  filters: any;
  includeCharts: boolean;
  includeRawData: boolean;
  format: 'pdf' | 'excel';
}

/**
 * Agenda um relatório para envio automático por email
 */
export const scheduleReport = async (options: ScheduleReportOptions): Promise<ScheduledReport> => {
  const { name, email, frequency, filters, includeCharts, includeRawData, format } = options;
  
  // Calcular a próxima data de envio com base na frequência
  const nextSendAt = calculateNextSendDate(frequency);
  
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert({
      name,
      email,
      frequency,
      filters,
      include_charts: includeCharts,
      include_raw_data: includeRawData,
      format,
      next_send_at: nextSendAt.toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao agendar relatório:', error);
    throw new Error('Não foi possível agendar o relatório. Tente novamente.');
  }
  
  return data as ScheduledReport;
};

/**
 * Obtém todos os relatórios agendados do usuário atual
 * @param skipCache Se deve ignorar o cache e buscar dados frescos
 * @param cacheTtl Tempo de vida do cache em milissegundos (padrão: 5 minutos)
 */
export const getScheduledReports = async (skipCache: boolean = false, cacheTtl: number = 5 * 60 * 1000): Promise<ScheduledReport[]> => {
  const CACHE_KEY = 'scheduled-reports';
  
  // Verificar cache primeiro, se não estiver ignorando o cache
  if (!skipCache) {
    const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }
    
    // Tentar recuperar do localStorage em caso de cache miss
    try {
      const offlineData = localStorage.getItem(`cache:${CACHE_KEY}`);
      if (offlineData) {
        const parsed = JSON.parse(offlineData);
        if (parsed.timestamp > Date.now()) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Falha ao recuperar do localStorage:', e);
    }
  }
  
  // Se não houver cache ou skipCache for true, buscar do Supabase
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar relatórios agendados:', error);
    throw new Error('Não foi possível buscar os relatórios agendados.');
  }
  
  // Armazenar no cache
  setMemoryCache(CACHE_KEY, data, cacheTtl);
  
  // Armazenar também no localStorage para persistência offline
  try {
    localStorage.setItem(
      `cache:${CACHE_KEY}`,
      JSON.stringify({
        data,
        timestamp: Date.now() + cacheTtl
      })
    );
  } catch (e) {
    console.warn('Falha ao armazenar no localStorage:', e);
  }
  
  return data as ScheduledReport[];
};

/**
 * Atualiza um relatório agendado
 */
export const updateScheduledReport = async (id: string, updates: Partial<ScheduleReportOptions>): Promise<ScheduledReport> => {
  const CACHE_KEY = 'scheduled-reports';
  
  // Se a frequência foi alterada, recalcular a próxima data de envio
  let nextSendAt: Date | undefined;
  if (updates.frequency) {
    nextSendAt = calculateNextSendDate(updates.frequency);
  }
  
  const { data, error } = await supabase
    .from('scheduled_reports')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
      ...(updates.frequency && { frequency: updates.frequency }),
      ...(updates.filters && { filters: updates.filters }),
      ...(updates.includeCharts !== undefined && { include_charts: updates.includeCharts }),
      ...(updates.includeRawData !== undefined && { include_raw_data: updates.includeRawData }),
      ...(updates.format && { format: updates.format }),
      ...(nextSendAt && { next_send_at: nextSendAt.toISOString() }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar relatório agendado:', error);
    throw new Error('Não foi possível atualizar o relatório agendado.');
  }
  
  // Atualizar o cache com os novos dados
  try {
    const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
    if (cachedData) {
      const updatedCache = cachedData.map(report => 
        report.id === id ? data as ScheduledReport : report
      );
      setMemoryCache(CACHE_KEY, updatedCache);
      
      // Atualizar também no localStorage
      const offlineData = localStorage.getItem(`cache:${CACHE_KEY}`);
      if (offlineData) {
        const parsed = JSON.parse(offlineData);
        const updatedOfflineData = {
          data: updatedCache,
          timestamp: parsed.timestamp
        };
        localStorage.setItem(`cache:${CACHE_KEY}`, JSON.stringify(updatedOfflineData));
      }
    }
  } catch (e) {
    console.warn('Falha ao atualizar cache:', e);
  }
  
  return data as ScheduledReport;
};

/**
 * Exclui um relatório agendado
 */
export const deleteScheduledReport = async (id: string): Promise<void> => {
  const CACHE_KEY = 'scheduled-reports';
  
  const { error } = await supabase
    .from('scheduled_reports')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir relatório agendado:', error);
    throw new Error('Não foi possível excluir o relatório agendado.');
  }
  
  // Atualizar o cache removendo o relatório excluído
  try {
    const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
    if (cachedData) {
      const updatedCache = cachedData.filter(report => report.id !== id);
      setMemoryCache(CACHE_KEY, updatedCache);
      
      // Atualizar também no localStorage
      const offlineData = localStorage.getItem(`cache:${CACHE_KEY}`);
      if (offlineData) {
        const parsed = JSON.parse(offlineData);
        const updatedOfflineData = {
          data: updatedCache,
          timestamp: parsed.timestamp
        };
        localStorage.setItem(`cache:${CACHE_KEY}`, JSON.stringify(updatedOfflineData));
      }
    }
  } catch (e) {
    console.warn('Falha ao atualizar cache:', e);
  }
};

/**
 * Calcula a próxima data de envio com base na frequência
 */
const calculateNextSendDate = (frequency: 'daily' | 'weekly' | 'monthly'): Date => {
  const now = new Date();
  const nextSendAt = new Date();
  
  // Configurar para 8h da manhã
  nextSendAt.setHours(8, 0, 0, 0);
  
  switch (frequency) {
    case 'daily':
      // Se já passou das 8h, agendar para o próximo dia
      if (now.getHours() >= 8) {
        nextSendAt.setDate(nextSendAt.getDate() + 1);
      }
      break;
      
    case 'weekly':
      // Agendar para a próxima segunda-feira
      const daysUntilMonday = 1 - nextSendAt.getDay();
      nextSendAt.setDate(nextSendAt.getDate() + (daysUntilMonday <= 0 ? daysUntilMonday + 7 : daysUntilMonday));
      break;
      
    case 'monthly':
      // Agendar para o primeiro dia do próximo mês
      nextSendAt.setMonth(nextSendAt.getMonth() + 1);
      nextSendAt.setDate(1);
      break;
  }
  
  return nextSendAt;
};

/**
 * Formata a frequência para exibição
 */
export const formatReportFrequency = (frequency: 'daily' | 'weekly' | 'monthly'): string => {
  switch (frequency) {
    case 'daily':
      return 'Diário';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    default:
      return '';
  }
};

/**
 * Formata a próxima data de envio para exibição
 */
export const formatNextSendDate = (nextSendAt: string): string => {
  const date = new Date(nextSendAt);
  return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
};

/**
 * Gera um link para visualizar um relatório agendado
 */
export const getScheduledReportPreviewLink = (reportId: string): string => {
  return `${window.location.origin}/reports/preview/${reportId}`;
};