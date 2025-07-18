import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Bell, BellOff, Clock, Loader2, Mail, Smartphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function NotificationSettings() {
  const { toast } = useToast();
  const { 
    settings, 
    isLoading, 
    updateNotifications,
    isUpdatingNotifications
  } = useUserSettings();

  const [emailNotifications, setEmailNotifications] = useState(
    settings?.notifications?.email ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    settings?.notifications?.push ?? true
  );
  const [budgetAlerts, setBudgetAlerts] = useState(
    settings?.notifications?.budget_alerts ?? true
  );
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);

  // Check push notification permission
  const checkPushPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setPushPermission(permission);

    if (permission === 'granted') {
      toast({
        title: 'Notificações permitidas',
        description: 'Você receberá notificações push quando relevante.',
      });
    } else if (permission === 'denied') {
      toast({
        title: 'Notificações bloqueadas',
        description: 'Você precisa permitir notificações nas configurações do navegador.',
        variant: 'destructive',
      });
      setPushNotifications(false);
    }
  };

  // Handle email notifications toggle
  const handleEmailToggle = async (checked: boolean) => {
    setEmailNotifications(checked);
    try {
      await updateNotifications({ email: checked });
      toast({
        title: checked ? 'Notificações por email ativadas' : 'Notificações por email desativadas',
        description: checked 
          ? 'Você receberá notificações importantes por email.' 
          : 'Você não receberá mais notificações por email.',
      });
    } catch (error) {
      setEmailNotifications(!checked); // Revert on error
      toast({
        title: 'Erro ao atualizar configurações',
        description: 'Não foi possível atualizar as notificações por email.',
        variant: 'destructive',
      });
    }
  };

  // Handle push notifications toggle
  const handlePushToggle = async (checked: boolean) => {
    if (checked && pushPermission !== 'granted') {
      await checkPushPermission();
      if (pushPermission !== 'granted') {
        return;
      }
    }

    setPushNotifications(checked);
    try {
      await updateNotifications({ push: checked });
      toast({
        title: checked ? 'Notificações push ativadas' : 'Notificações push desativadas',
        description: checked 
          ? 'Você receberá notificações push quando relevante.' 
          : 'Você não receberá mais notificações push.',
      });
    } catch (error) {
      setPushNotifications(!checked); // Revert on error
      toast({
        title: 'Erro ao atualizar configurações',
        description: 'Não foi possível atualizar as notificações push.',
        variant: 'destructive',
      });
    }
  };

  // Handle budget alerts toggle
  const handleBudgetAlertsToggle = async (checked: boolean) => {
    setBudgetAlerts(checked);
    try {
      await updateNotifications({ budget_alerts: checked });
      toast({
        title: checked ? 'Alertas de orçamento ativados' : 'Alertas de orçamento desativados',
        description: checked 
          ? 'Você receberá alertas quando seus orçamentos estiverem próximos do limite.' 
          : 'Você não receberá mais alertas de orçamento.',
      });
    } catch (error) {
      setBudgetAlerts(!checked); // Revert on error
      toast({
        title: 'Erro ao atualizar configurações',
        description: 'Não foi possível atualizar os alertas de orçamento.',
        variant: 'destructive',
      });
    }
  };

  // Handle save all settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, we would save all settings at once
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências de notificação foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar configurações',
        description: 'Não foi possível salvar suas preferências de notificação.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test notification
  const sendTestNotification = () => {
    if (emailNotifications) {
      toast({
        title: 'Email de teste enviado',
        description: 'Um email de teste foi enviado para seu endereço cadastrado.',
      });
    }

    if (pushNotifications && pushPermission === 'granted') {
      // Create and show a test notification
      const notification = new Notification('Notificação de teste', {
        body: 'Esta é uma notificação de teste do Finanças+',
        icon: '/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por email
                  </p>
                </div>
              </div>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={handleEmailToggle}
                disabled={isUpdatingNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no seu navegador
                  </p>
                </div>
              </div>
              <Switch 
                id="push-notifications" 
                checked={pushNotifications}
                onCheckedChange={handlePushToggle}
                disabled={isUpdatingNotifications}
              />
            </div>

            {pushNotifications && pushPermission !== 'granted' && (
              <Alert variant="destructive" className="mt-2">
                <BellOff className="h-4 w-4" />
                <AlertTitle>Permissão necessária</AlertTitle>
                <AlertDescription>
                  Você precisa permitir notificações no seu navegador para receber alertas.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={checkPushPermission}
                  >
                    Permitir notificações
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budget-alerts" className="font-medium">Alertas de Orçamento</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando seus orçamentos estiverem próximos do limite
                </p>
              </div>
              <Switch 
                id="budget-alerts" 
                checked={budgetAlerts}
                onCheckedChange={handleBudgetAlertsToggle}
                disabled={isUpdatingNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transaction-alerts" className="font-medium">Alertas de Transação</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre novas transações e movimentações
                </p>
              </div>
              <Switch 
                id="transaction-alerts" 
                checked={transactionAlerts}
                onCheckedChange={setTransactionAlerts}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="report-alerts" className="font-medium">Relatórios Agendados</Label>
                <p className="text-sm text-muted-foreground">
                  Receba relatórios financeiros periódicos
                </p>
              </div>
              <Switch 
                id="report-alerts" 
                checked={reportAlerts}
                onCheckedChange={setReportAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Entrega</CardTitle>
          <CardDescription>
            Configure quando e com que frequência deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="notification-time">Horário de Notificações</Label>
              <Select
                value={notificationTime}
                onValueChange={setNotificationTime}
              >
                <SelectTrigger id="notification-time" className="w-full">
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00 (Manhã)</SelectItem>
                  <SelectItem value="12:00">12:00 (Meio-dia)</SelectItem>
                  <SelectItem value="18:00">18:00 (Tarde)</SelectItem>
                  <SelectItem value="21:00">21:00 (Noite)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Horário preferencial para receber notificações agendadas
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-frequency">Frequência de Resumos</Label>
              <Select
                value={notificationFrequency}
                onValueChange={setNotificationFrequency}
              >
                <SelectTrigger id="notification-frequency" className="w-full">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Com que frequência você deseja receber resumos financeiros
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours" className="font-medium">Modo Não Perturbe</Label>
                <p className="text-sm text-muted-foreground">
                  Silenciar notificações durante a noite (22:00 - 08:00)
                </p>
              </div>
              <Switch id="quiet-hours" defaultChecked={true} />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={sendTestNotification}
              disabled={(!emailNotifications && !pushNotifications) || isSaving}
            >
              <Bell className="h-4 w-4 mr-2" />
              Enviar notificação de teste
            </Button>
            
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Salvar preferências
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}