import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClients } from "@/lib/crm.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Phone, MapPin, Eye, ShoppingCart, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ClientFormDialog } from "@/components/crm/ClientFormDialog";

export const Route = createFileRoute("/_authenticated/crm/")({
  component: CRMIndex,
});

function CRMIndex() {
  const [search, setSearch] = useState("");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const fetchClients = useServerFn(getClients);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => fetchClients({ data: { search } }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients & CRM</h1>
          <p className="text-gray-500">Gérez vos prospects et clients Multi Services Immobilière.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-[#D1127B] hover:bg-[#b00e68]"
            onClick={() => setIsNewClientOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Nouveau Client
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtres</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identité</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Pièce d'identité</TableHead>
                <TableHead className="text-center">Ventes</TableHead>
                <TableHead className="text-right">Actions</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell>
                </TableRow>
              ) : clients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun client trouvé.</TableCell>
                </TableRow>
              ) : (
                (clients as any[])?.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell className="relative">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {client.first_name} {client.last_name}
                        </div>
                        {client.has_critical_delay && (
                          <Badge variant="destructive" className="h-5 px-1 animate-pulse" title="RETARD CRITIQUE">
                            <AlertTriangle className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{client.occupation || "N/A"}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-3 w-3 text-gray-400" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="text-xs text-gray-500">{client.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-3 w-3 text-gray-400" />
                        {client.address || "Non renseignée"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {client.id_type} : {client.id_number || "..."}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.sales_count > 0 ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          {client.sales_count} {client.sales_count > 1 ? 'ventes' : 'vente'}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild className="text-[#D1127B] border-[#D1127B] hover:bg-[#D1127B]/10">
                        <Link to="/ventes/nouvelle" search={{ clientId: client.id }}>
                          <ShoppingCart className="mr-2 h-4 w-4" /> Vendre
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/crm/client/$clientId" params={{ clientId: client.id }}>
                          <Eye className="mr-2 h-4 w-4" /> Voir Dossier
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

      <ClientFormDialog 
        open={isNewClientOpen} 
        onOpenChange={setIsNewClientOpen} 
      />
    </div>
  );
}
