
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Coffee, Wallet, Gift, Clock, User, 
  LogOut, Menu, X, Moon, Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCoffee } from "@/context/coffee-context";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, balance } = useCoffee();
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { href: "/", label: "Home", icon: <Coffee size={20} /> },
    { href: "/pickup", label: "Order Pickup", icon: <Clock size={20} /> },
    { href: "/wallet", label: "My Wallet", icon: <Wallet size={20} /> },
    { href: "/gift-cards", label: "Gift Cards", icon: <Gift size={20} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="mr-2"
                    aria-label="Menu"
                  >
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <Coffee size={24} className="text-primary" />
                      <span>Brewful</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <nav className="grid gap-2 px-2">
                      {navigationItems.map((item) => (
                        <Button
                          key={item.href}
                          variant={location.pathname === item.href ? "default" : "ghost"}
                          className={cn(
                            "justify-start gap-2",
                            location.pathname === item.href
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => navigate(item.href)}
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                  </div>
                  <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Button variant="outline" size="sm" className="justify-start gap-2">
                        <User size={16} />
                        Profile
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start gap-2">
                        <LogOut size={16} />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button 
              variant="ghost" 
              className="gap-2 font-semibold" 
              onClick={() => navigate("/")}
            >
              <Coffee size={20} className="text-primary" />
              <span className="hidden md:inline-block">Brewful</span>
            </Button>
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "text-sm flex gap-2",
                    location.pathname === item.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <Card className="p-2 flex items-center gap-2 bg-accent/40">
              <Wallet size={16} className="text-primary" />
              <span className="font-medium">${balance.toFixed(2)}</span>
            </Card>
            
            <Avatar className="h-9 w-9" onClick={() => navigate("/dashboard")}>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container py-6 px-4 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-card">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Coffee size={20} className="text-primary" />
            <p className="text-sm font-medium">
              Brewful Coffee Co.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Brewful Coffee. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
