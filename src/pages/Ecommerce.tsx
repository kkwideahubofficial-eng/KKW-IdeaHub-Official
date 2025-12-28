import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface ProductItem {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  category?: string;
  stock?: number;
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('idea_hub_user');
    const token = localStorage.getItem('idea_hub_token');
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Extracted ProductCard component
const ProductCard = ({ product, isCoordinator, onDelete }: { product: ProductItem; isCoordinator: boolean; onDelete: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = product.description.length > 100;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg" title={product.title}>{product.title}</CardTitle>
        <CardDescription className="line-clamp-1">{product.category || 'General'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="relative w-full pt-[56.25%] overflow-hidden rounded-md bg-muted">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30">
              No Image
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">₹{product.price.toFixed(2)}</div>
          {product.stock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          )}
        </div>

        <div className="flex-1 min-h-[3rem]">
          <p 
            className={`text-sm text-muted-foreground break-words ${isExpanded ? '' : 'line-clamp-3'}`} 
            title={!isExpanded ? product.description : ''}
          >
            {product.description}
          </p>
          {isLongDescription && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto mt-1 text-xs text-primary/80 hover:text-primary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-4 border-t">
          <Button className="flex-1" disabled={product.stock === 0}>Buy Now</Button>
          {isCoordinator && (
            <Button
              variant="destructive"
              size="icon"
              className="shrink-0"
              onClick={() => onDelete(product._id)}
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Ecommerce = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
  const user = useMemo(getCurrentUser, []);
  const isCoordinator = user?.role === 'coordinator';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', String(parseFloat(form.price)));
      if (form.category) formData.append('category', form.category);
      if (form.stock) formData.append('stock', String(parseInt(form.stock)));
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      const fileInput = document.getElementById('product-image') as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }
      const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProducts([res.data, ...products]);
      setOpen(false);
      setForm({ title: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
      toast.success('Product created');
    } catch {
      toast.error('Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter((x) => x._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">E-commerce</h1>
          <p className="text-muted-foreground">Browse and purchase products from IDEA Hub</p>
        </div>
        {isCoordinator && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-image">Upload Image (optional)</Label>
                    <Input id="product-image" type="file" accept="image/*" />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Or Image URL</Label>
                    <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products yet. {isCoordinator ? 'Create the first one.' : 'Check back later.'}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard 
              key={p._id} 
              product={p} 
              isCoordinator={isCoordinator} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Ecommerce;


