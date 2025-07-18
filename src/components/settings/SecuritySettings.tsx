
import { useState, useEffect } from 'react';
import { Shield, Key, Activity, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  created_at: string;
  success: boolean;
  details?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export function SecuritySettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], isValid: false });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Carregar configurações de segurança
  useEffect(() => {
    loadSecuritySettings();
    loadSecurityEvents();
  }, [user]);

  const loadSecuritySettings = async () => {
    if (!user) return;

    try {
      // Load user security settings from profile or dedicated table
      // For now, using default values
      setTwoFactorEnabled(false);
      setLoginNotifications(true);
      setSessionTimeout(30);
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const loadSecurityEvents = async () => {
    if (!user) return;

    setIsLoadingEvents(true);
    try {
      // Mock security events - in a real app, this would come from a security_events table
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          event_type: 'login',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'São Paulo, SP',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          success: true,
          details: 'Login realizado com sucesso'
        },
        {
          id: '2',
          event_type: 'password_change',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'São Paulo, SP',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          success: true,
          details: 'Senha alterada com sucesso'
        },
        {
          id: '3',
          event_type: 'login_failed',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          location: 'Rio de Janeiro, RJ',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          success: false,
          details: 'Tentativa de login com senha incorreta'
        }
      ];

      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Error loading security events:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: 'Não foi possível carregar o histórico de segurança.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use pelo menos 8 caracteres');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua pelo menos uma letra maiúscula');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua pelo menos uma letra minúscula');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua pelo menos um número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Inclua pelo menos um caractere especial');
    }

    if (password.length >= 12) {
      score += 1;
    }

    return {
      score,
      feedback,
      isValid: score >= 4
    };
  };

  useEffect(() => {
    if (newPassword) {
      const strength = evaluatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [newPassword]);

  const handlePasswordChange = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro de validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    if (!passwordStrength.isValid) {
      toast({
        title: 'Senha muito fraca',
        description: 'Por favor, atenda aos critérios de segurança da senha.',
        variant: 'destructive'
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.'
      });

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Recarregar eventos de segurança
      loadSecurityEvents();
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      // In a real implementation, this would generate TOTP secret and QR code
      setQrCodeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: 'Erro ao ativar 2FA',
        description: 'Não foi possível ativar a autenticação de dois fatores.',
        variant: 'destructive'
      });
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'Por favor, insira um código de 6 dígitos.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // In a real implementation, verify the TOTP code
      setTwoFactorEnabled(true);
      setIsEnabling2FA(false);
      setVerificationCode('');
      setQrCodeUrl('');

      toast({
        title: '2FA ativado',
        description: 'Autenticação de dois fatores foi ativada com sucesso.'
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: 'Código inválido',
        description: 'O código inserido não é válido. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleDisable2FA = async () => {
    try {
      setTwoFactorEnabled(false);
      toast({
        title: '2FA desativado',
        description: 'Autenticação de dois fatores foi desativada.'
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Erro ao desativar 2FA',
        description: 'Não foi possível desativar a autenticação de dois fatores.',
        variant: 'destructive'
      });
    }
  };

  const getEventIcon = (eventType: string, success: boolean) => {
    if (!success) return <AlertCircle className="h-4 w-4 text-red-500" />;
    
    switch (eventType) {
      case 'login':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeName = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return 'Login';
      case 'password_change':
        return 'Alteração de Senha';
      case 'login_failed':
        return 'Falha no Login';
      default:
        return eventType;
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle>Alterar Senha</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Força da senha:</span>
                  <Badge variant={passwordStrength.score >= 4 ? 'default' : 'secondary'}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      getPasswordStrengthColor(passwordStrength.score)
                    )}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword || !passwordStrength.isValid || isChangingPassword}
            className="w-full"
          >
            {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle>Autenticação de Dois Fatores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.
          </CardDescription>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Status do 2FA</h4>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? 'Ativado' : 'Desativado'}
              </p>
            </div>
            <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
              {twoFactorEnabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {!twoFactorEnabled ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={handleEnable2FA}>Ativar 2FA</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ativar Autenticação de Dois Fatores</DialogTitle>
                  <DialogDescription>
                    Escaneie o código QR com seu aplicativo autenticador e insira o código de verificação.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code para 2FA" className="w-48 h-48" />
         
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de Verificação</Label>
                    <Input
                      id="verification-code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Digite o código de 6 dígitos"
                      maxLength={6}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEnabling2FA(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleVerify2FA}>
                    Verificar e Ativar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="destructive" onClick={handleDisable2FA}>
              Desativar 2FA
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações de Login</h4>
              <p className="text-sm text-gray-600">
                Receba notificações quando sua conta for acessada
              </p>
            </div>
            <Switch
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Timeout da sessão (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)}
            />
            <p className="text-sm text-gray-600">
              Sua sessão expirará automaticamente após este período de inatividade
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <CardTitle>Atividade de Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {securityEvents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade de segurança registrada
                </p>
              ) : (
                securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getEventIcon(event.event_type, event.success)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {getEventTypeName(event.event_type)}
                        </h4>
                        <Badge variant={event.success ? 'default' : 'destructive'}>
                          {event.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.details}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>IP: {event.ip_address}</span>
                        {event.location && <span>Local: {event.location}</span>}
                        <span>
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas de Segurança:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Use senhas únicas e complexas para cada conta</li>
            <li>• Ative a autenticação de dois fatores sempre que possível</li>
            <li>• Mantenha seus dispositivos e aplicativos atualizados</li>
            <li>• Desconfie de e-mails ou mensagens suspeitas</li>
            <li>• Monitore regularmente sua atividade de conta</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
