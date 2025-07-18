import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userSettingsService, UserPreferences, NotificationSettings } from '@/services/userSettingsService';
import { useAuth } from './useAuth';

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-settings'],
    queryFn: userSettingsService.getUserSettings,
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes - settings change infrequently
    retry: 1, // Only retry once for settings
  });

  const updateSettingsMutation = useMutation({
    mutationFn: userSettingsService.updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: userSettingsService.updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: userSettingsService.updateLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: userSettingsService.updateCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: userSettingsService.updateNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: userSettingsService.resetToDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  // Helper functions
  const updateSettings = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      const result = await updateSettingsMutation.mutateAsync(updates);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateSettingsMutation]);

  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    try {
      const result = await updateThemeMutation.mutateAsync(theme);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateThemeMutation]);

  const updateLanguage = useCallback(async (language: string) => {
    try {
      const result = await updateLanguageMutation.mutateAsync(language);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateLanguageMutation]);

  const updateCurrency = useCallback(async (currency: string) => {
    try {
      const result = await updateCurrencyMutation.mutateAsync(currency);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateCurrencyMutation]);

  const updateNotifications = useCallback(async (notifications: Partial<NotificationSettings>) => {
    try {
      const result = await updateNotificationsMutation.mutateAsync(notifications);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateNotificationsMutation]);

  const resetToDefaults = useCallback(async () => {
    try {
      const result = await resetToDefaultsMutation.mutateAsync();
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [resetToDefaultsMutation]);

  // Formatting helpers using current settings
  const formatCurrency = useCallback((amount: number) => {
    return userSettingsService.formatCurrency(amount, settings);
  }, [settings]);

  const formatDate = useCallback((date: Date | string) => {
    return userSettingsService.formatDate(date, settings);
  }, [settings]);

  const formatNumber = useCallback((number: number) => {
    return userSettingsService.formatNumber(number, settings);
  }, [settings]);

  // Export/Import functions
  const exportSettings = useCallback(async () => {
    try {
      const exported = await userSettingsService.exportSettings();
      return { data: exported, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, []);

  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      const result = await userSettingsService.importSettings(settingsJson);
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [queryClient]);

  return {
    // Data
    settings,
    isLoading,
    error,
    
    // Actions
    updateSettings,
    updateTheme,
    updateLanguage,
    updateCurrency,
    updateNotifications,
    resetToDefaults,
    refetch,
    
    // Formatting helpers
    formatCurrency,
    formatDate,
    formatNumber,
    
    // Import/Export
    exportSettings,
    importSettings,
    
    // Loading states
    isUpdating: updateSettingsMutation.isPending,
    isUpdatingTheme: updateThemeMutation.isPending,
    isUpdatingLanguage: updateLanguageMutation.isPending,
    isUpdatingCurrency: updateCurrencyMutation.isPending,
    isUpdatingNotifications: updateNotificationsMutation.isPending,
    isResetting: resetToDefaultsMutation.isPending,
  };
}