'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Extract redirect URL from query params if present
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const redirectUrl = searchParams.get('redirect') || '/mindspace/admin';

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      setLocation(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        description: 'You have been logged in successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-md py-6">
        <Button variant="ghost" className="mb-4 text-meditation-primary hover:bg-meditation-primary/10" onClick={() => setLocation('/mindspace')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbage til forside
        </Button>

        <Card className="border-2 border-meditation-primary/20">
          <CardHeader className="space-y-1 meditation-header rounded-t-md">
            <div className="flex items-center justify-center mb-2">
              <Lock className="w-10 h-10 " />
            </div>
            <CardTitle className="text-2xl text-center ">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-200">Log ind for at få adgang til beskyttede sider</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.dk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-meditation-primary/30 focus-visible:ring-meditation-primary"
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
                  className="border-meditation-primary/30 focus-visible:ring-meditation-primary"
                />
              </div>
              <Button type="submit" className="w-full bg-meditation-primary hover:bg-meditation-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Logger ind...
                  </>
                ) : (
                  'Log ind'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">Dette er et beskyttet område kun for administratorer</CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
}
