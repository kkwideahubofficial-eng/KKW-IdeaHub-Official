import { Link, useLocation } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Reset visibility on route change
    setIsVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger slightly earlier for footer as it's at the bottom
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, [location.pathname]); // Re-run observer on route change to ensure it re-checks/re-attaches

  return (
    <footer className="bg-primary border-t border-primary-foreground/20 mt-16">
      <div
        ref={footerRef}
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-4">
              About IDEA Hub
            </h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering Innovation Through Collaboration. IDEA Hub provides state-of-the-art facilities for research, development, and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/book-slots"
                  className="text-primary-foreground/80 text-sm hover:text-accent transition-colors"
                >
                  Book a Slot
                </Link>
              </li>
              <li>
                <Link
                  to="/achievements"
                  className="text-primary-foreground/80 text-sm hover:text-accent transition-colors"
                >
                  View Achievements
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-primary-foreground/80 text-sm hover:text-accent transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  to="/lab-info"
                  className="text-primary-foreground/80 text-sm hover:text-accent transition-colors"
                >
                  Lab Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary-foreground mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">
                  Innovation Lab, Building A<br />
                  University Campus, City 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-foreground flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">
                  ideahub@university.edu
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-foreground flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <p className="text-center text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} IDEA Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
