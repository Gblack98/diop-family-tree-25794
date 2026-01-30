import { useState } from "react";
import { Heart, X } from "lucide-react";

export const Dedication = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton discret - Mobile: bas droite (legend à gauche), Desktop: bas gauche (legend à droite) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-auto sm:left-6 z-50 p-3 bg-rose-500/90 backdrop-blur-sm border border-rose-400 rounded-full shadow-lg hover:bg-rose-500 hover:scale-110 transition-all duration-300 group"
        title="En mémoire de Binta Yama Seck"
      >
        <Heart className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-all" />
      </button>

      {/* Modal de dédicace */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/10 rounded-full mb-4">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                En mémoire de
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-rose-500 mt-1">
                Binta Yama Seck
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                1938 — 2020
              </p>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>
                Ce projet est dédié à ma grand-mère, <span className="text-foreground font-medium">Binta Yama Seck</span>,
                qui m'a profondément inspiré. Elle aimait me parler de ses parents, de mon histoire,
                et m'incitait à nouer des liens avec mes proches. C'est d'elle que me vient cet
                intérêt pour la généalogie.
              </p>
              <p>
                Elle évoquait souvent sa parenté avec mon grand-père Amadou Bamba Diop, et me
                parlait de Yacine Diop, la sœur de ce dernier, qu'elle aimait beaucoup. Elle était
                elle-même l'arrière-petite-fille de Fatou Diallo, fille d'Iba Diallo, frère de
                Gabar Biram Médor Diop.
              </p>
              <p>
                À travers cet arbre généalogique et toutes les recherches que j'ai menées sur
                notre histoire familiale, j'ai cherché à me rapprocher d'elle encore davantage,
                à redécouvrir son histoire et celle de nos ancêtres.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                Avec tout mon amour — Ton petit-fils
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
