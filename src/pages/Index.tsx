
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Coffee, Clock, Gift, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCoffee } from "@/context/coffee-context";

export default function Index() {
  const navigate = useNavigate();
  const { user, menuItems, pickupSchedules } = useCoffee();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter featured menu items
  const featuredItems = menuItems.slice(0, 3);

  // Get active pickup orders
  const activePickups = pickupSchedules.filter(p => 
    p.status !== "completed" && p.status !== "cancelled"
  );

  const features = [
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Pickup Scheduling",
      description: "Order ahead and skip the line with our convenient pickup scheduling",
      action: () => navigate("/pickup"),
      actionText: "Schedule Pickup",
    },
    {
      icon: <Gift className="h-6 w-6 text-primary" />,
      title: "Gift Cards",
      description: "The perfect gift for coffee lovers. Send a digital gift card instantly",
      action: () => navigate("/gift-cards"),
      actionText: "Buy Gift Cards",
    },
    {
      icon: <Wallet className="h-6 w-6 text-primary" />,
      title: "Digital Wallet",
      description: "Reload your wallet, track spending, and earn rewards with every purchase",
      action: () => navigate("/wallet"),
      actionText: "Manage Wallet",
    },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative -mt-6 bg-coffee-100 dark:bg-coffee-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
        <motion.div 
          className="container relative mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
            Welcome to Brewful
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Your Perfect Cup,<br /> Ready When You Are
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
            Skip the line with scheduled pickups, reload your wallet, and send the gift of coffee to friends and family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate("/pickup")}
            >
              Order for Pickup
              <ArrowRight size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/gift-cards")}
            >
              Send a Gift Card
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Active Pickups Alert */}
      {activePickups.length > 0 && (
        <motion.section
          className="bg-accent/40 border rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Active Orders</h3>
                <p className="text-xs text-muted-foreground">
                  You have {activePickups.length} pending pickup{activePickups.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="shrink-0"
              onClick={() => navigate("/dashboard")}
            >
              View Orders
            </Button>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <Card className="hover-lift h-full">
              <CardContent className="pt-6 flex flex-col h-full">
                <div className="p-2 w-fit rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  {feature.description}
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-between group"
                  onClick={feature.action}
                >
                  {feature.actionText}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Featured Menu */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Our Menu</h2>
            <p className="text-muted-foreground">Try our most popular items</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/pickup")}>
            See Full Menu
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card className="hover-lift overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <span className="font-medium text-primary">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/pickup")}
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Loyalty Program */}
      <motion.section
        className="bg-gradient-to-r from-coffee-200 to-coffee-300 dark:from-coffee-700 dark:to-coffee-800 rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Loyalty Program
            </span>
            <h2 className="text-3xl font-bold mb-4">Earn Rewards with Every Sip</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Join our loyalty program and earn points with every purchase. Redeem points for free drinks, pastries, and exclusive offers.
            </p>
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-4xl font-bold">{user.loyaltyPoints}</p>
                <p className="text-sm text-muted-foreground">Current Points</p>
              </div>
              <div className="h-12 border-r"></div>
              <div>
                <p className="text-4xl font-bold">500</p>
                <p className="text-sm text-muted-foreground">Points for Free Drink</p>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard")}>View Rewards</Button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-60 h-60">
              <motion.div
                className="absolute inset-0 rounded-full bg-coffee-400 dark:bg-coffee-600 opacity-20"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee size={80} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
