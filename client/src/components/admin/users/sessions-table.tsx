'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRevokeSession } from '@/hooks/use-clients';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@/services/clientService';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SessionsTableProps {
  sessions: Session[];
  isLoading: boolean;
}

export function SessionsTable({ sessions, isLoading }: SessionsTableProps) {
  const { toast } = useToast();
  const { mutate: revokeSession, isPending } = useRevokeSession();
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const handleRevoke = (sessionId: string) => {
    revokeSession(sessionId, {
      onSuccess: () => {
        toast({
          title: 'Session tilbagekaldt',
          description: 'Klientens session er blevet tilbagekaldt.',
        });
        setSessionToRevoke(null);
      },
      onError: (error) => {
        toast({
          title: 'Fejl',
          description: error.message,
          variant: 'destructive',
        });
        setSessionToRevoke(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Ingen aktive sessioner fundet for denne klient.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Enhed ID</TableHead>
            <TableHead>Oprettet</TableHead>
            <TableHead>Session ID</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{session.device_id}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="font-mono text-xs truncate max-w-[200px]">{session.id}</TableCell>
              <TableCell className="text-right">
                <AlertDialog open={sessionToRevoke === session.id} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setSessionToRevoke(session.id)} disabled={isPending}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Tilbagekald
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dette vil tilbagekalde sessionen og klienten vil blive logget ud. De skal bruge invitationskoden igen for at logge ind.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuller</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRevoke(session.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending ? 'Tilbagekalder...' : 'Tilbagekald session'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
