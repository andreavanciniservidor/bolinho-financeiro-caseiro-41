import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  budget_alerts: boolean;
}

export interface UserPreferences extends UserSettings {
  notifications: NotificationSettings;
}

class UserSettingsService {
  async getUserSettings(): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default
        return this.createDefaultSettings();
      }
      throw error;
    }

    return {
      ...data,
      notifications: data.notifications as NotificationSettings
    };
  }

  async createDefaultSettings(): Promise<UserPreferences> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const defaultSettings: UserSettingsInsert = {
      user_id: user.user.id,
      currency: 'BRL',
      language: 'pt-BR',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        budget_alerts: true
      },
      date_format: 'DD/MM/YYYY',
      number_format: 'pt-BR'
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      notifications: data.notifications as NotificationSettings
    };
  }

  async updateUserSettings(updates: Partial<UserSettingsUpdate>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      notifications: data.notifications as NotificationSettings
    };
  }

  async updateTheme(theme: 'light' | 'dark' | 'system') {
    return this.updateUserSettings({ theme });
  }

  async updateLanguage(language: string) {
    return this.updateUserSettings({ language });
  }

  async updateCurrency(currency: string) {
    return this.updateUserSettings({ currency });
  }

  async updateNotifications(notifications: Partial<NotificationSettings>) {
    const currentSettings = await this.getUserSettings();
    
    const updatedNotifications = {
      ...currentSettings?.notifications,
      ...notifications
    };

    return this.updateUserSettings({ notifications: updatedNotifications });
  }

  async updateDateFormat(dateFormat: string) {
    return this.updateUserSettings({ date_format: dateFormat });
  }

  async updateNumberFormat(numberFormat: string) {
    return this.updateUserSettings({ number_format: numberFormat });
  }

  // Helper methods for formatting
  formatCurrency(amount: number, settings?: UserPreferences): string {
    const currency = settings?.currency || 'BRL';
    const locale = settings?.number_format || 'pt-BR';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date: Date | string, settings?: UserPreferences): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = settings?.language || 'pt-BR';
    const format = settings?.date_format || 'DD/MM/YYYY';

    // Simple format mapping
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format.includes('DD')) {
      options.day = '2-digit';
    }
    if (format.includes('MM')) {
      options.month = '2-digit';
    }
    if (format.includes('YYYY')) {
      options.year = 'numeric';
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }

  formatNumber(number: number, settings?: UserPreferences): string {
    const locale = settings?.number_format || 'pt-BR';
    
    return new Intl.NumberFormat(locale).format(number);
  }

  // Validation methods
  validateSettings(settings: Partial<UserSettingsUpdate>) {
    const errors: string[] = [];

    if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
      errors.push('Tema deve ser "light", "dark" ou "system"');
    }

    if (settings.currency && settings.currency.length !== 3) {
      errors.push('Código da moeda deve ter 3 caracteres');
    }

    if (settings.language && !/^[a-z]{2}-[A-Z]{2}$/.test(settings.language)) {
      errors.push('Idioma deve estar no formato "xx-XX"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export/Import settings
  async exportSettings(): Promise<string> {
    const settings = await this.getUserSettings();
    return JSON.stringify(settings, null, 2);
  }

  async importSettings(settingsJson: string): Promise<UserPreferences> {
    try {
      const settings = JSON.parse(settingsJson);
      
      // Remove system fields
      const { id, user_id, created_at, updated_at, ...importableSettings } = settings;
      
      const validation = this.validateSettings(importableSettings);
      if (!validation.isValid) {
        throw new Error(`Configurações inválidas: ${validation.errors.join(', ')}`);
      }

      return this.updateUserSettings(importableSettings);
    } catch (error) {
      throw new Error('Formato de configurações inválido');
    }
  }

  // Reset to defaults
  async resetToDefaults(): Promise<UserPreferences> {
    const defaultSettings = {
      currency: 'BRL',
      language: 'pt-BR',
      theme: 'light' as const,
      notifications: {
        email: true,
        push: true,
        budget_alerts: true
      },
      date_format: 'DD/MM/YYYY',
      number_format: 'pt-BR'
    };

    return this.updateUserSettings(defaultSettings);
  }
}

export const userSettingsService = new UserSettingsService();