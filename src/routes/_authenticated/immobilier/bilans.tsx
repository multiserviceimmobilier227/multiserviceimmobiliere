/** @jsxImportSource react */
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getLotissementProfitability } from '@/lib/real-estate.functions';
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
  Zap
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
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/_authenticated/immobilier/bilans')({
  head: () => ({
    meta: [
      { title: 'Bilans Stratégiques | MSI 2.0' },
      { name: 'description', content: 'Analyse de la rentabilité réelle par lotissement.' }
    ]
  }),
  component: BilansImmobilierPage,
});

function BilansImmobilierPage() {
  const [agenceId, setAgenceId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: agences } = useQuery({
    queryKey: ['agences'],
    queryFn: () => getAgences(),
  });

  const { data: profitability, isLoading } = useQuery({
    queryKey: ['lotissement-profitability', agenceId],
    queryFn: () => getLotissementProfitability({ 
      data: { agenceId: agenceId === "all" ? undefined : agenceId } 
    }),
  });

  const filteredData = useMemo(() => {
    if (!profitability) return [];
    return (profitability as any[]).filter(item => 
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [profitability, searchTerm]);

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

  const pieData = [
    { name: 'Encaissé', value: stats.totalCollected, color: '#10b981' },
    { name: 'Reste à payer', value: stats.totalSold - stats.totalCollected, color: '#f59e0b' },
    { name: 'Coûts (Acq + Dép)', value: stats.totalCosts, color: '#ef4444' },
  ];

  if (isLoading) return <div className="p-8 text-center font-sans">Chargement des bilans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Bilans & Rentabilité Nette</h1>
          <p className="text-muted-foreground font-sans">
            Analyse stratégique de la rentabilité réelle par lotissement.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" className="gap-2 font-sans">
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
              <Zap className="h-5 w-5 text-emerald-500" />
              Efficacité du Recouvrement par Site
            </CardTitle>
            <CardDescription className="font-sans text-xs">Comparaison CA Vendu vs CA Encaissé.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: number) => formatFCFA(value)} />
                  <Legend />
                  <Bar dataKey="sold_value" name="Vendu" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected_amount" name="Encaissé" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" />
              Répartition Financière & Efficacité
            </CardTitle>
            <CardDescription className="font-sans text-xs">Recouvrement vs Investissement.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-[250px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatFCFA(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-muted-foreground">Efficacité Recouvrement:</span>
                  <span className="font-bold text-emerald-600">
                    {stats.totalSold > 0 ? ((stats.totalCollected / stats.totalSold) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${stats.totalSold > 0 ? (stats.totalCollected / stats.totalSold) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-muted-foreground">Taux de Marge Réel:</span>
                  <span className="font-bold text-[#D1127B]">
                    {stats.totalSold > 0 ? ((stats.totalProfit / stats.totalSold) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D1127B] h-full transition-all duration-500" 
                    style={{ width: `${stats.totalSold > 0 ? Math.max(0, (stats.totalProfit / stats.totalSold) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
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
    </div>
  );
}
