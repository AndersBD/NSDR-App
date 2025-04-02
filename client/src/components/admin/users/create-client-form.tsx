'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateClient } from '@/hooks/use-clients';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CreateClientForm() {
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { mutate: createClient, isPending } = useCreateClient();

  // Generate a code when the component mounts
  useEffect(() => {
    generateInviteCode();
  }, []);

  const generateInviteCode = () => {
    // Generate a more secure alphanumeric string with 8 characters
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setInviteCode(code);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Kopieret!',
      description: 'Invitationskoden er kopieret til udklipsholderen',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !inviteCode) {
      toast({
        title: 'Validation Error',
        description: 'Client name and invite code are required',
        variant: 'destructive',
      });
      return;
    }

    createClient(
      { name, inviteCode },
      {
        onSuccess: () => {
          toast({
            title: 'Client Created',
            description: `New client "${name}" created with invite code ${inviteCode}`,
          });
          setName('');
          // Generate a new code after successful creation
          generateInviteCode();
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card className="border-2 border-meditation-primary/10 shadow-sm">
      <CardHeader className="bg-meditation-primary/5 border-b border-meditation-primary/10">
        <CardTitle className="text-meditation-primary">Opret ny klient</CardTitle>
        <CardDescription>Opret en ny klient og generer en invitationskode</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Klient navn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Indtast klient navn"
              className="border-meditation-primary/20 focus:border-meditation-primary focus:ring-meditation-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invitationskode</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Generer invitationskode"
                  className="border-meditation-primary/20 focus:border-meditation-primary focus:ring-meditation-primary pr-10"
                />
                {inviteCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-meditation-primary"
                    onClick={copyInviteCode}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateInviteCode}
                className="border-meditation-primary/20 text-meditation-primary hover:bg-meditation-primary/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Koden skal bruges af klienten til at logge ind i appen</p>
          </div>

          <Button type="submit" disabled={isPending || !name || !inviteCode} className="w-full bg-meditation-primary hover:bg-meditation-primary/90">
            {isPending ? 'Opretter...' : 'Opret klient'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
