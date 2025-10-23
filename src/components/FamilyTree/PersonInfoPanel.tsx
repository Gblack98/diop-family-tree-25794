import { PersonNode } from "@/lib/familyTree/types";
import { X, Users, Heart, Baby, GitCommit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PersonInfoPanelProps {
  person: PersonNode | null;
  onClose: () => void;
  onToggleExpand: (person: PersonNode) => void;
}

export const PersonInfoPanel = ({
  person,
  onClose,
  onToggleExpand,
}: PersonInfoPanelProps) => {
  // Si aucune personne n'est sélectionnée, on n'affiche rien.
  if (!person) return null;

  const initial = person.name.charAt(0).toUpperCase();
  const avatarColor =
    person.genre === "Homme"
      ? "from-[hsl(var(--male))] to-blue-600"
      : "from-[hsl(var(--female))] to-pink-600";

  return (
    <>
      {/* Overlay pour fermer en cliquant en dehors */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[59] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        key={person.name}
        className="fixed bottom-0 sm:bottom-4 sm:right-4 left-0 sm:left-auto w-full sm:w-72 md:w-80 bg-card backdrop-blur-xl border-t sm:border border-border shadow-2xl z-[60] animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300 sm:rounded-xl"
      >
        <div className="p-3 sm:p-4 safe-area-inset-bottom max-h-[40dvh] sm:max-h-[50dvh] flex flex-col">
        {/* Poignée pour le design mobile */}
        <div className="sm:hidden flex justify-center pb-1.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30"></div>
        </div>

        {/* En-tête (ne défile pas) */}
        <div className="flex items-start gap-3 pb-3 border-b border-border/20 flex-shrink-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 bg-gradient-to-br ${avatarColor}`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm sm:text-base leading-tight truncate">{person.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span>{person.genre}</span>
              <GitCommit className="w-2.5 h-2.5 text-border rotate-90" />
              <span>Gen. {person.level}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/80 rounded-lg transition-colors flex-shrink-0 active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0 -mx-3 sm:-mx-4">
            <div className="p-3 sm:p-4 space-y-3">
              {/* Parents */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Users className="w-3 h-3" />
                  Parents ({person.parents.length})
                </div>
                {person.parents.length > 0 ? (
                  <ul className="space-y-1">
                    {person.parents.map((parent) => (
                      <li key={parent} className="px-2.5 py-1.5 bg-muted/60 rounded-md text-xs">{parent}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/80">Information non disponible</p>
                )}
              </div>

              {/* Conjoints */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Heart className="w-3 h-3" />
                  Conjoint(s) ({person.spouses.length})
                </div>
                {person.spouses.length > 0 ? (
                  <ul className="space-y-1">
                    {person.spouses.map((spouse) => (
                      <li key={spouse} className="px-2.5 py-1.5 bg-muted/60 rounded-md text-xs">{spouse}</li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-xs text-muted-foreground/80">Information non disponible</p>
                )}
              </div>

              {/* Enfants */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Baby className="w-3 h-3" />
                  Enfants ({person.enfants.length})
                </div>
                {person.enfants.length > 0 ? (
                  <ul className="space-y-1">
                    {person.enfants.map((child) => (
                      <li key={child} className="px-2.5 py-1.5 bg-muted/60 rounded-md text-xs">{child}</li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-xs text-muted-foreground/80">Information non disponible</p>
                )}
              </div>
            </div>
        </ScrollArea>
        
        {/* Pied de page (ne défile pas) */}
        {person.enfants.length > 0 && (
          <div className="pt-3 mt-auto border-t border-border/20 flex-shrink-0">
            <button
              onClick={() => onToggleExpand(person)}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow"
            >
              {person.expanded ? "Réduire" : "Étendre"}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};