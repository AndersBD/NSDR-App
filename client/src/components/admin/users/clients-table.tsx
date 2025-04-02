'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/services/clientService';
import { formatDistanceToNow } from 'date-fns';
import { Check, Copy, Eye } from 'lucide-react';
import { useState } from 'react';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onViewSessions: (clientId: string, clientName: string) => void;
}

export function ClientsTable({ clients, isLoading, onViewSessions }: ClientsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyInviteCode = (code: string, clientName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Kopieret!',
      description: `Invitationskoden for ${clientName} er kopieret til udklipsholderen`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <p className="text-muted-foreground mb-4">Ingen klienter fundet</p>
        <p className="text-sm text-muted-foreground">Opret en ny klient for at komme i gang</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Invitationskode</TableHead>
            <TableHead>Oprettet</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{client.client_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => copyInviteCode(client.invite_code, client.client_name)}
                  >
                    {client.invite_code}
                    {copiedId === client.invite_code ? <Check className="w-3.5 h-3.5 ml-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 ml-1 opacity-50" />}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(client.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSessions(client.id, client.client_name)}
                  className="text-meditation-primary hover:bg-meditation-primary/10 hover:text-meditation-primary"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Se sessioner
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
