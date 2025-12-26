import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'coordinator' | 'team';
  teamName?: string;
}

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("idea_hub_user");
      const token = localStorage.getItem("idea_hub_token");
      
      if (raw && token) {
        const parsed = JSON.parse(raw);
        setUser({
          id: parsed._id || parsed.id,
          name: parsed.name,
          email: parsed.email,
          role: parsed.role,
          teamName: parsed.teamName
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("idea_hub_token");
    localStorage.removeItem("idea_hub_user");
    setUser(null);
    toast.success("Successfully logged out");
    navigate("/");
  };

  /* 
     Requested Order: 
     1. Home
     2. Book Slot (Team only)
     3. My Bookings (Team only)
     4. Achievements
     5. Events
     6. E-commerce
     7. Lab Info
     8. Coordinator Links (if applicable)
  */
  const getNavLinks = () => {
    const links = [
      { name: "Home", path: "/" },
    ];

    if (user?.role === 'team') {
      links.push({ name: "Book Slots", path: "/book-slots" });
      links.push({ name: "My Bookings", path: "/my-bookings" });
    }

    links.push(
      { name: "Achievements", path: "/achievements" },
      { name: "Events", path: "/events" },
      { name: "E-commerce", path: "/ecommerce" },
      { name: "Lab Info", path: "/lab-info" }
    );

    if (user?.role === 'coordinator') {
      links.push(
        { name: "Dashboard", path: "/coordinator-dashboard" },
        { name: "Manage Rooms", path: "/manage-rooms" }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            
            {/* Logo */}
            <Link to="/" className="ml-4 md:ml-0 flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">I</span>
              </div>
              <span className="text-xl font-semibold text-foreground">IDEA Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user?.role ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 flex flex-col space-y-2">
                {user?.role ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      localStorage.removeItem("idea_hub_token");
                      localStorage.removeItem("idea_hub_user");
                      setMobileMenuOpen(false);
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
