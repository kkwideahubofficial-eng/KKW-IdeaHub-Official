import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";

interface HeroImage {
  _id: string;
  secure_url: string;
}

const defaultSlides = [
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200",
];

const stats = [
  { value: "1500+", label: "Students Trained" },
  { value: "500+", label: "Projects Built" },
  { value: "100+", label: "Technical Events" },
  { value: "50+", label: "Patents Filed" },
];

const HomeHero = () => {
  const [images, setImages] = useState<string[]>(defaultSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const res = await api.get("/hero");
        if (res.data && res.data.length > 0) {
          const urls = res.data.map((img: HeroImage) => img.secure_url);
          setImages(urls);
        }
      } catch (err) {
        console.warn("Unable to fetch backend hero images, using default slides.");
      }
    };
    fetchHeroImages();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((val) => (val === images.length - 1 ? 0 : val + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((val) => (val === 0 ? images.length - 1 : val - 1));
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-[650px] w-full bg-slate-950 overflow-hidden flex items-end">
      {/* Background Slider */}
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-85 z-0" : "opacity-0 -z-10"
          }`}
        >
          <img
            src={src}
            alt="AICTE IDEA Lab background slide"
            className="w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
          />
          {/* Subtle Bottom Vignette Overlay to ensure CTA buttons are readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>
      ))}

      {/* Main Content (CTA buttons only) */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap gap-4 pt-2">
          <Link to="/book-slots">
            <Button size="lg" className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-6 py-4 shadow-lg">
              Book a Slot <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/aicte-idea-lab">
            <Button size="lg" variant="outline" className="border-slate-100 text-white hover:bg-white hover:text-slate-900 font-bold rounded-xl px-6 py-4 bg-black/20 backdrop-blur-xs">
              Explore Facilities
            </Button>
          </Link>
        </div>
      </div>

      {/* Manual Slider Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/40 text-white/70 hover:text-white hover:bg-slate-900/80 transition-all focus:outline-none"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/40 text-white/70 hover:text-white hover:bg-slate-900/80 transition-all focus:outline-none"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};

export default HomeHero;
