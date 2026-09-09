/**
 * Cartographie centrale des écrans MSI 2.0 et des permissions requises.
 * La source de vérité reste la base (role_permissions + RLS) ; ceci pilote
 * l'affichage du menu et le garde-fou de navigation.
 */
export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: string }> = [
  { prefix: "/admin/users", permission: "manage_users" },
  { prefix: "/admin/agences", permission: "manage_agences" },
  { prefix: "/admin/audit", permission: "view_audit_logs" },
  { prefix: "/admin/settings", permission: "manage_settings" },
  { prefix: "/direction/performance", permission: "view_performance" },
  { prefix: "/finances/impayes", permission: "view_arrears" },
  { prefix: "/finances/validations", permission: "validate_sensitive_op" },
  { prefix: "/finances", permission: "view_finance" },
  { prefix: "/immobilier/bilans", permission: "view_performance" },
  { prefix: "/immobilier/inventaire", permission: "view_inventory" },
  { prefix: "/immobilier/tarifs", permission: "view_tarifs" },
  { prefix: "/immobilier/acquisitions", permission: "view_acquisitions" },
  { prefix: "/immobilier", permission: "view_lotissements" },
  { prefix: "/crm", permission: "view_clients" },
  { prefix: "/ventes", permission: "view_sales" },
];

export function requiredPermissionFor(pathname: string): string | null {
  const match = ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));
  return match ? match.permission : null;
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrateur",
  pdg: "PDG",
  comptable: "Comptable",
  secretaire: "Secrétaire",
  commercial: "Commercial",
  responsable_agence: "Responsable d'agence",
  informaticien: "Informaticien",
  client: "Client",
  admin: "Administrateur",
  moderator: "Modérateur",
  user: "Utilisateur",
};

export function roleLabel(role?: string | null): string {
  if (!role) return "Utilisateur";
  return ROLE_LABELS[role] ?? role;
}
