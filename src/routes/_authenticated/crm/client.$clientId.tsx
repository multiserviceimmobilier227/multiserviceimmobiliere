import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClientDetails, addClientInteraction } from "@/lib/crm.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, History, LayoutGrid, Phone, Mail, MapPin, Calendar, Briefcase, Plus } from "lucide-react";
import { formatDateNiamey } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/crm/client/$clientId")({
  component: ClientDetails,
});

function ClientDetails() {
  const { clientId } = Route.useParams();
  const fetchClientDetails = useServerFn(getClientDetails);
  const queryClient = useQueryClient();
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [interactionNotes, setInteractionNotes] = useState("");
  const [interactionType, setInteractionType] = useState("Appel");

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

  if (isLoading) return <div>Chargement du dossier...</div>;
  if (!client) return <div>Client introuvable</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#D1127B]/10 flex items-center justify-center text-[#D1127B] font-bold text-2xl">
            {client.first_name[0]}{client.last_name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.civilite} {client.first_name} {client.last_name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{client.occupation || "Profession non renseignée"}</Badge>
              <Badge variant="outline">Client ID: {client.id.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline">Modifier la fiche</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contacts & Infos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Phone className="mr-3 h-4 w-4 text-gray-400" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="mr-3 h-4 w-4 text-gray-400" />
              <span>{client.email || "Aucun email"}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-3 h-4 w-4 text-gray-400" />
              <span>{client.address || "Adresse non renseignée"}</span>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Nationalité</span>
                <span className="font-medium">{client.nationalite || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Né le</span>
                <span className="font-medium">{client.date_naissance || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Lieu</span>
                <span className="font-medium">{client.lieu_naissance || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="acquisitions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="acquisitions"><LayoutGrid className="mr-2 h-4 w-4" /> Acquisitions</TabsTrigger>
              <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Historique</TabsTrigger>
              <TabsTrigger value="profil"><User className="mr-2 h-4 w-4" /> Profil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="acquisitions" className="mt-4">
              <Card>
                <CardContent className="pt-6 text-center text-gray-500 py-12">
                  <LayoutGrid className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                  <p>Aucune acquisition en cours.</p>
                  <Button className="mt-4 bg-[#D1127B] hover:bg-[#b00e68]">Nouvelle Réservation</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Archivage Numérique</CardTitle>
                  <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
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
                          <Button variant="ghost" size="sm">Voir</Button>
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
                        <div key={item.id} className="relative">
                          <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-[#D1127B]" />
                          <div className="text-xs text-gray-400 mb-1">{formatDateNiamey(item.interaction_date)}</div>
                          <div className="text-sm font-semibold">{item.interaction_type}</div>
                          <div className="text-sm text-gray-600 mt-1">{item.notes}</div>
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
                      <div className="text-sm">{client.civilite || "M."}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Type de pièce</div>
                      <div className="text-sm">{client.id_type}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Numéro de pièce</div>
                      <div className="text-sm font-mono">{client.id_number || "Non renseigné"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Profession</div>
                      <div className="text-sm">{client.occupation || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
