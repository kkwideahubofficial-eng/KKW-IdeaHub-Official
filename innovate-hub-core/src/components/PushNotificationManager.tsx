import React, { useState, useEffect } from 'react';
import axios from '../lib/axios'; // Ensure you have this configured or import axios directly
import { Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const PUBLIC_VAPID_KEY = 'BE72Pi7UFfcnxE6-mKR_H5v-l1A9pljjh-7wd8hNml0q7TMuuKoVAQYPct5zi7B4G01lM7ZUyNa3OwgxWfxBx4c';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotificationManager = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
    useEffect(() => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(reg => {
          setRegistration(reg);
          reg.pushManager.getSubscription().then(sub => {
            if (sub) {
              setSubscription(sub);
              setIsSubscribed(true);
            }
          });
        });
      }
    }, []);
  
    const subscribeUser = async () => {
      if (!registration) return;
      try {
        const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
        setSubscription(sub);
        setIsSubscribed(true);
  
        // Send subscription to backend
        await axios.post('/notifications/subscribe', sub);
        toast.success("Notifications enabled!");
      } catch (error) {
        console.error('Failed to subscribe the user: ', error);
        toast.error("Failed to enable notifications.");
      }
    };
  
    // Optional: Unsubscribe logic would go here
  
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
        return null; // Push not supported
    }

    // Only show if not subscribed, or strictly as a settings toggle
    if (isSubscribed) return null; 
  
    return (
        <div className="fixed bottom-20 right-4 z-50"> 
             <Button 
                onClick={subscribeUser} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2 shadow-lg"
            >
                <Bell className="w-5 h-5" />
                Enable Alerts
            </Button>
        </div>
    );
  };
  
  export default PushNotificationManager;
