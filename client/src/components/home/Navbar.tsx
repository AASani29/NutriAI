import { useAuth, useClerk } from '@clerk/clerk-react';
import { LogOut, Menu, Settings, User, X, Utensils } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  theme?: 'light' | 'dark';
}

export default function Navbar({ theme = 'light' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${theme === 'dark' ? 'bg-white/80 shadow-sm' : 'bg-background/10'
      } backdrop-blur-md transition-smooth`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-0.5 group">
            <div className={`rounded-[50%] pt-5 ${theme === 'dark' ? '' : ''}`}>
              <img src='/gajor.png' width={200} height={200} className='' />
            </div>

          </Link>

          <div className="hidden md:flex items-start gap-4">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`p-5 rounded-2xl transition-smooth text-lg font-bold ${theme === 'dark' ? 'text-black hover:text-primary' : 'text-white hover:text-primary'
                  }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border border-transparent ${theme === 'dark' ? 'hover:bg-gray-100 hover:border-gray-200' : 'hover:bg-accent hover:border-border'
                    }`}
                >
                  <User className={`w-4 h-4 ${theme === 'dark' ? 'text-black' : 'text-foreground'}`} />
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-black' : 'text-foreground'}`}>Account</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-smooth"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-smooth"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-smooth w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className={`transition-smooth text-sm font-medium pr-5 ${theme === 'dark' ? 'text-black/80 hover:text-primary' : 'text-white/80 hover:text-primary'
                    }`}
                >
                  Log In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className={`md:hidden transition-smooth ${theme === 'dark' ? 'text-black hover:text-primary' : 'text-foreground hover:text-primary'}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary transition-smooth text-sm font-medium px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 px-4">
                {isSignedIn ? (
                  <div className="flex flex-col gap-2 w-full">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-smooth rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-smooth rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/20 transition-smooth rounded-lg w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/sign-in"
                      className="flex-1 text-center text-foreground/80 hover:text-primary transition-smooth text-sm font-medium py-2"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/sign-up"
                      className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm font-medium"
                    >
                      Get Started
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
}
