/** @jsxImportSource react */
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getLotissementProfitability } from '@/lib/real-estate.functions';
import { getCommercialPerformance, getCashFlowProjections } from '@/lib/sales.functions';
import { AreaChart, Area } from 'recharts';
import { getAgences } from '@/lib/settings.functions';
import { formatFCFA } from '@/lib/utils';
import { 
  TrendingUp, 
  Map, 
  Download,
  Building2,
  Search,
  ArrowUpRight,
  Target,
  Award,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute('/_authenticated/direction/performance')({
  head: () => ({
    meta: [
      { title: 'Rentabilité & Bilans | MSI 2.0' },
      { name: 'description', content: 'Tableau de bord de rentabilité nette par lotissement pour la Direction.' }
    ]
  }),
  component: PerformanceDirectionPage,
});

function PerformanceDirectionPage() {
  const [agenceId, setAgenceId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const { data: agences } = useQuery({
    queryKey: ['agences'],
    queryFn: () => getAgences(),
  });

  const { data: profitability, isLoading: loadingProfitability } = useQuery({
    queryKey: ['lotissement-profitability', agenceId],
    queryFn: () => getLotissementProfitability({ 
      data: { agenceId: agenceId === "all" ? undefined : agenceId } 
    }),
  });

  const { data: commercialPerf, isLoading: loadingCommercial } = useQuery({
    queryKey: ['commercial-performance', agenceId, dateRange.from, dateRange.to],
    queryFn: () => getCommercialPerformance({
      data: { 
        agenceId: agenceId === "all" ? undefined : agenceId,
        startDate: dateRange.from?.toISOString().split('T')[0],
        endDate: dateRange.to?.toISOString().split('T')[0]
      }
    }),
  });

  const { data: cashFlow, isLoading: loadingCashFlow } = useQuery({
    queryKey: ['cashflow-projections'],
    queryFn: () => getCashFlowProjections(),
  });

  const filteredData = useMemo(() => {
    if (!profitability) return [];
    return (profitability as any[]).filter(item => 
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [profitability, searchTerm]);

  const isLoading = loadingProfitability || loadingCommercial || loadingCashFlow;

  const exportCSV = () => {
    if (!commercialPerf) return;
    const headers = ["Agent", "Agence", "Ventes", "Valeur Totale", "Encaissé", "Reste à payer"];
    const rows = commercialPerf.map((p: any) => [
      p.agent_name,
      p.agency_name,
      p.total_sales,
      p.total_value,
      p.collected_amount,
      p.total_balance
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `performance_commerciale_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    if (!filteredData.length) return {
      totalPotential: 0,
      totalSold: 0,
      totalCollected: 0,
      totalCosts: 0,
      totalProfit: 0,
      avgROI: 0
    };

    const totals = filteredData.reduce((acc, curr) => ({
      totalPotential: acc.totalPotential + (curr.potential_value || 0),
      totalSold: acc.totalSold + (curr.sold_value || 0),
      totalCollected: acc.totalCollected + (curr.collected_amount || 0),
      totalCosts: acc.totalCosts + (curr.total_costs || 0),
      totalProfit: acc.totalProfit + (curr.net_profit || 0),
    }), {
      totalPotential: 0,
      totalSold: 0,
      totalCollected: 0,
      totalCosts: 0,
      totalProfit: 0,
    });

    return {
      ...totals,
      avgROI: totals.totalCosts > 0 ? (totals.totalCollected / totals.totalCosts) * 100 : 0
    };
  }, [filteredData]);

  if (isLoading) return <div className="p-8 text-center font-sans">Chargement des analyses stratégiques...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Analyses de Performance</h1>
          <p className="text-muted-foreground font-sans">
            Suivi des ventes et performance commerciale globale.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal font-sans">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd LLL yyyy", { locale: fr })} -{" "}
                      {format(dateRange.to, "dd LLL yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, "dd LLL yyyy", { locale: fr })
                  )
                ) : (
                  <span>Filtrer par période</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from || new Date()}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          <Select value={agenceId} onValueChange={setAgenceId}>
            <SelectTrigger className="w-[180px] font-sans">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les Agences</SelectItem>
              {agences?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2 font-sans" onClick={exportCSV}>
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2 font-sans" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Rapport PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              CA Encaissé (Réel)
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatFCFA(stats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur un CA vendu de {formatFCFA(stats.totalSold)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              Marge Nette Actuelle
              <ArrowUpRight className="h-4 w-4 text-[#D1127B]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-[#D1127B]' : 'text-red-600'}`}>
              {formatFCFA(stats.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit réel (Encaissé - Coûts)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              ROI Moyen
              <Target className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance sur capitaux engagés
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              Valeur du Stock
              <Map className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatFCFA(stats.totalPotential - stats.totalSold)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Potentiel résiduel invendu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top Performance Commerciale (Agents)
            </CardTitle>
            <CardDescription className="font-sans text-xs">Classement par volume de ventes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commercialPerf?.slice(0, 5) || []} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="agent_name" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'total_value' ? formatFCFA(value) : value, 
                      name === 'total_value' ? 'Valeur Ventes' : 'Nombre Ventes'
                    ]}
                  />
                  <Bar dataKey="total_sales" name="Ventes" fill="#D1127B" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Projections de Trésorerie (12 mois)
            </CardTitle>
            <CardDescription className="font-sans text-xs">Encaissements attendus basés sur les échéanciers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow || []}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
                      return `${months[parseInt(month) - 1]} ${year.substring(2)}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: number) => formatFCFA(value)}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Area type="monotone" dataKey="amount" name="Attendu" stroke="#10b981" fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-sans">Détails des Bilans par Site</CardTitle>
            <CardDescription className="font-sans text-xs">Tableau comparatif de la performance financière.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un site..." 
              className="pl-8 font-sans h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs font-sans">
              <thead className="bg-muted/50 border-b">
                <tr className="text-muted-foreground uppercase font-medium">
                  <th className="text-left p-3">Lotissement</th>
                  <th className="text-right p-3">Parcelles</th>
                  <th className="text-right p-3">CA Vendu</th>
                  <th className="text-right p-3">Encaissé</th>
                  <th className="text-right p-3">Coûts</th>
                  <th className="text-right p-3">Profit Net</th>
                  <th className="text-right p-3">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.location}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium">{item.sold_plots} / {item.total_plots}</div>
                      <div className="text-[10px] text-muted-foreground">vendues</div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatFCFA(item.sold_value || 0)}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">{formatFCFA(item.collected_amount || 0)}</td>
                    <td className="p-3 text-right text-red-600">{formatFCFA(item.total_costs || 0)}</td>
                    <td className={`p-3 text-right font-bold ${(item.net_profit || 0) >= 0 ? 'text-[#D1127B]' : 'text-red-700'}`}>
                      {formatFCFA(item.net_profit || 0)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (item.roi_percent || 0) >= 150 ? 'bg-emerald-100 text-emerald-700' : 
                        (item.roi_percent || 0) >= 100 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {(item.roi_percent || 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
