import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageCarouselProps {
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImageCarousel = ({ images, initialIndex = 0, title }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `archive-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      <div className="relative w-full">
        {/* Main carousel */}
        <div className="relative aspect-video bg-gradient-to-br from-violet-50/50 to-pink-50/50 dark:from-violet-950/50 dark:to-pink-950/50 rounded-xl overflow-hidden group">
          <img
            src={images[currentIndex]}
            alt={`${title || "Archive"} - Image ${currentIndex + 1}`}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsFullscreen(true)}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? "ring-2 ring-violet-500 ring-offset-2 scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`${title || "Archive"} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Fullscreen controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleDownload}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setIsFullscreen(false)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Fullscreen navigation */}
            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
