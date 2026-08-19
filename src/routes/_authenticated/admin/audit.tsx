import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/lib/auth.functions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, User, Database, Clock } from "lucide-react";

import { useUserRole } from '@/routes/_authenticated';

export const Route = createFileRoute('/_authenticated/admin/audit')({
  component: AuditPage,
});

function AuditPage() {
  const { role, isLoading } = useUserRole();
  const { data: logs } = useSuspenseQuery({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs(),
  });

  if (isLoading) return null;

  if (!checkPermission('view_audit_logs')) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground font-sans">Accès non autorisé.</p>
      </div>
    );
  }



  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-sans">Journal d'Audit Universel</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="font-sans">Historique des Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans w-[180px]">Date</TableHead>
                <TableHead className="font-sans">Action</TableHead>
                <TableHead className="font-sans">Table</TableHead>
                <TableHead className="font-sans">Utilisateur</TableHead>
                <TableHead className="font-sans text-right">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-sans text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-sans text-[10px] ${getActionColor(log.action)}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-sans">
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-xs">{log.table_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-sans">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs truncate max-w-[120px]">{log.user_id || 'Système'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs text-primary hover:underline font-sans">
                      Voir modifications
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-sans">
                    Aucune trace d'audit trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
