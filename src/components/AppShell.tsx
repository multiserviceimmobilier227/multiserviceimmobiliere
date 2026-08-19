import { 
  Shield, 
  History, 
  Building2, 
  Settings, 
  Lock, 
  Calendar, 
  FileText,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  LayoutDashboard,
  Map,
  Tag
} from "lucide-react";
import { useUserRole } from "@/routes/_authenticated";
import { Link } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick: (() => void) | undefined;
}

function NavItem({ to, icon: Icon, label, onClick }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-sm font-medium font-sans [&.active]:bg-primary [&.active]:text-primary-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, checkPermission } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Navigation = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col gap-6 py-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Général
        </h2>
        <div className="space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Tableau de bord" onClick={onItemClick} />
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Immobilier
        </h2>
        <div className="space-y-1">
          {checkPermission('view_lotissements') && (
            <NavItem to="/immobilier/parcelles" icon={Building2} label="Parcelles & Lotissements" onClick={onItemClick} />
          )}
          {checkPermission('manage_plots') && (
            <NavItem to="/immobilier/suivi" icon={Map} label="Suivi Parcelles" onClick={onItemClick} />
          )}
          {checkPermission('view_tarifs') && (
            <NavItem to="/immobilier/tarifs" icon={Tag} label="Tarifs & Offres" onClick={onItemClick} />
          )}
          {checkPermission('view_acquisitions') && (
            <NavItem to="/immobilier/acquisitions" icon={History} label="Acquisitions & Coûts" onClick={onItemClick} />
          )}
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Clients & Ventes
        </h2>
        <div className="space-y-1">
          {checkPermission('view_clients') && (
            <NavItem to="/crm/clients" icon={Users} label="Clients" onClick={onItemClick} />
          )}
          {checkPermission('view_sales') && (
            <NavItem to="/crm/ventes" icon={FileText} label="Contrats & Ventes" onClick={onItemClick} />
          )}
          {checkPermission('view_reservations') && (
            <NavItem to="/immobilier/reservations" icon={Calendar} label="Réservations" onClick={onItemClick} />
          )}
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Finance
        </h2>
        <div className="space-y-1">
          {checkPermission('validate_payments') && (
            <NavItem to="/finance/encaissements" icon={ArrowDownLeft} label="Encaissements" onClick={onItemClick} />
          )}
          {checkPermission('view_expenses') && (
            <NavItem to="/finance/depenses" icon={ArrowUpRight} label="Dépenses" onClick={onItemClick} />
          )}
          {checkPermission('view_finance') && (
            <NavItem to="/finance/comptabilite" icon={PieChart} label="Comptabilité" onClick={onItemClick} />
          )}
        </div>
      </div>

      <div className="px-3 pb-8">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Administration
        </h2>
        <div className="space-y-1">
          {checkPermission('manage_users') && (
            <NavItem to="/admin/users" icon={Users} label="Utilisateurs" onClick={onItemClick} />
          )}
          {checkPermission('manage_agences') && (
            <NavItem to="/admin/agences" icon={Building2} label="Agences" onClick={onItemClick} />
          )}
          {checkPermission('manage_users') || role === 'pdg' ? (
            <NavItem to="/admin/permissions" icon={Lock} label="Matrice Permissions" onClick={onItemClick} />
          ) : null}
          {checkPermission('view_audit_logs') && (
            <NavItem to="/admin/audit" icon={History} label="Audit & Logs" onClick={onItemClick} />
          )}
          {checkPermission('manage_settings') && (
            <NavItem to="/admin/settings" icon={Settings} label="Paramètres" onClick={onItemClick} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="flex h-16 w-full items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-2 text-[#D1127B]">
          <div className="bg-[#D1127B] text-white p-1 rounded">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold font-sans">MSI 2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="flex items-center gap-2 font-sans text-[#D1127B]">
                  <div className="bg-[#D1127B] text-white p-1 rounded">
                    <Shield className="h-5 w-5" />
                  </div>
                  MSI 2.0
                </SheetTitle>
              </SheetHeader>
              <Navigation onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block shrink-0 h-screen sticky top-0">
        <div className="flex h-16 items-center gap-2 border-b px-6 text-[#D1127B]">
          <div className="bg-[#D1127B] text-white p-1 rounded">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold font-sans">MSI 2.0</span>
        </div>
        <Navigation />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-10">
          <div className="text-sm text-muted-foreground font-medium hidden md:block">
            MSI 2.0 — Gestion Immobilière
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold capitalize">{role?.replace('_', ' ') || 'Utilisateur'}</div>
              <div className="text-[10px] text-muted-foreground">Maradi, Niger</div>
            </div>
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                {role?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <div className="container p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
