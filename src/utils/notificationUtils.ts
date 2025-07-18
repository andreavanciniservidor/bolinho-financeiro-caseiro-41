/**
 * Utilitários para gerenciar notificações push
 */

/**
 * Verifica se o navegador suporta notificações
 * @returns Booleano indicando se o navegador suporta notificações
 */
export function supportsNotifications(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Solicita permissão para enviar notificações
 * @returns Promise que resolve com o status da permissão ('granted', 'denied', 'default')
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) {
    throw new Error('Este navegador não suporta notificações push');
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    throw error;
  }
}

/**
 * Verifica o status atual da permissão para notificações
 * @returns Status da permissão ('granted', 'denied', 'default')
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (!supportsNotifications()) {
    return 'denied';
  }
  
  return Notification.permission;
}

/**
 * Registra o dispositivo para receber notificações push
 * @returns Promise que resolve com a subscription
 */
export async function registerForPushNotifications(): Promise<PushSubscription | null> {
  if (!supportsNotifications()) {
    throw new Error('Este navegador não suporta notificações push');
  }
  
  try {
    // Verificar permissão
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return null;
    }
    
    // Obter registro do Service Worker
    const registration = await navigator.serviceWorker.ready;
    
    // Obter subscription existente ou criar uma nova
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Obter chave pública do servidor (em uma implementação real)
      // Aqui estamos usando uma chave de exemplo
      const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      // Converter a chave pública para Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      // Criar nova subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }
    
    // Enviar a subscription para o servidor (em uma implementação real)
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Erro ao registrar para notificações push:', error);
    throw error;
  }
}

/**
 * Cancela o registro para notificações push
 * @returns Promise que resolve quando o registro é cancelado
 */
export async function unregisterFromPushNotifications(): Promise<boolean> {
  if (!supportsNotifications()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Cancelar a subscription no servidor (em uma implementação real)
      // await deleteSubscriptionFromServer(subscription);
      
      // Cancelar a subscription no navegador
      const result = await subscription.unsubscribe();
      return result;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao cancelar registro para notificações push:', error);
    throw error;
  }
}

/**
 * Exibe uma notificação local (não push)
 * @param title Título da notificação
 * @param options Opções da notificação
 * @returns Promise que resolve quando a notificação é exibida
 */
export async function showLocalNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  if (!supportsNotifications()) {
    throw new Error('Este navegador não suporta notificações');
  }
  
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão para notificações não concedida');
    }
    
    const registration = await navigator.serviceWorker.ready;
    
    // Definir opções padrão
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      ...options
    };
    
    await registration.showNotification(title, defaultOptions);
  } catch (error) {
    console.error('Erro ao exibir notificação local:', error);
    throw error;
  }
}

/**
 * Converte uma string base64 para Uint8Array
 * @param base64String String em formato base64
 * @returns Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}