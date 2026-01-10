import { Link } from "react-router-dom";
import { ArrowLeft, TreeDeciduous, Users, Eye, Palette, ZoomIn, Hand, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold">Guide d'utilisation</h1>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">

        {/* Introduction */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold">Bienvenue dans l'arbre généalogique de la famille Diop</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Cette application vous permet d'explorer l'histoire de la famille Diop à travers plusieurs vues interactives.
            Découvrez les relations familiales, les descendants et les ancêtres de chaque membre.
          </p>
        </section>

        {/* Les différentes vues */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <TreeDeciduous className="w-6 h-6 text-primary" />
            Les différentes vues
          </h2>

          {/* Arbre principal */}
          <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TreeDeciduous className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-base sm:text-lg">Arbre Principal (Accueil)</h3>
                <p className="text-sm text-muted-foreground">
                  Affiche la lignée familiale directe. Seules les personnes ayant des ancêtres dans l'arbre sont visibles.
                  Les conjoints "externes" (sans ancêtres) sont exclus pour une meilleure lisibilité.
                </p>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-primary mb-2">💡 Astuce:</p>
                  <ul className="text-xs sm:text-sm space-y-1 text-muted-foreground">
                    <li>• Utilisez la molette pour zoomer/dézoomer</li>
                    <li>• Cliquez et glissez pour déplacer la vue</li>
                    <li>• Cliquez sur une personne pour voir ses détails</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Vue Famille */}
          <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-base sm:text-lg">Vue Famille Isolée</h3>
                <p className="text-sm text-muted-foreground">
                  Affiche une personne avec <strong>tous ses conjoints</strong> et ses enfants directs.
                  Idéale pour les familles simples (moins de 5 enfants et 1-2 conjoints).
                </p>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-primary mb-2">✨ Caractéristiques:</p>
                  <ul className="text-xs sm:text-sm space-y-1 text-muted-foreground">
                    <li>• Affichage hiérarchique clair</li>
                    <li>• Tous les conjoints visibles (même sans ancêtres)</li>
                    <li>• Navigation vers les enfants qui ont eux-mêmes des enfants</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Code couleur */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            Code couleur
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Personnes de la lignée */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <h3 className="font-semibold text-sm sm:text-base">Famille directe</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(210,100%,46%)] flex-shrink-0" />
                  <span className="text-sm">Homme de la lignée</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(340,70%,65%)] to-[hsl(330,76%,48%)] flex-shrink-0" />
                  <span className="text-sm">Femme de la lignée</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Ces couleurs indiquent les personnes ayant des ancêtres dans l'arbre généalogique.
              </p>
            </div>

            {/* Conjoints externes */}
            <div className="bg-gradient-to-br from-orange-500/5 to-purple-500/5 p-4 rounded-xl border-2 border-dashed border-orange-500/20 space-y-3">
              <h3 className="font-semibold text-sm sm:text-base">Conjoints externes 🔗</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(280,60%,55%)] to-[hsl(270,65%,48%)] flex-shrink-0" />
                  <span className="text-sm">Conjoint externe (H)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(35,85%,60%)] to-[hsl(25,90%,55%)] flex-shrink-0" />
                  <span className="text-sm">Conjointe externe (F)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Conjoints sans ancêtres dans l'arbre. Visibles uniquement dans les vues famille dédiées.
              </p>
            </div>
          </div>
        </section>

        {/* Contrôles */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Hand className="w-6 h-6 text-primary" />
            Contrôles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <ZoomIn className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Zoom & Navigation</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Molette de souris:</strong> Zoomer/Dézoomer</li>
                <li>• <strong>Clic + Glisser:</strong> Déplacer la vue</li>
                <li>• <strong>Touch (mobile):</strong> Pincer pour zoomer, glisser avec 2 doigts</li>
                <li>• <strong>Boutons:</strong> Centrer et Ajuster disponibles</li>
              </ul>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Interactions</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Clic sur personne:</strong> Voir détails</li>
                <li>• <strong>Hover (survol):</strong> Tooltip avec infos</li>
                <li>• <strong>Badge →:</strong> Naviguer vers la famille de cette personne</li>
                <li>• <strong>Recherche:</strong> Trouver rapidement quelqu'un</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Navigation</h2>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
            <p>
              Lorsque vous cliquez sur "Voir la famille de X", vous accédez à une vue dédiée montrant la personne avec tous ses conjoints et enfants directs.
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Vue claire et organisée</strong> de la famille immédiate</li>
              <li>• <strong>Tous les conjoints visibles</strong> (même ceux sans ancêtres dans l'arbre)</li>
              <li>• <strong>Navigation fluide</strong> entre les générations</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 pb-4 text-sm text-muted-foreground">
          <p>Arbre généalogique de la famille Diop</p>
          <p className="text-xs mt-2">Développé avec ❤️ par Claude Code</p>
        </div>
      </main>
    </div>
  );
};

export default Help;
