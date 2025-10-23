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
    // La clé unique force l'animation à se rejouer à chaque sélection
    <div 
      key={person.name}
      className="fixed bottom-0 sm:bottom-4 left-0 sm:left-4 w-full sm:w-80 md:w-96 bg-card/10 backdrop-blur-xl border-t sm:border border-border/5 shadow-2xl z-[60] animate-in slide-in-from-bottom-full sm:slide-in-from-left-full duration-300 sm:rounded-xl"
    >
      {/* CORRECTION MAJEURE :
        - 'max-h-[50dvh]' limite la hauteur totale du panneau à 50% de la hauteur de l'écran.
        - 'flex flex-col' est essentiel pour que la ScrollArea puisse s'étendre correctement.
      */}
      <div className="p-4 pt-3 sm:p-5 safe-area-inset-bottom max-h-[50dvh] sm:max-h-[70dvh] flex flex-col">
        {/* Poignée pour le design mobile */}
        <div className="sm:hidden flex justify-center pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30"></div>
        </div>

        {/* En-tête (ne défile pas) */}
        <div className="flex items-start gap-4 pb-4 border-b border-border/20 flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 bg-gradient-to-br ${avatarColor}`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="font-bold text-base md:text-lg leading-tight truncate">{person.name}</h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
              <span>{person.genre}</span>
              <GitCommit className="w-3 h-3 text-border rotate-90" />
              <span>Génération {person.level}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent/80 rounded-lg transition-colors flex-shrink-0 active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORRECTION MAJEURE :
          - 'flex-1' permet à cette zone de prendre toute la place verticale disponible.
          - 'min-h-0' est une astuce pour que le défilement fonctionne correctement dans un conteneur flex.
        */}
        <ScrollArea className="flex-1 min-h-0 -mx-4 sm:-mx-5">
            <div className="p-4 sm:p-5 space-y-4">
              {/* Parents */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Parents ({person.parents.length})
                </div>
                {person.parents.length > 0 ? (
                  <ul className="space-y-1.5">
                    {person.parents.map((parent) => (
                      <li key={parent} className="px-3 py-2 bg-muted/60 rounded-lg text-sm">{parent}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground/80">Information non disponible</p>
                )}
              </div>

              {/* Conjoints */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Heart className="w-3.5 h-3.5" />
                  Conjoint(s) ({person.spouses.length})
                </div>
                {person.spouses.length > 0 ? (
                  <ul className="space-y-1.5">
                    {person.spouses.map((spouse) => (
                      <li key={spouse} className="px-3 py-2 bg-muted/60 rounded-lg text-sm">{spouse}</li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-sm text-muted-foreground/80">Information non disponible</p>
                )}
              </div>

              {/* Enfants */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Baby className="w-3.5 h-3.5" />
                  Enfants ({person.enfants.length})
                </div>
                {person.enfants.length > 0 ? (
                  <ul className="space-y-1.5">
                    {person.enfants.map((child) => (
                      <li key={child} className="px-3 py-2 bg-muted/60 rounded-lg text-sm">{child}</li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-sm text-muted-foreground/80">Information non disponible</p>
                )}
              </div>
            </div>
        </ScrollArea>
        
        {/* Pied de page (ne défile pas) */}
        {person.enfants.length > 0 && (
          <div className="pt-4 mt-auto border-t border-border/20 flex-shrink-0">
            <button
              onClick={() => onToggleExpand(person)}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow"
            >
              {person.expanded ? "Réduire la descendance" : "Étendre la descendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};