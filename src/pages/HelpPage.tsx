import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ZoomIn, 
  Users, 
  Star, 
  Smartphone, 
  Menu, 
  X, 
  MousePointer2, 
  Move, 
  Info,
  ChevronUp,
  BookOpen
} from "lucide-react";

const sections = [
  { id: "overview", title: "Vue d'ensemble", icon: Info },
  { id: "navigation", title: "Navigation & Zoom", icon: Move },
  { id: "family-view", title: "Vue Famille", icon: Users },
  { id: "constellation", title: "Vue Constellation", icon: Star },
  { id: "archives", title: "Archives", icon: BookOpen },
  { id: "mobile", title: "Mobile & Tactile", icon: Smartphone },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Gestion du scroll pour la section active et le bouton retour en haut
  useEffect(() => {
    const handleScroll = () => {
      // Afficher/masquer le bouton retour en haut
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Détection de la section active
      const sectionElements = sections.map(s => document.getElementById(s.id));
      
      // On cherche la section qui est actuellement visible
      for (const section of sectionElements) {
        if (section) {
          const rect = section.getBoundingClientRect();
          // Si le haut de la section est dans la moitié supérieure de l'écran
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Hauteur du header + marge
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Header Fixe */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-card/80 backdrop-blur-sm z-50 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Guide d'Utilisation
          </h1>
        </div>
        
        <button 
          className="md:hidden p-2 hover:bg-accent rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="pt-16 flex relative">
        {/* Sidebar Navigation (Desktop) - Sticky */}
        <aside className="hidden md:block w-72 fixed left-0 top-16 bottom-0 border-r bg-card/50 p-6 overflow-y-auto backdrop-blur-sm z-40">
          <nav className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-4 px-2 tracking-wider">SOMMAIRE</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === section.id 
                    ? "bg-primary/10 text-primary translate-x-1 shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-primary" : "opacity-70"}`} />
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden pt-20 px-6 animate-in fade-in duration-200">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full flex items-center gap-4 p-4 text-lg font-medium border-b border-border/50 active:bg-accent/50 rounded-lg transition-colors"
                >
                  <section.icon className="w-5 h-5 text-primary" />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-72 p-6 md:p-12 max-w-5xl mx-auto space-y-20">
          
          {/* Overview */}
          <section id="overview" className="scroll-mt-24 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Bienvenue sur l'Arbre Diop</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Une plateforme interactive moderne pour explorer l'histoire et la généalogie de la famille Diop.
                Naviguez à travers les générations, découvrez les liens de parenté complexes et explorez les archives familiales.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 group">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Arbre Global</h3>
                <p className="text-sm text-muted-foreground">Vue d'ensemble de toute la famille avec navigation zoomable et recherche.</p>
              </div>
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 group">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Vue Constellation</h3>
                <p className="text-sm text-muted-foreground">Affichage dynamique et organique pour les familles nombreuses.</p>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section id="navigation" className="scroll-mt-24 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg"><Move className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold">Navigation & Zoom</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">💻 Sur Ordinateur</h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="p-2 h-fit rounded-md bg-background shadow-sm border"><MousePointer2 className="w-4 h-4" /></span>
                    <div>
                      <span className="font-medium block mb-1">Cliquer-glisser</span>
                      <p className="text-sm text-muted-foreground">Maintenez le clic et déplacez la souris pour naviguer dans l'arbre.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="p-2 h-fit rounded-md bg-background shadow-sm border"><ZoomIn className="w-4 h-4" /></span>
                    <div>
                      <span className="font-medium block mb-1">Molette souris</span>
                      <p className="text-sm text-muted-foreground">Utilisez la molette pour zoomer et dézoomer avec précision.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">📱 Sur Mobile</h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="p-2 h-fit rounded-md bg-background shadow-sm border"><Smartphone className="w-4 h-4" /></span>
                    <div>
                      <span className="font-medium block mb-1">Pinch-to-zoom</span>
                      <p className="text-sm text-muted-foreground">Écartez ou rapprochez deux doigts pour ajuster le zoom.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="p-2 h-fit rounded-md bg-background shadow-sm border"><Move className="w-4 h-4" /></span>
                    <div>
                      <span className="font-medium block mb-1">Glisser</span>
                      <p className="text-sm text-muted-foreground">Déplacez l'arbre avec un seul doigt dans n'importe quelle direction.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Family View */}
          <section id="family-view" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold">Vue Famille Isolée</h2>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground">
                La vue famille permet de se concentrer sur une personne spécifique, ses conjoints et ses enfants directs, 
                sans être distrait par la complexité de l'arbre global.
              </p>
              
              <div className="my-6 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Comment y accéder ?
                </h4>
                <ol className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold">1</span>
                    <span>Cliquez sur une personne dans l'arbre global</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold">2</span>
                    <span>Dans le panneau à droite, cliquez sur le bouton <strong>"Voir la famille"</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold">3</span>
                    <span>Ou cliquez directement sur un enfant dans une vue famille existante</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Constellation View */}
          <section id="constellation" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg"><Star className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold">Vue Constellation</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Une visualisation unique conçue pour les familles nombreuses ou complexes (plusieurs mariages). 
                  Au lieu d'une hiérarchie verticale rigide, les membres sont disposés de manière organique en cercles.
                </p>
                <div className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">Personne centrale au milieu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">Conjoints disposés en cercle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">Enfants regroupés autour de leur mère</span>
                  </div>
                </div>
              </div>
              
              {/* Illustration abstraite de la constellation */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                <div className="relative w-40 h-40 transition-transform duration-700 group-hover:rotate-12">
                  {/* Central */}
                  <div className="absolute inset-0 m-auto w-16 h-16 bg-primary rounded-full shadow-lg z-10 flex items-center justify-center text-primary-foreground">
                    <Users className="w-8 h-8" />
                  </div>
                  {/* Orbit */}
                  <div className="absolute inset-0 m-auto w-32 h-32 border-2 border-dashed border-primary/30 rounded-full" />
                  {/* Satellites */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-pink-500 rounded-full opacity-80 shadow-md" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-pink-500 rounded-full opacity-80 shadow-md" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-pink-500 rounded-full opacity-80 shadow-md" />
                </div>
              </div>
            </div>
          </section>

          {/* Archives */}
          <section id="archives" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg"><BookOpen className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold">Archives</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              La section Archives regroupe les documents historiques, photos, biographies et articles de presse liés à la famille.
              Vous pouvez filtrer ces éléments par catégorie ou effectuer une recherche textuelle.
            </p>
          </section>

          {/* Mobile */}
          <section id="mobile" className="scroll-mt-24 space-y-6 pb-20">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg"><Smartphone className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold">Optimisation Mobile</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              L'application a été entièrement repensée pour offrir une expérience fluide et native sur smartphone.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "Interface tactile",
                "Zoom fluide",
                "Menus adaptés",
                "Lecture facile",
                "Chargement rapide",
                "Mode sombre"
              ].map((item, i) => (
                <div key={i} className="p-4 bg-card border rounded-lg text-center text-sm font-medium hover:border-primary/50 transition-colors">
                  {item}
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Bouton Retour en haut */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-50 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Haut de page"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
}