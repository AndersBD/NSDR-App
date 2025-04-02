import { validateSession } from '@/lib/session';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from './supabase';

type ClientSessionContextType = {
  clientId: string | null;
  sessionId: string | null;
  deviceId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  restoreSession: () => Promise<boolean>;
  clearSession: () => void;
};

const ClientSessionContext = createContext<ClientSessionContextType | undefined>(undefined);

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [clientId, setClientId] = useState<string | null>(localStorage.getItem('client_id'));
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [deviceId, setDeviceId] = useState<string | null>(localStorage.getItem('device_id'));
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const validationIntervalRef = useRef<number | null>(null);

  // Function to restore client session
  const restoreSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // First try with sessionId if available
      const sessionId = localStorage.getItem('sessionId');

      if (sessionId) {
        const session = await validateSession(sessionId);
        if (session) {
          // Session is valid
          console.log('Successfully validated existing session');
          setSessionId(sessionId);
          setClientId(localStorage.getItem('client_id'));
          setIsLoading(false);
          return true;
        } else {
          console.log('Session ID in localStorage is no longer valid');
        }
      }

      // If we get here, either there was no sessionId or it was invalid
      // Try using device ID as a fallback
      const deviceId = localStorage.getItem('device_id');
      if (deviceId) {
        console.log('Attempting to find session by device ID:', deviceId);

        const { data, error } = await supabase.from('sessions').select('*').eq('device_id', deviceId);

        if (error) {
          console.error('Error looking up session by device ID:', error);
        } else if (data && data.length > 0) {
          // Found a session for this device
          const session = data[0];
          console.log('Found existing session by device ID:', session);

          // Save to localStorage and state
          localStorage.setItem('sessionId', session.id);
          localStorage.setItem('client_id', session.client_id);

          setSessionId(session.id);
          setClientId(session.client_id);

          setIsLoading(false);
          return true;
        }
      }

      // No valid session found
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error in restoreSession:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Function to clear client session
  const clearSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('client_id');
    // We keep device_id to allow for new login with same device

    setSessionId(null);
    setClientId(null);

    // Stop validation interval when session is cleared
    if (validationIntervalRef.current) {
      window.clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
  };

  // Set up periodic session validation
  useEffect(() => {
    // Only start interval if we have a session
    if (sessionId) {
      // Start a 60-second interval to validate the session
      validationIntervalRef.current = window.setInterval(async () => {
        console.log('Validating session...');
        try {
          const session = await validateSession(sessionId);
          if (!session) {
            console.log('Session no longer valid, redirecting to login...');
            clearSession();
            setLocation('/login');
          }
        } catch (error) {
          console.error('Error validating session:', error);
        }
      }, 60000); // Check every minute
    }

    // Cleanup interval when component unmounts or sessionId changes
    return () => {
      if (validationIntervalRef.current) {
        window.clearInterval(validationIntervalRef.current);
      }
    };
  }, [sessionId, setLocation]);

  // Try to auto-restore session on app initialization
  useEffect(() => {
    restoreSession().then((isValid) => {
      if (!isValid && window.location.pathname !== '/login') {
        // If session is invalid and we're not already on login page, redirect
        setLocation('/login');
      }
    });
  }, []);

  return (
    <ClientSessionContext.Provider
      value={{
        clientId,
        sessionId,
        deviceId,
        isLoading,
        isAuthenticated: Boolean(sessionId && clientId),
        restoreSession,
        clearSession,
      }}
    >
      {children}
    </ClientSessionContext.Provider>
  );
}

export function useClientSession() {
  const context = useContext(ClientSessionContext);
  if (context === undefined) {
    throw new Error('useClientSession must be used within a ClientSessionProvider');
  }
  return context;
}
