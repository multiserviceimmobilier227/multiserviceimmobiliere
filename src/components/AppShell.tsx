import { Shield, History, Building2, Settings, Lock } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getAuditLogs, getCurrentUserRole } from "@/lib/auth.functions";
import { useUserRole } from "@/routes/_authenticated";
import { toast } from "sonner";
import { AppRole, Permission } from "@/lib/permissions";
import { Link } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

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
  const { checkPermission } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Navigation = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Général
        </h2>
        <div className="space-y-1">
          <NavItem to="/" icon={Shield} label="Tableau de bord" onClick={onItemClick} />
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Immobilier
        </h2>
        <div className="space-y-1">
          {checkPermission('view_lotissements') && (
            <NavItem to="/immobilier/parcelles" icon={Building2} label="Parcelles & Lots" onClick={onItemClick} />
          )}
          {checkPermission('view_tarifs') && (
            <NavItem to="/immobilier/tarifs" icon={Settings} label="Tarifs & Prix" onClick={onItemClick} />
          )}
          {checkPermission('view_acquisitions') && (
            <NavItem to="/immobilier/acquisitions" icon={History} label="Acquisitions" onClick={onItemClick} />
          )}
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          CRM & Ventes
        </h2>
        <div className="space-y-1">
          {checkPermission('view_clients') && (
            <NavItem to="/crm/clients" icon={Shield} label="Clients" onClick={onItemClick} />
          )}
        </div>
      </div>

      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase font-sans">
          Administration
        </h2>
        <div className="space-y-1">
          {checkPermission('manage_users') && (
            <NavItem to="/admin/users" icon={Shield} label="Collaborateurs" onClick={onItemClick} />
          )}
          {checkPermission('manage_agences') && (
            <NavItem to="/admin/agences" icon={Building2} label="Agences" onClick={onItemClick} />
          )}
          {checkPermission('manage_users') && ( // PDG/Info can manage permissions
            <NavItem to="/admin/permissions" icon={Lock} label="Permissions" onClick={onItemClick} />
          )}
          {checkPermission('view_audit_logs') && (
            <NavItem to="/admin/audit" icon={History} label="Audit & Logs" onClick={onItemClick} />
          )}
          {checkPermission('manage_settings') && (
            <NavItem to="/admin/settings" icon={Settings} label="Configuration" onClick={onItemClick} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="flex h-16 w-full items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold font-sans">MSI 2.0</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="flex items-center gap-2 font-sans">
                <Shield className="h-6 w-6 text-primary" />
                MSI 2.0
              </SheetTitle>
            </SheetHeader>
            <Navigation onItemClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block shrink-0">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold font-sans">MSI 2.0</span>
        </div>
        <Navigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="container p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
