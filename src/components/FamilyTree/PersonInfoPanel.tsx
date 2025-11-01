import { PersonNode } from "@/lib/familyTree/types";
import { X, Users, Heart, Baby, GitCommit, LucideIcon } from "lucide-react";

interface PersonInfoPanelProps {
  person: PersonNode | null;
  onClose: () => void;
  onToggleExpand: (person: PersonNode) => void;
}

interface InfoSectionProps {
  icon: LucideIcon;
  title: string;
  count: number;
  items: string[];
  emptyText: string;
}

const InfoSection = ({ icon: Icon, title, count, items, emptyText }: InfoSectionProps) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
      <Icon className="w-3 h-3" />
      {title} ({count})
    </div>
    {items.length > 0 ? (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="px-2.5 py-1.5 bg-muted/60 rounded-md text-xs">{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground/80">{emptyText}</p>
    )}
  </div>
);

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
        className="fixed bottom-0 sm:bottom-4 sm:right-4 left-0 sm:left-auto w-full sm:w-72 md:w-80 bg-card backdrop-blur-xl border-t sm:border border-border shadow-2xl z-[60] animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300 sm:rounded-xl max-h-[60dvh] sm:max-h-[65dvh] flex flex-col"
      >
        <div className="p-3 sm:p-4 safe-area-inset-bottom flex flex-col flex-1 min-h-0">
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

        <div className="flex-1 min-h-0 overflow-y-auto -mx-3 sm:-mx-4">
            <div className="p-3 sm:p-4 space-y-3">
              <InfoSection 
                icon={Users}
                title="Parents"
                count={person.parents.length}
                items={person.parents}
                emptyText="Information non disponible"
              />
              <InfoSection 
                icon={Heart}
                title="Conjoint(s)"
                count={person.spouses.length}
                items={person.spouses}
                emptyText="Information non disponible"
              />
              <InfoSection 
                icon={Baby}
                title="Enfants"
                count={person.enfants.length}
                items={person.enfants}
                emptyText="Information non disponible"
              />
            </div>
        </div>
        
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