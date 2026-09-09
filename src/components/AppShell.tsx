import { type ReactNode, useState } from "react";
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
  History,
  Menu,
  X,
  PieChart,
  ClipboardList,
  Clock,
  Undo2,
  ShieldCheck
} from "lucide-react";


import { NotificationCenter } from "@/components/NotificationCenter";
import { CashJournalStatus } from "@/components/finance/CashJournalStatus";
import { MsiLogo } from "@/components/ui/msi-logo";
import { useAccess } from "@/hooks/useAccess";
import { roleLabel } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: ReactNode;
  onClick?: (() => void) | undefined;
  search?: Record<string, string> | undefined;
}

const NavItem = ({ to, icon: Icon, children, onClick, search }: NavItemProps) => (
  <Link
    to={to}
    search={search as never}
    onClick={onClick}
    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
  >
    <Icon className="h-4 w-4" />
    {children}
  </Link>
);

type NavEntry = {
  to: string;
  icon: React.ElementType;
  label: string;
  permission?: string;
  search?: Record<string, string>;
};

const NAV_SECTIONS: Array<{ title: string; items: NavEntry[] }> = [
  {
    title: "Général",
    items: [{ to: "/", icon: LayoutDashboard, label: "Tableau de bord", permission: "view_dashboard" }],
  },
  {
    title: "Immobilier",
    items: [
      { to: "/immobilier/lotissements", icon: Map, label: "Parcelles & Lotissements", permission: "view_lotissements" },
      { to: "/immobilier/bilans", icon: PieChart, label: "Bilans Stratégiques", permission: "view_performance" },
      { to: "/immobilier/inventaire", icon: ClipboardList, label: "Inventaire & Stock", permission: "view_inventory" },
      { to: "/immobilier/tarifs", icon: CreditCard, label: "Tarifs & Offres", permission: "view_tarifs" },
      { to: "/immobilier/acquisitions", icon: Building2, label: "Acquisitions & Coûts", permission: "view_acquisitions" },
    ],
  },
  {
    title: "Clients & Ventes",
    items: [
      { to: "/crm", icon: Users, label: "Clients", permission: "view_clients" },
      { to: "/ventes/liste", icon: FileText, label: "Contrats & Ventes", permission: "view_sales" },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/finances", icon: Wallet, label: "Journal de Caisse", permission: "view_finance", search: { tab: "overview" } },
      { to: "/finances/impayes", icon: Clock, label: "Retards & Impayés", permission: "view_arrears" },
      { to: "/finances/validations", icon: ShieldCheck, label: "Validations PDG", permission: "validate_sensitive_op" },
      { to: "/direction/performance", icon: PieChart, label: "Analyses & Performance", permission: "view_performance" },
      { to: "/finances", icon: Undo2, label: "Remboursements", permission: "manage_refunds", search: { tab: "refunds" } },
      { to: "/finances", icon: ClipboardList, label: "Audit & Flux", permission: "view_finance", search: { tab: "history" } },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/users", icon: Users, label: "Utilisateurs", permission: "manage_users" },
      { to: "/admin/agences", icon: Building2, label: "Agences", permission: "manage_agences" },
      { to: "/admin/audit", icon: History, label: "Journal d'Audit", permission: "view_audit_logs" },
      { to: "/admin/settings", icon: SettingsIcon, label: "Paramètres", permission: "manage_settings" },
    ],
  },
];

const Navigation = ({ onItemClick }: { onItemClick?: () => void }) => {
  const { can, isLoading } = useAccess();

  if (isLoading) {
    return (
      <div className="space-y-2 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const sections = NAV_SECTIONS
    .map((section) => ({ ...section, items: section.items.filter((item) => can(item.permission)) }))
    .filter((section) => section.items.length > 0);

  return (
    <nav className="space-y-6 pb-20">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
            {section.title}
          </h2>
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavItem
                key={`${item.to}-${item.label}`}
                to={item.to}
                icon={item.icon}
                search={item.search}
                onClick={onItemClick || undefined}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

export function AppShell({ children }: { children?: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { access, agency, primaryRole, can } = useAccess();
  const showCash = can("manage_cash_journal");
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };


  const Logo = () => (
    <Link to="/" className="flex items-center gap-2 font-bold text-primary hover:opacity-90 transition-opacity">
      <MsiLogo className="h-10 w-auto" />
      <span className="text-xl tracking-tight font-sans hidden sm:inline-block">MSI 2.0</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Logo />
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            {showCash && (
              <div className="mb-6">
                <CashJournalStatus />
              </div>
            )}
            <Navigation />
          </ScrollArea>
          <div className="border-t p-4">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-sans">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-8 backdrop-blur">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex h-16 items-center border-b px-6">
                    <Logo />
                  </div>
                  <ScrollArea className="flex-1 px-4 py-4">
                    <div className="mb-6">
                      <CashJournalStatus />
                    </div>
                    <Navigation onItemClick={() => setIsMobileMenuOpen(false)} />
                  </ScrollArea>
                  <div className="border-t p-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-sans">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold font-sans truncate max-w-[200px] md:max-w-none">
              MSI 2.0 — Gestion Immobilière
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationCenter />
            <div className="hidden sm:block text-right font-sans">

              <p className="text-sm font-medium">Administrateur</p>
              <p className="text-xs text-muted-foreground">Maradi, Niger</p>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-8" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 font-sans max-w-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
