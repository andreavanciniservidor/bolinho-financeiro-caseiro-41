
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2, Download, Upload, Trash2 } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const {
    settings,
    isLoading,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    isUpdating,
    isResetting
  } = useUserSettings();

  const [formData, setFormData] = useState({
    theme: 'light',
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'pt-BR',
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        theme: settings.theme || 'light',
        language: settings.language || 'pt-BR',
        currency: settings.currency || 'BRL',
        dateFormat: settings.date_format || 'dd/MM/yyyy',
        numberFormat: settings.number_format || 'pt-BR',
        notifications: settings.notifications || {
          email: true,
          push: true,
          budgetAlerts: true
        }
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const result = await updateSettings({
      theme: formData.theme,
      language: formData.language,
      currency: formData.currency,
      date_format: formData.dateFormat,
      number_format: formData.numberFormat,
      notifications: formData.notifications
    });

    if (result.error) {
      toast({
        title: "Erro ao salvar",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    }
  };

  const handleReset = async () => {
    const result = await resetToDefaults();

    if (result.error) {
      toast({
        title: "Erro ao resetar",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Configurações resetadas",
        description: "Suas preferências foram restauradas para os valores padrão.",
      });
    }
  };

  const handleExport = async () => {
    const result = await exportSettings();
    
    if (result.error) {
      toast({
        title: "Erro na exportação",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data) {
      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financas-configuracoes.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Configurações exportadas",
        description: "Arquivo baixado com sucesso.",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importSettings(text);
      
      if (result.error) {
        toast({
          title: "Erro na importação",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Configurações importadas",
          description: "Suas preferências foram restauradas com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Arquivo inválido ou corrompido.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Personalize sua experiência no sistema
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>
            Informações básicas da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input
                id="userId"
                value={settings?.user_id || user?.id || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-900 font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
          <CardDescription>
            Configure idioma, moeda e formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <Select
                value={formData.dateFormat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberFormat">Formato de Números</Label>
              <Select
                value={formData.numberFormat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, numberFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">1.234,56</SelectItem>
                  <SelectItem value="en-US">1,234.56</SelectItem>
                  <SelectItem value="de-DE">1 234,56</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications" className="text-base">Notificações por E-mail</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receba atualizações importantes por e-mail
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={formData.notifications.email}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                notifications: { ...prev.notifications, email: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications" className="text-base">Notificações Push</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={formData.notifications.push}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                notifications: { ...prev.notifications, push: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budgetAlerts" className="text-base">Alertas de Orçamento</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seja notificado quando ultrapassar limites de orçamento
              </p>
            </div>
            <Switch
              id="budgetAlerts"
              checked={formData.notifications.budgetAlerts}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                notifications: { ...prev.notifications, budgetAlerts: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>
            Importe, exporte ou resete suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Configurações
            </Button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-settings"
              />
              <Button 
                onClick={() => document.getElementById('import-settings')?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Configurações
              </Button>
            </div>

            <Button 
              onClick={handleReset} 
              variant="destructive"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Resetar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
