import { PersonNode } from "@/lib/familyTree/types";
import { X, Users, Heart, Baby, GitCommit, LucideIcon, ChevronDown, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide mb-2">
      <Icon className="w-3.5 h-3.5" />
      {title} <span className="text-muted-foreground ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded-full border border-border">{count}</span>
    </div>
    {items.length > 0 ? (
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm font-medium text-foreground pl-1 border-l-2 border-primary/20 hover:border-primary transition-colors cursor-default">
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground italic pl-1">{emptyText}</p>
    )}
  </div>
);

export const PersonInfoPanel = ({
  person,
  onClose,
  onToggleExpand,
}: PersonInfoPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Animation d'entrée fluide
  useEffect(() => {
    if (person) {
      // Petit délai pour laisser le temps au DOM de se préparer
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [person]);

  if (!person) return null;

  const initial = person.name.charAt(0).toUpperCase();
  // Harmonisé avec les couleurs de l'arbre principal (voir nodeHTML.ts)
  const avatarGradient = person.genre === "Homme"
      ? "bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(210,100%,46%)]"
      : "bg-gradient-to-br from-[hsl(340,70%,65%)] to-[hsl(330,76%,48%)]";

  return (
    <>
      {/* Overlay mobile (assombrit le fond pour le focus) */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[50] transition-opacity duration-300 sm:hidden ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Container Principal : Drawer Mobile / Card Desktop */}
      <div
        className={`
          fixed z-[60] bg-card border-border shadow-2xl flex flex-col
          transition-transform duration-300 ease-out

          /* MOBILE: Bottom Sheet (Tiroir du bas) */
          bottom-0 left-0 right-0
          rounded-t-2xl border-t
          max-h-[85dvh] h-auto
          ${isVisible ? "translate-y-0" : "translate-y-[100%]"}

          /* DESKTOP: Floating Card (Carte flottante) */
          sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto
          sm:w-80 sm:rounded-xl sm:border
          sm:max-h-[80vh]
          sm:${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}
        `}
      >
        {/* Poignée Mobile (Indicateur de scroll) */}
        <div 
          className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none" 
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
        </div>

        {/* En-tête de la fiche */}
        <div className="p-4 pb-2 flex items-start gap-4 flex-shrink-0">
          <div className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full shadow-md flex items-center justify-center text-white font-bold text-xl sm:text-lg flex-shrink-0 ring-4 ring-background ${avatarGradient}`}>
            {initial}
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="font-bold text-lg leading-tight text-foreground truncate pr-6">
              {person.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                {person.genre}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GitCommit className="w-3 h-3" />
                Gén. {person.level}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="hidden sm:flex p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors absolute top-3 right-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu Scrollable */}
        <div className="overflow-y-auto px-4 py-2 space-y-3 flex-1 safe-area-bottom">
           {/* Boutons d'action */}
           <div className="space-y-2 mb-3">
             {/* Bouton Vue Famille Isolée */}
             <button
               onClick={() => {
                 // Si beaucoup de conjoints ou d'enfants, utiliser la vue constellation
                 if (person.spouses.length > 1 || person.enfants.length > 5) {
                   navigate(`/constellation/${encodeURIComponent(person.name)}`);
                 } else {
                   navigate(`/family/${encodeURIComponent(person.name)}`);
                 }
               }}
               className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
             >
               <Eye className="w-4 h-4" /> Voir la famille de {person.name.split(' ')[0]}
             </button>

             {/* Bouton d'action (Voir enfants dans l'arbre) */}
             {person.enfants.length > 0 && (
              <button
                onClick={() => onToggleExpand(person)}
                className={`
                  w-full py-2.5 px-4 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2
                  ${person.expanded
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"}
                `}
              >
                {person.expanded ? (
                  <>
                    <ChevronDown className="w-4 h-4 rotate-180" /> Masquer les enfants
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Voir les enfants ({person.enfants.length})
                  </>
                )}
              </button>
            )}
          </div>

          <InfoSection 
            icon={Users}
            title="Parents"
            count={person.parents.length}
            items={person.parents}
            emptyText="Parents non renseignés"
          />
          
          <InfoSection 
            icon={Heart}
            title="Conjoint(s)"
            count={person.spouses.length}
            items={person.spouses}
            emptyText="Sans conjoint"
          />
          
          <InfoSection 
            icon={Baby}
            title="Enfants"
            count={person.enfants.length}
            items={person.enfants}
            emptyText="Sans enfants"
          />
          
          {/* Marge de sécurité en bas pour le scroll mobile */}
          <div className="h-6 sm:h-2" />
        </div>
      </div>
    </>
  );
};