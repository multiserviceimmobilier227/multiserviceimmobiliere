import { supabase } from "@/integrations/supabase/client";

/**
 * Composant Logo MSI Officiel
 * @param className Classes CSS optionnelles pour le dimensionnement
 */
export function MsiLogo({ className = "h-12 w-12" }: { className?: string }) {
  // Utilisation de l'URL directe du logo stocké dans Lovable Cloud (Supabase Storage)
  const logoUrl = "https://muerdwvxhquloiztqydp.supabase.co/storage/v1/object/public/assets/logo_msi.png";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoUrl} 
        alt="MSI Logo" 
        className="h-full w-auto object-contain"
        onError={(e) => {
          // Fallback en cas d'erreur de chargement de l'image
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<div class="bg-primary text-white font-bold p-2 rounded">MSI</div>');
        }}
      />
    </div>
  );
}
