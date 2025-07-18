import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle2, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // Specific notification types
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);
  
  // Notification timing
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');

  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    };

    checkPermission();
  }, []);

  const handleBrowserNotificationChange = async (enabled: boolean) => {
    if (enabled && (notificationPermission === 'default' || notificationPermission === 'denied')) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Para receber notificações, você precisa permitir nas configurações do navegador.',
          variant: 'destructive'
        });
        return;
      }
    }

    setBrowserNotifications(enabled);
    // Save settings logic here
  };

  const handleTestNotification = () => {
    if (browserNotifications && notificationPermission === 'granted') {
      new Notification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste do Finanças+',
        icon: '/favicon.ico'
      });
      
      toast({
        title: 'Notificação enviada',
        description: 'Verifique se você recebeu a notificação de teste.'
      });
    } else {
      toast({
        title: 'Notificações desabilitadas',
        description: 'Ative as notificações do navegador primeiro.',
        variant: 'destructive'
      });
    }
  };

  const getPermissionBadge = () => {
    switch (notificationPermission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Permitido</Badge>;
      case 'denied':
        return <Badge variant="destructive">Negado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Notificações por E-mail
                </Label>
                <p className="text-sm text-gray-600">
                  Receba notificações importantes por e-mail
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="browser-notifications" className="font-medium">
                  Notificações do Navegador
                </Label>
                <p className="text-sm text-gray-600">
                  Receba notificações em tempo real no navegador
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Status:</span>
                  {getPermissionBadge()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="browser-notifications"
                checked={browserNotifications}
                onCheckedChange={handleBrowserNotificationChange}
              />
              {browserNotifications && notificationPermission === 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                >
                  Testar
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="push-notifications" className="font-medium">
                  Notificações Push
                </Label>
                <p className="text-sm text-gray-600">
                  Receba notificações no seu dispositivo móvel
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900">Alertas Financeiros</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="transaction-alerts" className="font-medium">
                    Transações
                  </Label>
                  <p className="text-sm text-gray-600">
                    Notificações sobre novas transações
                  </p>
                </div>
                <Switch
                  id="transaction-alerts"
                  checked={transactionAlerts}
                  onCheckedChange={setTransactionAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts" className="font-medium">
                    Orçamentos
                  </Label>
                  <p className="text-sm text-gray-600">
                    Alertas quando orçamentos estão próximos do limite
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={budgetAlerts}
                  onCheckedChange={setBudgetAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="security-alerts" className="font-medium">
                    Segurança
                  </Label>
                  <p className="text-sm text-gray-600">
                    Alertas sobre atividades de segurança
                  </p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={securityAlerts}
                  onCheckedChange={setSecurityAlerts}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900">Relatórios e Marketing</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports" className="font-medium">
                    Relatórios Semanais
                  </Label>
                  <p className="text-sm text-gray-600">
                    Resumo semanal das suas finanças
                  </p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={weeklyReports}
                  onCheckedChange={setWeeklyReports}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="monthly-reports" className="font-medium">
                    Relatórios Mensais
                  </Label>
                  <p className="text-sm text-gray-600">
                    Resumo mensal das suas finanças
                  </p>
                </div>
                <Switch
                  id="monthly-reports"
                  checked={monthlyReports}
                  onCheckedChange={setMonthlyReports}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails" className="font-medium">
                    E-mails Promocionais
                  </Label>
                  <p className="text-sm text-gray-600">
                    Novidades e promoções do Finanças+
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Horários e Frequência</CardTitle>
          <CardDescription>
            Configure quando e com que frequência receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours" className="font-medium">
                Horário Silencioso
              </Label>
              <p className="text-sm text-gray-600">
                Não receber notificações durante determinados horários
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Início</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Fim</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="notification-frequency">Frequência de Notificações</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediata</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Controle com que frequência você recebe notificações não urgentes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Browser Notification Help */}
      {notificationPermission === 'denied' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Notificações bloqueadas:</strong> Para receber notificações do navegador, 
            você precisa permitir nas configurações do seu navegador. Clique no ícone de cadeado 
            na barra de endereços e permita notificações para este site.
          </AlertDescription>
        </Alert>
      )}

      {browserNotifications && notificationPermission === 'granted' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Notificações ativas:</strong> Você está recebendo notificações do navegador. 
            Você pode testar clicando no botão "Testar" ao lado da configuração de notificações do navegador.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
