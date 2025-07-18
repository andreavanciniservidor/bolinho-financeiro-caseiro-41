
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
 * Mock implementation for scheduled reports
 * In a real implementation, this would interact with a database table
 */
export const scheduleReport = async (options: ScheduleReportOptions): Promise<ScheduledReport> => {
  const { name, email, frequency, filters, includeCharts, includeRawData, format } = options;
  
  // Calculate next send date based on frequency
  const nextSendAt = calculateNextSendDate(frequency);
  
  const mockReport: ScheduledReport = {
    id: `report-${Date.now()}`,
    user_id: 'current-user',
    name,
    email,
    frequency,
    filters,
    include_charts: includeCharts,
    include_raw_data: includeRawData,
    format,
    next_send_at: nextSendAt.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Store in memory cache for demo purposes
  const existingReports = getMemoryCache<ScheduledReport[]>('scheduled-reports') || [];
  existingReports.push(mockReport);
  setMemoryCache('scheduled-reports', existingReports);
  
  return mockReport;
};

/**
 * Get all scheduled reports for the current user
 */
export const getScheduledReports = async (skipCache: boolean = false, cacheTtl: number = 5 * 60 * 1000): Promise<ScheduledReport[]> => {
  const CACHE_KEY = 'scheduled-reports';
  
  if (!skipCache) {
    const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Return empty array for demo - in real implementation this would query the database
  const mockReports: ScheduledReport[] = [];
  setMemoryCache(CACHE_KEY, mockReports, cacheTtl);
  
  return mockReports;
};

/**
 * Update a scheduled report
 */
export const updateScheduledReport = async (id: string, updates: Partial<ScheduleReportOptions>): Promise<ScheduledReport> => {
  const CACHE_KEY = 'scheduled-reports';
  const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY) || [];
  
  const reportIndex = cachedData.findIndex(report => report.id === id);
  if (reportIndex === -1) {
    throw new Error('Report not found');
  }
  
  const updatedReport = {
    ...cachedData[reportIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  cachedData[reportIndex] = updatedReport;
  setMemoryCache(CACHE_KEY, cachedData);
  
  return updatedReport;
};

/**
 * Delete a scheduled report
 */
export const deleteScheduledReport = async (id: string): Promise<void> => {
  const CACHE_KEY = 'scheduled-reports';
  const cachedData = getMemoryCache<ScheduledReport[]>(CACHE_KEY) || [];
  
  const filteredReports = cachedData.filter(report => report.id !== id);
  setMemoryCache(CACHE_KEY, filteredReports);
};

/**
 * Calculate next send date based on frequency
 */
const calculateNextSendDate = (frequency: 'daily' | 'weekly' | 'monthly'): Date => {
  const now = new Date();
  const nextSendAt = new Date();
  
  // Set to 8 AM
  nextSendAt.setHours(8, 0, 0, 0);
  
  switch (frequency) {
    case 'daily':
      if (now.getHours() >= 8) {
        nextSendAt.setDate(nextSendAt.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const daysUntilMonday = 1 - nextSendAt.getDay();
      nextSendAt.setDate(nextSendAt.getDate() + (daysUntilMonday <= 0 ? daysUntilMonday + 7 : daysUntilMonday));
      break;
      
    case 'monthly':
      nextSendAt.setMonth(nextSendAt.getMonth() + 1);
      nextSendAt.setDate(1);
      break;
  }
  
  return nextSendAt;
};

/**
 * Format frequency for display
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
 * Format next send date for display
 */
export const formatNextSendDate = (nextSendAt: string): string => {
  const date = new Date(nextSendAt);
  return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
};

/**
 * Generate preview link for a scheduled report
 */
export const getScheduledReportPreviewLink = (reportId: string): string => {
  return `${window.location.origin}/reports/preview/${reportId}`;
};
