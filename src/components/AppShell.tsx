import { type ReactNode } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  FileText, 
  Settings as SettingsIcon,
  LogOut,
  Map,
  CreditCard,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: ReactNode;
}

const NavItem = ({ to, icon: Icon, children }: NavItemProps) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
  >
    <Icon className="h-4 w-4" />
    {children}
  </Link>
);

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center gap-2 font-bold text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-sans">
                MSI
              </div>
              <span className="text-xl tracking-tight font-sans">MSI 2.0</span>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-6">
              <div>
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Général
                </h2>
                <div className="space-y-1">
                  <NavItem to="/" icon={LayoutDashboard}>Tableau de bord</NavItem>
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Immobilier
                </h2>
                <div className="space-y-1">
                  <NavItem to="/immobilier/lotissements" icon={Map}>Parcelles & Lotissements</NavItem>
                  <NavItem to="/immobilier/parcelles" icon={Map}>Suivi Parcelles</NavItem>
                  <NavItem to="/immobilier/acquisitions" icon={Building2}>Acquisitions & Coûts</NavItem>
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Clients & Ventes
                </h2>
                <div className="space-y-1">
                  <NavItem to="/crm" icon={Users}>Clients</NavItem>
                  <NavItem to="/crm" icon={FileText}>Contrats & Ventes</NavItem>
                  <NavItem to="/crm" icon={History}>Réservations</NavItem>
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Finance
                </h2>
                <div className="space-y-1">
                  <NavItem to="/" icon={Wallet}>Encaissements</NavItem>
                  <NavItem to="/" icon={CreditCard}>Dépenses</NavItem>
                  <NavItem to="/" icon={FileText}>Comptabilité</NavItem>
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Administration
                </h2>
                <div className="space-y-1">
                  <NavItem to="/admin/users" icon={Users}>Utilisateurs</NavItem>
                  <NavItem to="/admin/agences" icon={Building2}>Agences</NavItem>
                  <NavItem to="/admin/audit" icon={History}>Journal d'Audit</NavItem>
                  <NavItem to="/admin/settings" icon={SettingsIcon}>Paramètres</NavItem>

                </div>
              </div>

            </nav>
          </ScrollArea>

          {/* Bottom section */}
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-sans">

              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur">
          <h1 className="text-lg font-semibold font-sans">MSI 2.0 — Gestion Immobilière</h1>
          <div className="flex items-center gap-4">
            <div className="text-right font-sans">
              <p className="text-sm font-medium">Administrateur</p>
              <p className="text-xs text-muted-foreground">Maradi, Niger</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </header>
        <div className="p-8 font-sans">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}

