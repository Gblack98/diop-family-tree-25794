import { TreeDeciduous, Users, Workflow, GitMerge, Archive } from "lucide-react";
import { ViewMode } from "@/lib/familyTree/types";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const MobileBottomNav = ({ currentMode, onModeChange }: MobileBottomNavProps) => {
  const location = useLocation();
  const isArchivesPage = location.pathname === "/archives";

  const modes: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: "tree", label: "Arbre", icon: TreeDeciduous },
    { value: "ancestors", label: "Ascendants", icon: Users },
    { value: "descendants", label: "Descendants", icon: Workflow },
    { value: "path", label: "Relation", icon: GitMerge },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
      <div className="grid grid-cols-5 h-16">
        {/* Navigation modes */}
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.value && !isArchivesPage;

          return (
            <button
              key={mode.value}
              onClick={() => onModeChange(mode.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "relative",
                isActive && "scale-110"
              )}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive && "font-bold"
              )}>
                {mode.label}
              </span>
            </button>
          );
        })}

        {/* Archives link */}
        <Link
          to="/archives"
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
            isArchivesPage
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "relative",
            isArchivesPage && "scale-110"
          )}>
            <Archive className="w-5 h-5" />
            {isArchivesPage && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
            )}
          </div>
          <span className={cn(
            "text-[10px] font-medium transition-all",
            isArchivesPage && "font-bold"
          )}>
            Archives
          </span>
        </Link>
      </div>
    </nav>
  );
};
