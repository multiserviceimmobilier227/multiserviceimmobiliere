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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: ReactNode;
  onClick?: () => void | undefined;
}

const NavItem = ({ to, icon: Icon, children, onClick }: NavItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
  >
    <Icon className="h-4 w-4" />
    {children}
  </Link>
);

const Navigation = ({ onItemClick }: { onItemClick?: () => void }) => (
  <nav className="space-y-6">
    <div>
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        Général
      </h2>
      <div className="space-y-1">
        <NavItem to="/" icon={LayoutDashboard} onClick={onItemClick}>Tableau de bord</NavItem>
      </div>
    </div>

    <div>
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        Immobilier
      </h2>
      <div className="space-y-1">
        <NavItem to="/immobilier/lotissements" icon={Map} onClick={onItemClick}>Parcelles & Lotissements</NavItem>
        <NavItem to="/immobilier/parcelles" icon={Map} onClick={onItemClick}>Suivi Parcelles</NavItem>
        <NavItem to="/immobilier/tarifs" icon={CreditCard} onClick={onItemClick}>Tarifs & Offres</NavItem>
        <NavItem to="/immobilier/acquisitions" icon={Building2} onClick={onItemClick}>Acquisitions & Coûts</NavItem>
      </div>
    </div>

    <div>
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        Clients & Ventes
      </h2>
      <div className="space-y-1">
        <NavItem to="/crm" icon={Users} onClick={onItemClick}>Clients</NavItem>
        <NavItem to="/crm" icon={FileText} onClick={onItemClick}>Contrats & Ventes</NavItem>
        <NavItem to="/crm" icon={History} onClick={onItemClick}>Réservations</NavItem>
      </div>
    </div>

    <div>
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        Finance
      </h2>
      <div className="space-y-1">
        <NavItem to="/" icon={Wallet} onClick={onItemClick}>Encaissements</NavItem>
        <NavItem to="/" icon={CreditCard} onClick={onItemClick}>Dépenses</NavItem>
        <NavItem to="/" icon={FileText} onClick={onItemClick}>Comptabilité</NavItem>
      </div>
    </div>

    <div>
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        Administration
      </h2>
      <div className="space-y-1">
        <NavItem to="/admin/users" icon={Users} onClick={onItemClick}>Utilisateurs</NavItem>
        <NavItem to="/admin/agences" icon={Building2} onClick={onItemClick}>Agences</NavItem>
        <NavItem to="/admin/audit" icon={History} onClick={onItemClick}>Journal d'Audit</NavItem>
        <NavItem to="/admin/settings" icon={SettingsIcon} onClick={onItemClick}>Paramètres</NavItem>
      </div>
    </div>
  </nav>
);

export function AppShell({ children }: { children?: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Logo = () => (
    <div className="flex items-center gap-2 font-bold text-primary">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-sans">
        MSI
      </div>
      <span className="text-xl tracking-tight font-sans">MSI 2.0</span>
    </div>
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
            <Navigation />
          </ScrollArea>
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-sans">
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
