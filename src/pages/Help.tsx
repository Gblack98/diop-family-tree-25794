import { Link } from "react-router-dom";
import { ArrowLeft, TreeDeciduous, Users, Eye, Palette, ZoomIn, Hand, Info, Sparkles, MousePointer2, Move, Search, ChevronRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

export const Help = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowBackToTop(containerRef.current.scrollTop > 300);
      }

      // Détection de la section active
      const sections = ["intro", "views", "colors", "controls", "navigation"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={containerRef} className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-gradient-to-b from-background via-background to-primary/5 relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        />
        <div
          className="absolute top-1/3 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Sticky Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {[
          { id: "intro", label: "Intro" },
          { id: "views", label: "Vues" },
          { id: "colors", label: "Couleurs" },
          { id: "controls", label: "Contrôles" },
          { id: "navigation", label: "Navigation" }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative"
            title={section.label}
          >
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === section.id
                ? "bg-primary scale-125 ring-4 ring-primary/30"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`} />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-card border rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {section.label}
            </span>
          </button>
        ))}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed right-6 bottom-6 z-50 p-3 rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-primary/25 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        title="Retour en haut"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Header avec effet glassmorphism */}
      <header className="sticky top-0 z-40 border-b bg-card/60 backdrop-blur-xl px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
              Guide Interactif
            </h1>
          </div>
        </div>
      </header>

      {/* Contenu avec animations */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-24 relative z-10">

        {/* Hero Section - Introduction animée */}
        <section
          id="intro"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Info className="w-4 h-4" />
              Explorez l'arbre généalogique
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Bienvenue dans la
              <br />
              <span className="bg-gradient-to-r from-primary via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Famille Diop
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Une expérience interactive et moderne pour découvrir l'histoire de votre famille à travers plusieurs vues dynamiques et intuitives.
            </p>
          </div>

          {/* Illustration SVG - Arbre animé */}
          <div className="relative h-64 flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full max-w-md">
              {/* Trunk */}
              <rect x="190" y="120" width="20" height="80" fill="hsl(var(--primary))" opacity="0.2" rx="4" className="animate-in fade-in duration-1000 delay-300" />

              {/* Branches avec animation */}
              {[
                { x1: 200, y1: 120, x2: 150, y2: 80, delay: 400 },
                { x1: 200, y1: 120, x2: 250, y2: 80, delay: 500 },
                { x1: 150, y1: 80, x2: 120, y2: 50, delay: 600 },
                { x1: 150, y1: 80, x2: 180, y2: 50, delay: 700 },
                { x1: 250, y1: 80, x2: 220, y2: 50, delay: 800 },
                { x1: 250, y1: 80, x2: 280, y2: 50, delay: 900 },
              ].map((branch, i) => (
                <line
                  key={i}
                  x1={branch.x1}
                  y1={branch.y1}
                  x2={branch.x2}
                  y2={branch.y2}
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  opacity="0.3"
                  className="animate-in fade-in duration-500"
                  style={{ animationDelay: `${branch.delay}ms` }}
                />
              ))}

              {/* Nodes avec animation de pulsation */}
              {[
                { cx: 200, cy: 120, color: "hsl(200, 80%, 45%)", delay: 400 },
                { cx: 150, cy: 80, color: "hsl(340, 70%, 65%)", delay: 600 },
                { cx: 250, cy: 80, color: "hsl(200, 80%, 45%)", delay: 700 },
                { cx: 120, cy: 50, color: "hsl(340, 70%, 65%)", delay: 800 },
                { cx: 180, cy: 50, color: "hsl(200, 80%, 45%)", delay: 900 },
                { cx: 220, cy: 50, color: "hsl(340, 70%, 65%)", delay: 1000 },
                { cx: 280, cy: 50, color: "hsl(200, 80%, 45%)", delay: 1100 },
              ].map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="16"
                    fill={node.color}
                    className="animate-in zoom-in duration-500"
                    style={{ animationDelay: `${node.delay}ms` }}
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="16"
                    fill={node.color}
                    opacity="0.3"
                    className="animate-ping"
                    style={{ animationDelay: `${node.delay + 500}ms`, animationDuration: "2s" }}
                  />
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Les Vues - Cards interactives */}
        <section
          id="views"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "100ms" }}
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
              <TreeDeciduous className="w-8 h-8 text-primary" />
              Les Vues Disponibles
            </h2>
            <p className="text-muted-foreground">Choisissez la meilleure vue pour votre exploration</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Arbre Principal */}
            <Link to="/" className="group relative bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <TreeDeciduous className="w-40 h-40 text-primary" />
              </div>

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TreeDeciduous className="w-7 h-7 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold">Arbre Principal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vue complète de la lignée familiale directe. Seules les personnes avec des ancêtres sont affichées pour une clarté optimale.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">Zoom fluide</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">Navigation pan</span>
                </div>
                <div className="pt-2 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorer l'arbre <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            {/* Vue Famille */}
            <Link to="/family/Badara%20Gabar%20Diop" className="group relative bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border-2 border-border hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1 overflow-hidden block">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <Users className="w-40 h-40 text-pink-500" />
              </div>

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-pink-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold">Vue Famille Isolée</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Focus sur une personne avec <strong>tous ses conjoints</strong> et enfants directs. Parfait pour explorer les familles individuelles.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-500/10 text-pink-600 text-xs rounded-full font-medium">Conjoints externes</span>
                  <span className="px-3 py-1 bg-pink-500/10 text-pink-600 text-xs rounded-full font-medium">Navigation enfants</span>
                </div>
                <div className="pt-2 flex items-center text-pink-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir un exemple <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            {/* Vue Constellation */}
            <Link to="/constellation/Amadou%20Bamba%20Diop%20(Badara)" className="group relative bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border-2 border-border hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 overflow-hidden block">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute -right-12 -top-12 opacity-[0.05] group-hover:opacity-15 transition-opacity duration-700 pointer-events-none">
                 <svg viewBox="0 0 200 200" className="w-48 h-48 animate-spin" style={{ animationDuration: '60s' }}>
                    <circle cx="100" cy="100" r="20" fill="currentColor" className="text-purple-500" />
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <g key={i} transform={`rotate(${deg} 100 100)`}>
                        <line x1="100" y1="80" x2="100" y2="40" stroke="currentColor" strokeWidth="2" className="text-purple-500" />
                        <circle cx="100" cy="30" r="10" fill="currentColor" className="text-purple-500" />
                      </g>
                    ))}
                 </svg>
              </div>

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-7 h-7 text-purple-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold">Vue Constellation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Affichage organique pour les familles nombreuses (ex: Amadou Bamba Diop). Les enfants sont regroupés par mère autour du père.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full font-medium">Layout dynamique</span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full font-medium">Groupement mères</span>
                </div>
                <div className="pt-2 flex items-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir Amadou Bamba Diop <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Code Couleur - Interactive color swatches */}
        <section
          id="colors"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "200ms" }}
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
              <Palette className="w-8 h-8 text-primary" />
              Code Couleur
            </h2>
            <p className="text-muted-foreground">Un système de couleurs intuitif pour identifier chaque membre</p>
          </div>

          <div className="bg-gradient-to-br from-card to-card/50 p-8 rounded-2xl border-2 border-border">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Personnes de l'arbre */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-primary" />
                  Membres de l'arbre
                </h3>
                <div className="space-y-3">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(210,100%,46%)] shadow-lg group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(210,100%,46%)] opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
                    </div>
                    <div>
                      <div className="font-semibold">Homme</div>
                      <div className="text-xs text-muted-foreground">Dégradé bleu</div>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(340,70%,65%)] to-[hsl(330,76%,48%)] shadow-lg group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(340,70%,65%)] to-[hsl(330,76%,48%)] opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
                    </div>
                    <div>
                      <div className="font-semibold">Femme</div>
                      <div className="text-xs text-muted-foreground">Dégradé rose</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conjoints externes */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Conjoints externes
                </h3>
                <div className="space-y-3">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(280,60%,55%)] to-[hsl(270,65%,48%)] shadow-lg group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(280,60%,55%)] to-[hsl(270,65%,48%)] opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
                    </div>
                    <div>
                      <div className="font-semibold">Homme externe</div>
                      <div className="text-xs text-muted-foreground">Dégradé violet</div>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(35,85%,60%)] to-[hsl(25,90%,55%)] shadow-lg group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(35,85%,60%)] to-[hsl(25,90%,55%)] opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
                    </div>
                    <div>
                      <div className="font-semibold">Femme externe</div>
                      <div className="text-xs text-muted-foreground">Dégradé orange</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-center text-muted-foreground">
                💡 <strong>Astuce:</strong> Les conjoints sans ancêtres dans l'arbre sont visibles uniquement dans les vues famille dédiées
              </p>
            </div>
          </div>
        </section>

        {/* Contrôles - Animated guide */}
        <section
          id="controls"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "300ms" }}
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
              <Hand className="w-8 h-8 text-primary" />
              Contrôles Interactifs
            </h2>
            <p className="text-muted-foreground">Maîtrisez l'arbre avec des contrôles intuitifs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Zoom */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-2xl border-2 border-blue-500/20 hover:border-blue-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ZoomIn className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold">Zoom</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <MousePointer2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Molette de souris</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Hand className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pincer sur mobile</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="group bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-2xl border-2 border-green-500/20 hover:border-green-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Move className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-lg font-bold">Déplacement</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <MousePointer2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Clic + Glisser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Hand className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Glisser avec 2 doigts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Recherche */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-2xl border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold">Recherche</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Search className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Barre de recherche</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MousePointer2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Clic sur personne</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation - Call to action */}
        <section
          id="navigation"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "400ms" }}
        >
          <div className="bg-gradient-to-br from-primary via-primary to-pink-600 p-8 sm:p-12 rounded-3xl text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">Prêt à explorer ?</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Plongez dans l'histoire de votre famille avec une navigation fluide et intuitive. Chaque clic révèle de nouvelles connexions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 hover:scale-105 transition-transform">
                    <TreeDeciduous className="w-5 h-5" />
                    Voir l'arbre complet
                  </Button>
                </Link>
                <Link to="/archives">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                    Explorer les archives
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 space-y-3">
          <p className="text-sm text-muted-foreground">
            Arbre généalogique de la famille Diop
          </p>
          <p className="text-xs text-muted-foreground/60">
            Conçu par Ibrahima Gabar Diop (Magatte Diop) pour préserver et célébrer notre histoire familiale
          </p>
        </div>
      </main>
    </div>
  );
};

export default Help;
