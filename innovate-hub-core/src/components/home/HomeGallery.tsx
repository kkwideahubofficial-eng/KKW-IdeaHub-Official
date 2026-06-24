import { useState, useEffect } from "react";
import { Plus, Pencil, Trash, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface GalleryItem {
  id: string;
  category: "Workshops" | "Hackathons" | "Project Expo" | "Machinery" | "Achievements";
  title: string;
  image: string;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: "g1",
    category: "Machinery",
    title: "Dual Extruder 3D Printer",
    image: "https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g2",
    category: "Hackathons",
    title: "Team Nakshatra SIH 2025 prep",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g3",
    category: "Workshops",
    title: "Hands-on Microcontrollers Bootcamp",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g4",
    category: "Achievements",
    title: "SIH National Level Winner Trophy",
    image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g5",
    category: "Project Expo",
    title: "Drone Diagnostics Prototype Demonstration",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g6",
    category: "Machinery",
    title: "Precision CO2 Laser Cutter Bench",
    image: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g7",
    category: "Workshops",
    title: "Faculty Mentorship Orientation Panel",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g8",
    category: "Project Expo",
    title: "Robotics and Logic Analyzers Arena",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
  },
];

const categories = ["All", "Workshops", "Hackathons", "Project Expo", "Machinery", "Achievements"];

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}/${imagePath}`;
};

const HomeGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isCoordinator, setIsCoordinator] = useState(false);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Workshops" as GalleryItem["category"],
    image: ""
  });

  // Load items and role checks
  useEffect(() => {
    const stored = localStorage.getItem("idea_hub_gallery");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems(defaultGalleryItems);
      }
    } else {
      setItems(defaultGalleryItems);
    }

    const rawUser = localStorage.getItem("idea_hub_user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed.role === "coordinator" || parsed.role === "head") {
          setIsCoordinator(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveItems = (newItems: GalleryItem[]) => {
    setItems(newItems);
    localStorage.setItem("idea_hub_gallery", JSON.stringify(newItems));
  };

  const handleOpenDialog = (item: GalleryItem | null = null) => {
    setEditingItem(item);
    if (item) {
      setForm({
        title: item.title,
        category: item.category,
        image: item.image
      });
    } else {
      setForm({
        title: "",
        category: "Workshops",
        image: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/machinery/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.url) {
        setForm((prev) => ({ ...prev, image: res.data.url }));
      }
    } catch (err) {
      console.error("Failed to upload image", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image) return;

    if (editingItem) {
      const updated = items.map((it) =>
        it.id === editingItem.id ? { ...it, ...form } : it
      );
      saveItems(updated);
    } else {
      const newItem: GalleryItem = {
        id: "gallery_" + Date.now(),
        ...form
      };
      saveItems([newItem, ...items]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery image?")) return;
    const filtered = items.filter((it) => it.id !== id);
    saveItems(filtered);
  };

  const filteredItems = activeFilter === "All"
    ? items
    : items.filter(item => item.category === activeFilter);

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/60 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Coordinator Add Trigger */}
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto mb-12 gap-6">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Inside IDEA Lab
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mx-auto md:mx-0" />
            <p className="text-slate-500 text-sm sm:text-base">
              Glimpse into the collaborative culture, hands-on fabrication activities, and national award ceremonies.
            </p>
          </div>

          {isCoordinator && (
            <Button 
              onClick={() => handleOpenDialog(null)}
              className="gap-2 shadow-md bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-5 py-3 h-auto"
            >
              <Plus className="w-4 h-4" /> Add Gallery Image
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === cat
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-200/60 shadow-xs aspect-square"
            >
              <img 
                src={getFullImageUrl(item.image)} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500 ease-out"
                loading="lazy"
              />

              {/* Bottom text overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight mt-1">
                  {item.title}
                </h3>
              </div>

              {/* Coordinator Edit/Delete Overlays */}
              {isCoordinator && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <button 
                    onClick={() => handleOpenDialog(item)}
                    className="p-2 bg-white/90 backdrop-blur-xs hover:bg-white rounded-lg text-slate-700 hover:text-primary transition-all border border-slate-200/60 shadow-xs"
                    title="Edit Image"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white transition-all shadow-xs"
                    title="Delete Image"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Coordinator Add/Edit Custom Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingItem ? "Edit Gallery Image" : "Add Image to Gallery"}
              </h3>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-left overflow-y-auto flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Image Title
                  </label>
                  <input 
                    type="text" 
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. 3D Design Prototyping Workshop"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Filter Category
                  </label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as GalleryItem["category"] })}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50 font-semibold text-slate-700"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Image Source
                  </label>
                  
                  {/* Upload Section */}
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-250 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 shadow-3xs rounded-xl px-4 py-2 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        {uploading ? "Uploading..." : "Choose Image File"}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">— OR ENTER DIRECT URL —</div>

                    <input 
                      type="url" 
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Preview */}
                {form.image && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Selected Image Preview:
                    </label>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img 
                        src={getFullImageUrl(form.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 flex gap-3 border-t border-slate-100 shrink-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 rounded-xl font-bold h-11 text-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 rounded-xl font-bold h-11 bg-primary text-white hover:bg-primary/95"
                >
                  {editingItem ? "Save Changes" : "Add Image"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeGallery;
