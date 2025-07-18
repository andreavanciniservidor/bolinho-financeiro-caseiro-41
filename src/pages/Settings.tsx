import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { AlertCircle, Bell, Check, Globe, Languages, Loader2, Lock, Moon, Save, Settings as SettingsIcon, Shield, Sun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

export default function Settings() {
  const { toast } = useToast();
  const { 
    settings, 
    isLoading, 
    updateSettings, 
    updateTheme, 
    updateLanguage, 
    updateCurrency,
    resetToDefaults,
    isUpdating,
    isUpdatingTheme,
    isUpdatingLanguage,
    isUpdatingCurrency,
    isResetting
  } = useUserSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    settings?.theme || 'light'
  );
  const [selectedLanguage, setSelectedLanguage] = useState(settings?.language || 'pt-BR');
  const [selectedCurrency, setSelectedCurrency] = useState(settings?.currency || 'BRL');
  const [selectedDateFormat, setSelectedDateFormat] = useState(settings?.date_format || 'DD/MM/YYYY');
  const [selectedNumberFormat, setSelectedNumberFormat] = useState(settings?.number_format || 'pt-BR');
  const [selectedTimezone, setSelectedTimezone] = useState('America/Sao_Paulo');

  // Handle theme change
  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme);
    try {
      await updateTheme(theme);
      toast({
        title: 'Tema atualizado',
        description: 'O tema da aplicação foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar tema',
        description: 'Não foi possível atualizar o tema. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle language change
  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    try {
      await updateLanguage(language);
      toast({
        title: 'Idioma atualizado',
        description: 'O idioma da aplicação foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar idioma',
        description: 'Não foi possível atualizar o idioma. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (currency: string) => {
    setSelectedCurrency(currency);
    try {
      await updateCurrency(currency);
      toast({
        title: 'Moeda atualizada',
        description: 'A moeda da aplicação foi atualizada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar moeda',
        description: 'Não foi possível atualizar a moeda. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle date format change
  const handleDateFormatChange = async (format: string) => {
    setSelectedDateFormat(format);
    try {
      await updateSettings({ date_format: format });
      toast({
        title: 'Formato de data atualizado',
        description: 'O formato de data foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar formato de data',
        description: 'Não foi possível atualizar o formato de data. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle number format change
  const handleNumberFormatChange = async (format: string) => {
    setSelectedNumberFormat(format);
    try {
      await updateSettings({ number_format: format });
      toast({
        title: 'Formato de número atualizado',
        description: 'O formato de número foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar formato de número',
        description: 'Não foi possível atualizar o formato de número. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Handle timezone change
  const handleTimezoneChange = async (timezone: string) => {
    setSelectedTimezone(timezone);
    // Timezone is handled by the browser, but we can save the preference
    toast({
      title: 'Fuso horário atualizado',
      description: 'O fuso horário foi atualizado com sucesso.',
    });
  };

  // Handle reset to defaults
  const handleResetToDefaults = async () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
      try {
        const result = await resetToDefaults();
        if (result.data) {
          setSelectedTheme(result.data.theme);
          setSelectedLanguage(result.data.language);
          setSelectedCurrency(result.data.currency);
          setSelectedDateFormat(result.data.date_format);
          setSelectedNumberFormat(result.data.number_format);
          setSelectedTimezone('America/Sao_Paulo');
          
          toast({
            title: 'Configurações restauradas',
            description: 'Todas as configurações foram restauradas para os valores padrão.',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro ao restaurar configurações',
          description: 'Não foi possível restaurar as configurações. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Personalize a aplicação de acordo com suas preferências
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={isResetting}
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <SettingsIcon className="h-4 w-4 mr-2" />
            )}
            Restaurar padrões
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="localization">Localização</TabsTrigger>
            <TabsTrigger value="notifications">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notificações</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="security">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Segurança</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      placeholder="Seu nome de usuário"
                      defaultValue={settings?.user_id.split('-')[0] || ''}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Este é o seu identificador único no sistema.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-emails">Emails de marketing</Label>
                      <Switch id="marketing-emails" defaultChecked={false} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receba emails sobre novos recursos e melhorias.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="security-emails">Emails de segurança</Label>
                      <Switch id="security-emails" defaultChecked={true} disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receba emails sobre atividades de segurança na sua conta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exportar/Importar Configurações</CardTitle>
                <CardDescription>
                  Exporte suas configurações para backup ou importe de outro dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">
                    Exportar Configurações
                  </Button>
                  <Button variant="outline">
                    Importar Configurações
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    A importação de configurações substituirá todas as suas configurações atuais.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Personalize a aparência da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedTheme === 'light' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center gap-2 h-24"
                    onClick={() => handleThemeChange('light')}
                    disabled={isUpdatingTheme}
                  >
                    <Sun className="h-6 w-6" />
                    <span>Claro</span>
                    {selectedTheme === 'light' && (
                      <Check className="h-4 w-4 absolute top-2 right-2 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center gap-2 h-24"
                    onClick={() => handleThemeChange('dark')}
                    disabled={isUpdatingTheme}
                  >
                    <Moon className="h-6 w-6" />
                    <span>Escuro</span>
                    {selectedTheme === 'dark' && (
                      <Check className="h-4 w-4 absolute top-2 right-2 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant={selectedTheme === 'system' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center gap-2 h-24"
                    onClick={() => handleThemeChange('system')}
                    disabled={isUpdatingTheme}
                  >
                    <SettingsIcon className="h-6 w-6" />
                    <span>Sistema</span>
                    {selectedTheme === 'system' && (
                      <Check className="h-4 w-4 absolute top-2 right-2 text-green-500" />
                    )}
                  </Button>
                </div>
                {isUpdatingTheme && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Atualizando tema...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acessibilidade</CardTitle>
                <CardDescription>
                  Configurações de acessibilidade para melhorar sua experiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion">Reduzir movimento</Label>
                    <Switch id="reduce-motion" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reduz animações e transições na interface.
                  </p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">Alto contraste</Label>
                    <Switch id="high-contrast" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o contraste entre elementos para melhor visibilidade.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="font-size">Tamanho da fonte</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Selecione o tamanho da fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="x-large">Extra grande</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Ajusta o tamanho da fonte em toda a aplicação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Idioma e Região</CardTitle>
                <CardDescription>
                  Configure o idioma e formato regional da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={handleLanguageChange}
                    disabled={isUpdatingLanguage}
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          <span>Português (Brasil)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          <span>English (US)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="es-ES">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          <span>Español</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingLanguage && (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Atualizando idioma...</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select 
                    value={selectedCurrency} 
                    onValueChange={handleCurrencyChange}
                    disabled={isUpdatingCurrency}
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                      <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingCurrency && (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Atualizando moeda...</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date-format">Formato de data</Label>
                  <Select 
                    value={selectedDateFormat} 
                    onValueChange={handleDateFormatChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger id="date-format" className="w-full">
                      <SelectValue placeholder="Selecione o formato de data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number-format">Formato de número</Label>
                  <Select 
                    value={selectedNumberFormat} 
                    onValueChange={handleNumberFormatChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger id="number-format" className="w-full">
                      <SelectValue placeholder="Selecione o formato de número" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">1.000,00 (Brasileiro)</SelectItem>
                      <SelectItem value="en-US">1,000.00 (Americano)</SelectItem>
                      <SelectItem value="de-DE">1.000,00 (Europeu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select 
                    value={selectedTimezone} 
                    onValueChange={handleTimezoneChange}
                  >
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (GMT-5/GMT-4)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1/GMT+2)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    O fuso horário é usado para exibir datas e horas corretamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}