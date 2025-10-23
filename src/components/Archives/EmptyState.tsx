import { FileText } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
      <FileText className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground/30 mb-4" />
      <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground">Aucune archive trouvée</h3>
      <p className="text-sm text-muted-foreground/80 mt-2">Aucun contenu disponible pour cette catégorie</p>
    </div>
  );
};
