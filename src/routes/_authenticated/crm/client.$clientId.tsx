import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClientDetails, addClientInteraction } from "@/lib/crm.functions";
import { cancelSale } from "@/lib/sales.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, History, LayoutGrid, Phone, Mail, MapPin, Plus, Upload, Eye, ShoppingCart, AlertTriangle, MessageSquare, Ban, UserCheck, MoreHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatDateNiamey } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientFormDialog } from "@/components/crm/ClientFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute as createTanstackRoute } from "@tanstack/react-router";

export const Route = createTanstackRoute("/_authenticated/crm/client/$clientId")({
  component: ClientDetails,
});

function ClientDetails() {
  const { clientId } = Route.useParams();
  const fetchClientDetails = useServerFn(getClientDetails);
  const queryClient = useQueryClient();
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [interactionNotes, setInteractionNotes] = useState("");
  const [interactionType, setInteractionType] = useState("Appel");
  const [isPdgActionOpen, setIsPdgActionOpen] = useState(false);
  const [pdgActionType, setPdgActionType] = useState<'convocation' | 'suspension' | 'autre'>('convocation');
  const [pdgActionNotes, setPdgActionNotes] = useState("");

  // Document upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("CNI");
  const [isUploading, setIsUploading] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => fetchClientDetails({ data: { id: clientId } }),
  });

  const mutation = useMutation({
    mutationFn: useServerFn(addClientInteraction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      toast.success("Interaction enregistrée");
      setIsAddingInteraction(false);
      setInteractionNotes("");
    },
  });

  const handleUploadDocument = async () => {
    if (!docFile || !docName) {
      toast.error("Veuillez sélectionner un fichier et donner un nom.");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = docFile.name.split('.').pop();
      const filePath = `${clientId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client_documents')
        .upload(filePath, docFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client_documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          name: docName,
          document_type: docType,
          file_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast.success("Document ajouté avec succès");
      setIsAddingDocument(false);
      setDocFile(null);
      setDocName("");
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div>Chargement du dossier...</div>;
  if (!client) return <div>Client introuvable</div>;

  const handlePdgAction = async () => {
    if (!pdgActionNotes) {
      toast.error("Veuillez saisir une note justificative.");
      return;
    }

    try {
      setIsActionPending(true);
      
      // 1. Log as interaction
      await mutation.mutateAsync({
        data: {
          client_id: clientId,
          interaction_type: pdgActionType === 'convocation' ? 'CONVOCATION DIRECTION' : 'SUSPENSION CONTRAT',
          notes: `ACTION PDG : ${pdgActionNotes}`
        }
      });

      toast.success("Action PDG enregistrée avec succès");
      setIsPdgActionOpen(false);
      setPdgActionNotes("");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'action.");
    } finally {
      setIsActionPending(false);
    }
  };

  const { data: userRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      return data?.role;
    }
  });

  const isPdg = userRole === 'pdg' || userRole === 'super_admin';
  return (
    <div className="space-y-6">
      {(client as any).has_critical_delay && (
        <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-bold text-lg">AVERTISSEMENT FORT : RETARD CRITIQUE</p>
              <p className="text-sm opacity-90">
                Ce client présente un retard de paiement de plus de 60 jours. 
                Montant total des arriérés : {new Intl.NumberFormat('fr-FR').format((client as any).total_arrears)} FCFA.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isPdg && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-red-600 border-none hover:bg-gray-100 font-bold">
                    <Ban className="mr-2 h-4 w-4" /> ACTIONS DIRECTION
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions Sanction/Recouvrement</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setPdgActionType('convocation'); setIsPdgActionOpen(true); }}>
                    <UserCheck className="mr-2 h-4 w-4" /> Convoquer le client
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => { setPdgActionType('suspension'); setIsPdgActionOpen(true); }}>
                    <Ban className="mr-2 h-4 w-4" /> Suspendre les contrats
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/ventes/$saleId" params={{ saleId: client.sales?.[0]?.id || "" }}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Régularisation forcée
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" className="bg-white text-red-600 border-none hover:bg-gray-100" asChild>
              <Link to="/ventes/$saleId" params={{ saleId: client.sales?.[0]?.id || "" }}>
                Régulariser
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#D1127B]/10 flex items-center justify-center text-[#D1127B] font-bold text-2xl">
            {client.first_name[0]}{client.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{(client as any).civilite} {(client as any).first_name} {(client as any).last_name}</h1>
              {(client as any).has_critical_delay && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> RETARD CRITIQUE
                </Badge>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{(client as any).occupation || "Profession non renseignée"}</Badge>
              <Badge variant="outline">Client ID: {(client as any).id.slice(0, 8)}</Badge>
              {(client as any).total_arrears > 0 && (
                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                  Arriéré : {new Intl.NumberFormat('fr-FR').format((client as any).total_arrears)} FCFA
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditingClient(true)}>Modifier la fiche</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contacts & Infos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Phone className="mr-3 h-4 w-4 text-gray-400" />
              <span>{(client as any).phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="mr-3 h-4 w-4 text-gray-400" />
              <span>{(client as any).email || "Aucun email"}</span>
            </div>

            <div className="flex items-center text-sm">
              <MapPin className="mr-3 h-4 w-4 text-gray-400" />
              <span>{(client as any).address || "Adresse non renseignée"}</span>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Nationalité</span>
                <span className="font-medium">{(client as any).nationalite || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Né le</span>
                <span className="font-medium">{(client as any).date_naissance || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Lieu</span>
                <span className="font-medium">{(client as any).lieu_naissance || "N/A"}</span>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-green-50/50 border-green-100">
              <CardContent className="pt-6">
                <div className="text-xs font-semibold text-green-600 uppercase mb-1">Total Payé</div>
                <div className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat('fr-FR').format(
                    client.sales?.reduce((acc: number, s: any) => acc + (Number(s.total_amount) - Number(s.balance)), 0) || 0
                  )} FCFA
                </div>
              </CardContent>
            </Card>
            <Card className={client.total_arrears > 0 ? "bg-red-50/50 border-red-100" : "bg-gray-50/50 border-gray-100"}>
              <CardContent className="pt-6">
                <div className="text-xs font-semibold text-red-600 uppercase mb-1">Total Arriérés</div>
                <div className="text-2xl font-bold text-red-700">
                  {new Intl.NumberFormat('fr-FR').format(client.total_arrears || 0)} FCFA
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="acquisitions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="acquisitions"><LayoutGrid className="mr-2 h-4 w-4" /> Acquisitions</TabsTrigger>
              <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Historique</TabsTrigger>
              <TabsTrigger value="profil"><User className="mr-2 h-4 w-4" /> Profil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="acquisitions" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {client.sales?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <LayoutGrid className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                      <p>Aucune acquisition en cours.</p>
                      <Button className="mt-4 bg-[#D1127B] hover:bg-[#b00e68]" asChild>
                        <Link to="/ventes/nouvelle" search={{ clientId: client.id }}>
                          Nouvelle Réservation
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {client.sales?.map((sale: any) => (
                        <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                              <ShoppingCart className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold">
                                Parcelle {sale.plots?.plot_number} - {sale.plots?.lotissements?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Statut: <Badge variant="outline" className="ml-1 scale-75 origin-left">{sale.status}</Badge> • 
                                Prix: {new Intl.NumberFormat('fr-FR').format(sale.total_amount)} FCFA
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/ventes/$saleId" params={{ saleId: sale.id }}>
                              <Eye className="mr-2 h-4 w-4" /> Détails
                            </Link>
                          </Button>
                        </div>
                      ))}
                      <Button className="w-full mt-4 bg-[#D1127B] hover:bg-[#b00e68]" asChild>
                        <Link to="/ventes/nouvelle" search={{ clientId: client.id }}>
                          <Plus className="mr-2 h-4 w-4" /> Nouvelle Acquisition
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Archivage Numérique</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingDocument(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {client.documents?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">Aucun document numérisé.</div>
                  ) : (
                    <div className="space-y-2">
                      {client.documents?.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center">
                            <FileText className="mr-3 h-5 w-5 text-[#D1127B]" />
                            <div>
                              <div className="text-sm font-medium">{doc.name}</div>
                              <div className="text-xs text-gray-400">{doc.document_type} • Ajouté le {formatDateNiamey(doc.created_at)}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Journal des Interactions</CardTitle>
                  <Button size="sm" onClick={() => setIsAddingInteraction(true)} disabled={isAddingInteraction}>
                    <Plus className="mr-2 h-4 w-4" /> Noter un échange
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAddingInteraction && (
                    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500">Type d'échange</label>
                          <Select value={interactionType} onValueChange={setInteractionType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Appel">Appel téléphonique</SelectItem>
                              <SelectItem value="Visite">Visite agence</SelectItem>
                              <SelectItem value="Courrier">Courrier / Email</SelectItem>
                              <SelectItem value="Réclamation">Réclamation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Notes / Compte-rendu</label>
                        <Textarea 
                          placeholder="Détails de l'échange..." 
                          value={interactionNotes}
                          onChange={(e) => setInteractionNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAddingInteraction(false)}>Annuler</Button>
                        <Button 
                          size="sm" 
                          className="bg-[#D1127B]" 
                          disabled={!interactionNotes || mutation.isPending}
                          onClick={() => mutation.mutate({ 
                            data: {
                              client_id: clientId, 
                              interaction_type: interactionType, 
                              notes: interactionNotes 
                            }
                          })}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  )}

                  {client.interactions?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">Aucun historique d'interaction.</div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      {client.interactions?.map((item: any) => (
                        <div key={item.id} className={`relative p-3 rounded-lg border ${item.notes?.includes('ACTION PDG') ? 'bg-red-50 border-red-100' : 'bg-white border-transparent'}`}>
                          <div className={`absolute -left-[1.85rem] top-4 h-4 w-4 rounded-full bg-white border-2 ${item.notes?.includes('ACTION PDG') ? 'border-red-600' : 'border-[#D1127B]'}`} />
                          <div className="text-xs text-gray-400 mb-1">{formatDateNiamey(item.interaction_date)}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold">{item.interaction_type}</div>
                            {item.notes?.includes('ACTION PDG') && (
                              <Badge variant="destructive" className="h-4 text-[10px]">DIRECTION</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.notes}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profil" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Civilité</div>
                      <div className="text-sm">{(client as any).civilite || "M."}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Type de pièce</div>
                      <div className="text-sm">{(client as any).id_type}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Numéro de pièce</div>
                      <div className="text-sm font-mono">{(client as any).id_number || "Non renseigné"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Profession</div>
                      <div className="text-sm">{(client as any).occupation || "N/A"}</div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ClientFormDialog 
        open={isEditingClient} 
        onOpenChange={setIsEditingClient} 
        client={client}
      />

      <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du document</label>
              <Input 
                placeholder="Ex: Scan CNI recto" 
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNI">CNI</SelectItem>
                  <SelectItem value="Passeport">Passeport</SelectItem>
                  <SelectItem value="Permis">Permis</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fichier</label>
              <Input 
                type="file" 
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddingDocument(false)}>Annuler</Button>
              <Button 
                className="bg-[#D1127B]" 
                onClick={handleUploadDocument}
                disabled={isUploading}
              >
                {isUploading ? "Upload en cours..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action PDG Dialog */}
      <Dialog open={isPdgActionOpen} onOpenChange={setIsPdgActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              {pdgActionType === 'convocation' ? 'Convocation Client' : 'Suspension de Contrat'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 p-3 rounded text-sm text-red-800 border border-red-100">
              <strong>Attention :</strong> Cette action sera enregistrée de manière indélébile dans l'historique du client avec votre signature.
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motif et instructions de la direction</label>
              <Textarea 
                placeholder="Précisez les conditions de reprise ou le motif de convocation..."
                className="h-32"
                value={pdgActionNotes}
                onChange={(e) => setPdgActionNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsPdgActionOpen(false)}>Annuler</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              disabled={isActionPending}
              onClick={handlePdgAction}
            >
              Confirmer l'Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
