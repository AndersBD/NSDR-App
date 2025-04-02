'use client';

import type React from 'react';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoginClient } from '@/hooks/use-login-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { useClientSession } from '@/lib/client-context';
import { Lock, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { mutate: loginClient } = useLoginClient();
  const { isAuthenticated: isClientAuthenticated, isLoading: isClientLoading, restoreSession } = useClientSession();

  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const redirectUrl = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    // If already authenticated as admin, follow the admin redirect
    if (isAuthenticated) {
      setLocation(redirectUrl);
      return;
    }

    // If client is already authenticated, go to welcome page
    if (isClientAuthenticated) {
      setLocation('/');
      return;
    }

    // If not authenticated, try to restore session
    if (!isClientLoading && !isClientAuthenticated) {
      restoreSession().then((restored) => {
        if (restored) {
          setLocation('/');
        }
      });
    }
  }, [isAuthenticated, isClientAuthenticated, isClientLoading]);

  const handleClientLogin = () => {
    // Generate a unique device ID or use a stored one
    const deviceId = localStorage.getItem('device_id') || `device_${Math.random().toString(36).substring(2, 15)}`;

    // Store the device ID for future use
    localStorage.setItem('device_id', deviceId);

    loginClient({
      inviteCode: inviteCode,
      deviceId: deviceId,
    });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: 'Login succesfuld',
        description: 'Du er blevet logget ind.',
      });
    } catch (error: any) {
      toast({
        title: 'Login fejlede',
        description: error.message || 'Tjek venligst dine login-oplysninger og prøv igen.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-md py-12">
        <Card className="border-2 border-meditation-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="space-y-1 bg-meditation-primary text-white">
            <div className="flex items-center justify-center mb-2">
              <Lock className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl text-center">MindSpace Login</CardTitle>
            <CardDescription className="text-center text-gray-100">Log ind for at få adgang til MindSpace</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Kunde</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite">Invitationskode</Label>
                  <Input
                    id="invite"
                    type="text"
                    placeholder="Indtast invitationskode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    className="border-meditation-primary/20 focus:border-meditation-primary focus:ring-meditation-primary"
                  />
                </div>
                <Button
                  onClick={handleClientLogin}
                  disabled={isSubmitting || !inviteCode}
                  className="w-full bg-meditation-primary hover:bg-meditation-primary/90"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : 'Log ind'}
                </Button>
                <CardFooter className="text-center text-sm text-muted-foreground border-t pt-6 pb-1">
                  <p className="w-full">Brug din invitationskode for at få adgang til MindSpace</p>
                </CardFooter>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@email.dk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-meditation-primary/20 focus:border-meditation-primary focus:ring-meditation-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kodeord</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-meditation-primary/20 focus:border-meditation-primary focus:ring-meditation-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-meditation-primary hover:bg-meditation-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : 'Log ind'}
                  </Button>
                </form>
                <CardFooter className="text-center text-sm text-muted-foreground border-t pt-6 pb-1">
                  <p className="w-full">Dette er et beskyttet område kun for administratorer</p>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
