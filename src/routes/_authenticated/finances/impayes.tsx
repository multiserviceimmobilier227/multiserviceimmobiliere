import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
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
import { AlertCircle, Clock, Search, FileText, Download, Filter, Building2, MapPin } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLotissements } from '@/lib/real-estate.functions';
import { getAgences } from '@/lib/settings.functions';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/finances/impayes')({
  component: ArrearsPage,
});

function ArrearsPage() {
  const { data: arrears } = useSuspenseQuery({
    queryKey: ['arrears-list'],
    queryFn: () => getArrearsList(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [lotissementFilter, setLotissementFilter] = useState('all');
  const [delayFilter, setDelayFilter] = useState('all');

  const fetchAgencies = useServerFn(getAgences);
  const fetchLotissements = useServerFn(getLotissements);

  const { data: agencies } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => fetchAgencies(),
  });

  const { data: lotissements } = useQuery({
    queryKey: ['lotissements'],
    queryFn: () => fetchLotissements(),
  });

  const filteredArrears = useMemo(() => {
    return arrears.filter((item: any) => {
      const matchSearch = 
        item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotissement_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client_phone?.includes(searchTerm);
      
      const matchAgency = agencyFilter === 'all' || item.agence_name === agencyFilter;
      const matchLotissement = lotissementFilter === 'all' || item.lotissement_name === lotissementFilter;
      
      let matchDelay = true;
      if (delayFilter === 'critical') matchDelay = item.is_critical_delay;
      else if (delayFilter === 'simple') matchDelay = !item.is_critical_delay;
      else if (delayFilter === 'very_critical') matchDelay = item.days_overdue > 90;

      return matchSearch && matchAgency && matchLotissement && matchDelay;
    });
  }, [arrears, searchTerm, agencyFilter, lotissementFilter, delayFilter]);

  const criticalCount = filteredArrears.filter((a: any) => a.is_critical_delay).length;
  const totalArrearsAmount = filteredArrears.reduce((acc: number, curr: any) => acc + (Number(curr.total_arrears) || 0), 0);

  const exportArrears = () => {
    const headers = ["Client", "Telephone", "Lotissement", "Agence", "Arriere (FCFA)", "Jours de retard", "Statut"];
    const csvContent = [
      headers.join(","),
      ...filteredArrears.map((a: any) => [
        `"${a.client_name}"`,
        `"${a.client_phone}"`,
        `"${a.lotissement_name}"`,
        `"${a.agence_name}"`,
        a.total_arrears,
        a.days_overdue,
        a.is_critical_delay ? "CRITIQUE" : "RETARD"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relances_impayes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Liste de relance exportée avec succès");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi des Impayés</h1>
          <p className="text-gray-500">Visualisation en temps réel des retards de paiement</p>
        </div>
        <Button onClick={exportArrears} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" /> Export Relance (CSV)
        </Button>
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
          <div className="space-y-4">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Agence
                </label>
                <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Toutes les agences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les agences</SelectItem>
                    {agencies?.map((agency: any) => (
                      <SelectItem key={agency.id} value={agency.name}>{agency.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Lotissement
                </label>
                <Select value={lotissementFilter} onValueChange={setLotissementFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tous les lotissements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les lotissements</SelectItem>
                    {lotissements?.map((lot: any) => (
                      <SelectItem key={lot.id} value={lot.name}>{lot.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Sévérité
                </label>
                <Select value={delayFilter} onValueChange={setDelayFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tous les retards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les retards</SelectItem>
                    <SelectItem value="simple">Retards simples (&lt; 60j)</SelectItem>
                    <SelectItem value="critical">Retards critiques (&gt; 60j)</SelectItem>
                    <SelectItem value="very_critical">Défaut grave (&gt; 90j)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      {formatFCFA(item.total_arrears)}
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
