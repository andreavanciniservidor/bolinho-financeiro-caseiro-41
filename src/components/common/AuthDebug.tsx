import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
      }
      setAuthState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'guest@example.com',
        password: 'guest123'
      });
      
      if (error) {
        setError(error.message);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Diagnóstico de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={checkAuth} disabled={loading}>
            Verificar Estado da Autenticação
          </Button>
          <Button onClick={signInAsGuest} disabled={loading} variant="outline">
            Entrar como Convidado
          </Button>
        </div>
        
        {loading && <p>Carregando...</p>}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
          </div>
        )}
        
        {authState && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-semibold">Estado da Autenticação:</p>
            <pre className="text-xs overflow-auto mt-2">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}