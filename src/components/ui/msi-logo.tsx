/**
 * Composant Logo MSI Officiel
 * @param className Classes CSS optionnelles pour le dimensionnement
 */
export function MsiLogo({ className = "h-12 w-12" }: { className?: string }) {
  // Le logo officiel a été copié dans /public/logo_msi_official.png
  const logoPath = "/logo_msi_official.png"; 
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoPath} 
        alt="MSI Logo" 
        className="h-full w-auto object-contain"
        onError={(e) => {
          // Fallback avec l'ancien style si le fichier est manquant
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector('.msi-fallback')) {
             parent.insertAdjacentHTML('afterbegin', '<div class="msi-fallback bg-primary text-white font-bold p-2 rounded text-xs flex items-center justify-center min-w-[40px]">MSI</div>');
          }
        }}
      />
    </div>
  );
}
