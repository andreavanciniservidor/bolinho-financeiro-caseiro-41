import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMemoryCache, setMemoryCache } from '@/utils/cacheUtils';

interface ScheduledReport {
  id: string;
  user_id: string;
  name: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  filters: Record<string, any>;
  include_charts: boolean;
  include_raw_data: boolean;
  next_run_at: string;
  created_at: string;
}

interface UseScheduledReportsOptions {
  /**
   * Tempo de vida do cache em milissegundos
   */
  cacheTtl?: number;
  
  /**
   * Se deve usar cache offline
   */
  useOfflineCache?: boolean;
}

/**
 * Hook para gerenciar relatórios agendados com suporte a cache
 */
export function useScheduledReports(options: UseScheduledReportsOptions = {}) {
  const { cacheTtl = 5 * 60 * 1000, useOfflineCache = true } = options;
  
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Chave para o cache
  const CACHE_KEY = 'scheduled-reports';
  
  // Função para carregar relatórios do Supabase
  const fetchReports = useCallback(async (skipCache: boolean = false) => {
    try {
      setLoading(true);
      
      // Verificar cache primeiro
      if (!skipCache && useOfflineCache) {
        const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
        if (cachedData) {
          setReports(cachedData);
          setLoading(false);
          return;
        }
      }
      
      // Se não houver cache ou skipCache for true, buscar do Supabase
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      // Atualizar estado
      setReports(data || []);
      
      // Armazenar no cache
      if (useOfflineCache) {
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
          console.warn('Failed to store in localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching scheduled reports:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // Tentar recuperar do localStorage em caso de erro de rede
      if (useOfflineCache) {
        try {
          const offlineData = localStorage.getItem(`cache:${CACHE_KEY}`);
          if (offlineData) {
            const parsed = JSON.parse(offlineData);
            if (parsed.timestamp > Date.now()) {
              setReports(parsed.data);
            }
          }
        } catch (e) {
          console.warn('Failed to retrieve from localStorage:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [cacheTtl, useOfflineCache]);
  
  // Função para criar um novo relatório agendado
  const createScheduledReport = useCallback(async (report: Omit<ScheduledReport, 'id' | 'user_id' | 'created_at' | 'next_run_at'>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert([report])
        .select();
      
      if (error) throw new Error(error.message);
      
      // Atualizar estado e cache
      setReports(prev => [data[0], ...prev]);
      
      // Invalidar cache
      if (useOfflineCache) {
        const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
        if (cachedData) {
          setMemoryCache(CACHE_KEY, [data[0], ...cachedData], cacheTtl);
        }
      }
      
      return data[0];
    } catch (err) {
      console.error('Error creating scheduled report:', err);
      throw err;
    }
  }, [cacheTtl, useOfflineCache]);
  
  // Função para excluir um relatório agendado
  const deleteScheduledReport = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Atualizar estado e cache
      setReports(prev => prev.filter(report => report.id !== id));
      
      // Invalidar cache
      if (useOfflineCache) {
        const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
        if (cachedData) {
          setMemoryCache(
            CACHE_KEY,
            cachedData.filter(report => report.id !== id),
            cacheTtl
          );
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting scheduled report:', err);
      throw err;
    }
  }, [cacheTtl, useOfflineCache]);
  
  // Carregar relatórios ao montar o componente
  useEffect(() => {
    fetchReports();
    
    // Configurar listener para sincronização offline
    const handleOnline = () => {
      console.log('Back online, syncing data...');
      fetchReports(true); // Skip cache to get fresh data
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchReports]);
  
  return {
    reports,
    loading,
    error,
    fetchReports,
    createScheduledReport,
    deleteScheduledReport,
    refresh: () => fetchReports(true) // Função para forçar atualização
  };
}