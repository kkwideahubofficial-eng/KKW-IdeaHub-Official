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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                <CardDescription className="line-clamp-2">{p.category}</CardDescription>
              </CardHeader>
              <CardContent>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded mb-3" />
                ) : null}
                <div className="text-lg font-semibold mb-2">₹{p.price.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{p.description}</p>
                <div className="flex gap-2">
                  <Button className="flex-1">Buy Now</Button>
                  {isCoordinator && (
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm('Delete this product?')) return;
                        try {
                          await api.delete(`/products/${p._id}`);
                          setProducts(products.filter((x) => x._id !== p._id));
                          toast.success('Product deleted');
                        } catch {
                          toast.error('Failed to delete');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ecommerce;


