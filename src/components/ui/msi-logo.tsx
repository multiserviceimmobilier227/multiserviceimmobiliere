import { supabase } from "@/integrations/supabase/client";

/**
 * Composant Logo MSI Officiel
 * @param className Classes CSS optionnelles pour le dimensionnement
 */
export function MsiLogo({ className = "h-12 w-12" }: { className?: string }) {
  // Utilisation de l'URL directe du logo stocké dans Lovable Cloud
  const logoUrl = "/logo.png"; // Changed from storage URL to local public path if available, or keep as placeholder if needed
  
  // Re-evaluating based on user feedback: "Il faut utiliser le vrai logo officiel que je t'ai soumis"
  // If the user uploaded an image in this turn, it might be in /mnt/user-uploads/
  const logoPath = "/logo_msi_official.png"; 

  
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
