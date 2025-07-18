
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface ScheduledReport {
  id: string;
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  frequency: string;
  email: string;
  isActive: boolean;
  lastSent: string | null;
  nextSend: string;
  format: 'pdf' | 'excel';
  filters: {
    dateRange?: string;
    categories?: string[];
    transactionTypes?: string[];
  };
  createdAt: string;
}

interface UseScheduledReportsReturn {
  reports: ScheduledReport[];
  isLoading: boolean;
  error: string | null;
  createReport: (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastSent'>) => Promise<void>;
  updateReport: (id: string, updates: Partial<ScheduledReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  toggleReport: (id: string, isActive: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useScheduledReports(): UseScheduledReportsReturn {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadReports = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Since scheduled_reports table doesn't exist in the database schema,
      // we'll simulate some dummy data for now
      const dummyReports: ScheduledReport[] = [
        {
          id: '1',
          name: 'Relatório Mensal',
          type: 'monthly',
          frequency: 'monthly',
          email: user.email || '',
          isActive: true,
          lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextSend: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          format: 'pdf',
          filters: {
            dateRange: 'last_month',
            categories: [],
            transactionTypes: ['expense', 'income']
          },
          createdAt: new Date().toISOString()
        }
      ];
      
      setReports(dummyReports);
    } catch (err) {
      console.error('Error loading scheduled reports:', err);
      setError('Erro ao carregar relatórios agendados');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (newReport: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastSent'>) => {
    try {
      const report: ScheduledReport = {
        ...newReport,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastSent: null
      };
      
      setReports(prev => [...prev, report]);
    } catch (err) {
      console.error('Error creating scheduled report:', err);
      throw new Error('Erro ao criar relatório agendado');
    }
  };

  const updateReport = async (id: string, updates: Partial<ScheduledReport>) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, ...updates } : report
      ));
    } catch (err) {
      console.error('Error updating scheduled report:', err);
      throw new Error('Erro ao atualizar relatório agendado');
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      console.error('Error deleting scheduled report:', err);
      throw new Error('Erro ao excluir relatório agendado');
    }
  };

  const toggleReport = async (id: string, isActive: boolean) => {
    await updateReport(id, { isActive });
  };

  const refresh = async () => {
    await loadReports();
  };

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  return {
    reports,
    isLoading,
    error,
    createReport,
    updateReport,
    deleteReport,
    toggleReport,
    refresh
  };
}
