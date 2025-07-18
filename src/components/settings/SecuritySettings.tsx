import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  AlertTriangle, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Loader2, 
  Lock, 
  LogOut, 
  Shield, 
  Smartphone, 
  Trash2, 
  UserX 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export function SecuritySettings() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  
  // Account deletion states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Activity log states
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  // Load activity logs on component mount
  useEffect(() => {
    if (user?.id) {
      loadMoreLogs();
    }
  }, [user?.id]);

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast({
        title: 'Senha inválida',
        description: 'A nova senha não atende aos requisitos de segurança.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!passwordsMatch) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação da senha não corresponde à nova senha.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // In a real implementation, we would verify the current password
      // and update the password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    if (checked) {
      // Start 2FA setup process
      setShowTwoFactorSetup(true);
      // In a real implementation, we would generate a secret and QR code
      setTwoFactorSecret('ABCDEFGHIJKLMNOP');
      setTwoFactorQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Financas%2B:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Financas%2B');
    } else {
      // Disable 2FA
      setTwoFactorEnabled(false);
      toast({
        title: 'Autenticação de dois fatores desativada',
        description: 'A autenticação de dois fatores foi desativada com sucesso.',
      });
    }
  };

  // Handle 2FA setup confirmation
  const handleTwoFactorSetup = async () => {
    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      toast({
        title: 'Código inválido',
        description: 'O código deve conter 6 dígitos.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsEnabling2FA(true);
    
    try {
      // In a real implementation, we would verify the code against the secret
      // and enable 2FA for the user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      toast({
        title: 'Autenticação de dois fatores ativada',
        description: 'A autenticação de dois fatores foi ativada com sucesso.',
      });
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: 'Erro ao ativar 2FA',
        description: 'Não foi possível ativar a autenticação de dois fatores. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsEnabling2FA(false);
      setTwoFactorCode('');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Digite EXCLUIR para confirmar a exclusão da conta.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // In a real implementation, we would delete the user's account
      // and all associated data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Conta excluída',
        description: 'Sua conta foi excluída com sucesso.',
      });
      
      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Erro ao excluir conta',
        description: 'Não foi possível excluir sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirmation(false);
      setDeleteConfirmText('');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Load activity logs
  const loadMoreLogs = async () => {
    setIsLoadingLogs(true);
    
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast({
        title: 'Erro ao carregar logs',
        description: 'Não foi possível carregar os logs de atividade.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {newPassword && (
                <div className="text-sm space-y-1 mt-1">
                  <p className="font-medium">A senha deve conter:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1">
                      {passwordValidation.minLength ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={passwordValidation.minLength ? 'text-green-500' : 'text-amber-500'}>
                        Mínimo de 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.hasUppercase ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={passwordValidation.hasUppercase ? 'text-green-500' : 'text-amber-500'}>
                        Uma letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.hasLowercase ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={passwordValidation.hasLowercase ? 'text-green-500' : 'text-amber-500'}>
                        Uma letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.hasNumber ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={passwordValidation.hasNumber ? 'text-green-500' : 'text-amber-500'}>
                        Um número
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.hasSpecial ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={passwordValidation.hasSpecial ? 'text-green-500' : 'text-amber-500'}>
                        Um caractere especial
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-500 mt-1">
                  As senhas não conferem
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isChangingPassword || !passwordValidation.isValid || !passwordsMatch || !currentPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="two-factor" className="font-medium">Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Proteja sua conta com um código adicional ao fazer login
                </p>
              </div>
            </div>
            <Switch 
              id="two-factor" 
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
          
          {twoFactorEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Autenticação de dois fatores ativada</AlertTitle>
              <AlertDescription>
                Sua conta está protegida com autenticação de dois fatores.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log de Atividades</CardTitle>
          <CardDescription>
            Monitore as atividades recentes da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-3 p-4 text-sm font-medium">
              <div>Evento</div>
              <div>Dispositivo</div>
              <div>Data e Hora</div>
            </div>
            <Separator />
            {activityLogs.map((log, index) => (
              <div key={log.id}>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <div>{log.event}</div>
                  <div>{log.device}</div>
                  <div>{formatDate(log.timestamp)}</div>
                </div>
                {index < activityLogs.length - 1 && <Separator />}
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={loadMoreLogs}
            disabled={isLoadingLogs}
          >
            {isLoadingLogs ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excluir Conta</CardTitle>
          <CardDescription>
            Exclua permanentemente sua conta e todos os seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir minha conta
          </Button>
        </CardFooter>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              Escaneie o código QR com um aplicativo autenticador como Google Authenticator ou Authy.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-2 border rounded-md">
              <img 
                src={twoFactorQrCode} 
                alt="QR Code para autenticação de dois fatores" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                value={twoFactorSecret}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(twoFactorSecret);
                  toast({
                    title: 'Código copiado',
                    description: 'O código secreto foi copiado para a área de transferência.',
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full space-y-2">
              <Label htmlFor="verification-code">Código de verificação</Label>
              <Input
                id="verification-code"
                placeholder="Digite o código de 6 dígitos"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTwoFactorSetup(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTwoFactorSetup}
              disabled={twoFactorCode.length !== 6 || isEnabling2FA}
            >
              {isEnabling2FA ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar e ativar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Conta</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <UserX className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Você está prestes a excluir sua conta. Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Digite <span className="font-bold">EXCLUIR</span> para confirmar
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'EXCLUIR' || isDeletingAccount}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir permanentemente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}