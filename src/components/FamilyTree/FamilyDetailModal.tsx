import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PersonNode } from "@/lib/familyTree/types";
import { X, Users, Heart, Baby } from "lucide-react";

interface FamilyDetailModalProps {
  person: PersonNode | null;
  allPersons: PersonNode[];
  onClose: () => void;
}

export const FamilyDetailModal = ({ person, allPersons, onClose }: FamilyDetailModalProps) => {
  if (!person) return null;

  // Create a map for quick lookup
  const personMap = new Map<string, PersonNode>();
  allPersons.forEach(p => personMap.set(p.name, p));

  const initial = person.name.charAt(0).toUpperCase();
  const avatarGradient = person.genre === "Homme"
    ? "bg-gradient-to-br from-blue-500 to-blue-700"
    : "bg-gradient-to-br from-pink-500 to-rose-600";

  return (
    <Dialog open={!!person} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${avatarGradient} flex items-center justify-center text-white font-bold text-xl`}>
              {initial}
            </div>
            <div>
              <div className="text-xl font-bold">{person.name}</div>
              <div className="text-sm text-muted-foreground">Famille nombreuse - {person.enfants.length} enfants</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Conjoints */}
          {person.spouses.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <Heart className="w-4 h-4" />
                Conjoint(s) ({person.spouses.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {person.spouses.map((spouseName) => {
                  const spouse = personMap.get(spouseName);
                  const isHomme = spouse?.genre === "Homme";
                  const roleLabel = isHomme ? "Mari" : "Épouse";
                  const bgGradient = isHomme
                    ? "bg-gradient-to-br from-blue-500 to-blue-700"
                    : "bg-gradient-to-br from-pink-500 to-rose-600";
                  return (
                    <div key={spouseName} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <div className={`w-8 h-8 rounded-full ${bgGradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {spouseName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">{spouseName}</span>
                        <span className="text-xs text-muted-foreground">{roleLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enfants */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
              <Baby className="w-4 h-4" />
              Enfants ({person.enfants.length})
            </div>
            {person.enfants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun enfant</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {person.enfants.map((childName) => {
                  const child = personMap.get(childName);
                  const isHomme = child?.genre === "Homme";
                  const roleLabel = isHomme ? "Fils" : "Fille";
                  const bgGradient = isHomme
                    ? "bg-gradient-to-br from-blue-500 to-blue-700"
                    : "bg-gradient-to-br from-pink-500 to-rose-600";
                  return (
                    <div key={childName} className="flex items-center gap-2 p-2 bg-background rounded border hover:border-primary transition-colors cursor-default">
                      <div className={`w-8 h-8 rounded-full ${bgGradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {childName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{childName}</span>
                        <span className="text-xs text-muted-foreground">{roleLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Parents */}
          {person.parents.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <Users className="w-4 h-4" />
                Parents ({person.parents.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {person.parents.map((parentName) => {
                  const parent = personMap.get(parentName);
                  const isHomme = parent?.genre === "Homme";
                  const roleLabel = isHomme ? "Père" : "Mère";
                  const bgGradient = isHomme
                    ? "bg-gradient-to-br from-blue-500 to-blue-700"
                    : "bg-gradient-to-br from-pink-500 to-rose-600";
                  return (
                    <div key={parentName} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <div className={`w-8 h-8 rounded-full ${bgGradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {parentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">{parentName}</span>
                        <span className="text-xs text-muted-foreground">{roleLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
};
