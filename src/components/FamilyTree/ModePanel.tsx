import { ViewMode, PersonNode } from "@/lib/familyTree/types";
import { X } from "lucide-react";

interface ModePanelProps {
  mode: ViewMode;
  isOpen: boolean;
  persons: PersonNode[];
  onApply: (person1?: PersonNode, person2?: PersonNode) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const ModePanel = ({ mode, isOpen, persons, onApply, onCancel, onClose }: ModePanelProps) => {
  if (mode === "tree" || !isOpen) return null;

  const sortedPersons = [...persons].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const person1Name = formData.get("person1") as string;
    const person2Name = formData.get("person2") as string;

    const person1 = persons.find((p) => p.name === person1Name);
    const person2 = person2Name ? persons.find((p) => p.name === person2Name) : undefined;

    if (mode === "path") {
      if (person1 && person2) {
        onApply(person1, person2);
      }
    } else if (person1) {
      onApply(person1, person2);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "ancestors":
        return "Ascendants de :";
      case "descendants":
        return "Descendants de :";
      case "path":
        return "Relation entre :";
      default:
        return "";
    }
  };

  return (
    <div className="fixed top-24 sm:top-32 md:top-36 right-4 sm:right-6 md:right-8 bg-card border border-border rounded-xl shadow-2xl p-2 sm:p-3 md:p-4 z-40 w-[calc(100vw-1rem)] sm:w-80 md:w-96 max-h-[70vh] overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <h3 className="font-semibold text-xs sm:text-sm md:text-base">{getTitle()}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
        <div>
          <select
            name="person1"
            required
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-background border border-border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">
              {mode === "path" ? "Personne 1" : "Sélectionner une personne"}
            </option>
            {sortedPersons.map((person) => (
              <option key={person.name} value={person.name}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        {mode === "path" && (
          <div>
            <select
              name="person2"
              required
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-background border border-border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Personne 2</option>
              {sortedPersons.map((person) => (
                <option key={person.name} value={person.name}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Afficher
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};
