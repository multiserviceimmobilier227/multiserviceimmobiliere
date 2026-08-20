import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getArrearsList } from '@/lib/sales.functions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Search, FileText } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/finances/impayes')({
  component: ArrearsPage,
});

function ArrearsPage() {
  const { data: arrears } = useSuspenseQuery({
    queryKey: ['arrears-list'],
    queryFn: () => getArrearsList(),
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredArrears = arrears.filter((item: any) => 
    item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lotissement_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalCount = arrears.filter((a: any) => a.is_critical_delay).length;
  const totalArrearsAmount = arrears.reduce((acc: number, curr: any) => acc + (Number(curr.total_arrears) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi des Impayés</h1>
          <p className="text-gray-500">Visualisation en temps réel des retards de paiement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total des Arriérés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatFCFA(totalArrearsAmount)}</div>
            <p className="text-xs text-gray-400 mt-1">Cumul des sommes attendues non payées</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Retards Critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{criticalCount} dossiers</div>
            <p className="text-xs text-gray-400 mt-1">Plus de 60 jours de retard</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Dossiers en Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{arrears.length} clients</div>
            <p className="text-xs text-gray-400 mt-1">Nombre total de ventes présentant un arriéré</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Liste des retards</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un client ou site..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Lotissement</TableHead>
                <TableHead className="text-right">Arriéré</TableHead>
                <TableHead className="text-center">Jours de retard</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArrears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun retard détecté correspondant à vos critères.
                  </TableCell>
                </TableRow>
              ) : (
                filteredArrears.map((item: any) => (
                  <TableRow key={item.sale_id} className={item.is_critical_delay ? "bg-red-50/50" : ""}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{item.client_name}</div>
                      <div className="text-xs text-gray-500">{item.client_phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.lotissement_name}</div>
                      <div className="text-xs text-gray-500">{item.agence_name}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(item.total_arrears)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {item.days_overdue} jours
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.is_critical_delay ? (
                        <Badge variant="destructive" className="animate-pulse">
                          CRITIQUE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          RETARD
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/ventes/$saleId" params={{ saleId: item.sale_id }}>
                          <FileText className="h-4 w-4 mr-2" />
                          Détails
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
