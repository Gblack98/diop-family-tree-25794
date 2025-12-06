import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    // CORRECTION : Scroll autorisé ici aussi
    <div className="h-dvh w-full overflow-y-auto bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md mx-auto animate-in fade-in zoom-in duration-500">
        <div className="relative">
            <h1 className="text-9xl font-bold text-muted/40 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-semibold text-foreground bg-background/80 backdrop-blur px-4 py-1 rounded-full border shadow-sm">
                    Page introuvable
                </span>
            </div>
        </div>
        
        <p className="text-xl text-muted-foreground">
            Oups ! Le chemin que vous essayez d'emprunter ne figure pas sur notre carte familiale.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="default" size="lg" className="gap-2">
                <Link to="/">
                    <Home className="w-4 h-4" />
                    Retour à l'arbre
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/archives">
                    <ArrowLeft className="w-4 h-4" />
                    Voir les archives
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;