
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "coffee" | "tea" | "pastry" | "sandwich";
};

export type PickupSchedule = {
  id: string;
  userId: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
    customizations?: string;
  }[];
  pickupTime: Date;
  pickupLocation: string;
  status: "scheduled" | "ready" | "completed" | "cancelled";
  createdAt: Date;
  total: number;
};

export type GiftCard = {
  id: string;
  code: string;
  balance: number;
  initialAmount: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  purchasedBy?: string;
  theme: "classic" | "birthday" | "holiday" | "thank-you";
};

export type Transaction = {
  id: string;
  amount: number;
  type: "purchase" | "reload" | "gift" | "refund" | "redemption";
  description: string;
  date: Date;
  status: "completed" | "pending" | "failed";
};

export type CoffeeContextType = {
  user: {
    name: string;
    email: string;
    loyaltyPoints: number;
    favoriteLocation: string;
  };
  balance: number;
  addToBalance: (amount: number) => void;
  removeFromBalance: (amount: number) => boolean;
  giftCards: GiftCard[];
  addGiftCard: (giftCard: Omit<GiftCard, "id" | "createdAt">) => void;
  redeemGiftCard: (code: string) => boolean;
  pickupSchedules: PickupSchedule[];
  addPickupSchedule: (schedule: Omit<PickupSchedule, "id" | "createdAt" | "userId">) => void;
  updatePickupStatus: (id: string, status: PickupSchedule["status"]) => void;
  cancelPickup: (id: string) => void;
  transactions: Transaction[];
  menuItems: MenuItem[];
  isLoading: boolean;
};

const defaultContext: CoffeeContextType = {
  user: {
    name: "Coffee Lover",
    email: "coffee@example.com",
    loyaltyPoints: 230,
    favoriteLocation: "Downtown Cafe",
  },
  balance: 0,
  addToBalance: () => {},
  removeFromBalance: () => false,
  giftCards: [],
  addGiftCard: () => {},
  redeemGiftCard: () => false,
  pickupSchedules: [],
  addPickupSchedule: () => {},
  updatePickupStatus: () => {},
  cancelPickup: () => {},
  transactions: [],
  menuItems: [],
  isLoading: true,
};

const CoffeeContext = createContext<CoffeeContextType>(defaultContext);

// Sample menu items for the application
const sampleMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Signature Latte",
    description: "Our signature espresso with steamed milk and a light layer of foam",
    price: 4.95,
    image: "/placeholder.svg",
    category: "coffee",
  },
  {
    id: "2",
    name: "Cold Brew",
    description: "Smooth, cold-steeped coffee served over ice",
    price: 4.50,
    image: "/placeholder.svg",
    category: "coffee",
  },
  {
    id: "3",
    name: "Chai Tea Latte",
    description: "Black tea infused with cinnamon, clove and other warming spices",
    price: 4.75,
    image: "/placeholder.svg",
    category: "tea",
  },
  {
    id: "4",
    name: "Almond Croissant",
    description: "Buttery croissant filled with almond cream",
    price: 3.95,
    image: "/placeholder.svg",
    category: "pastry",
  },
  {
    id: "5",
    name: "Avocado Toast",
    description: "Multigrain toast topped with avocado, sea salt, and red pepper flakes",
    price: 7.95,
    image: "/placeholder.svg",
    category: "sandwich",
  },
];

// Sample transactions
const sampleTransactions: Transaction[] = [
  {
    id: "t1",
    amount: 20.00,
    type: "reload",
    description: "Wallet reload",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: "completed",
  },
  {
    id: "t2",
    amount: 4.95,
    type: "purchase",
    description: "Signature Latte",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: "completed",
  },
  {
    id: "t3",
    amount: 25.00,
    type: "gift",
    description: "Gift card purchase",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "completed",
  },
];

export const CoffeeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user] = useState(defaultContext.user);
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("coffee-wallet-balance");
    return savedBalance ? parseFloat(savedBalance) : 25.00; // Default starting balance
  });
  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => {
    const savedGiftCards = localStorage.getItem("coffee-gift-cards");
    return savedGiftCards 
      ? JSON.parse(savedGiftCards).map((card: any) => ({
          ...card,
          expiryDate: new Date(card.expiryDate),
          createdAt: new Date(card.createdAt),
        }))
      : [{
          id: "g1",
          code: "WELCOME2023",
          balance: 15.00,
          initialAmount: 15.00,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          isActive: true,
          createdAt: new Date(),
          theme: "classic",
        }];
  });
  const [pickupSchedules, setPickupSchedules] = useState<PickupSchedule[]>(() => {
    const savedPickups = localStorage.getItem("coffee-pickups");
    return savedPickups 
      ? JSON.parse(savedPickups).map((pickup: any) => ({
          ...pickup,
          pickupTime: new Date(pickup.pickupTime),
          createdAt: new Date(pickup.createdAt),
        }))
      : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem("coffee-transactions");
    return savedTransactions 
      ? JSON.parse(savedTransactions).map((transaction: any) => ({
          ...transaction,
          date: new Date(transaction.date),
        }))
      : sampleTransactions;
  });
  const [menuItems] = useState<MenuItem[]>(sampleMenuItems);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("coffee-wallet-balance", balance.toString());
    localStorage.setItem("coffee-gift-cards", JSON.stringify(giftCards));
    localStorage.setItem("coffee-pickups", JSON.stringify(pickupSchedules));
    localStorage.setItem("coffee-transactions", JSON.stringify(transactions));
  }, [balance, giftCards, pickupSchedules, transactions]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addToBalance = (amount: number) => {
    if (amount <= 0) return;
    
    setBalance(prev => prev + amount);
    
    // Add transaction record
    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      amount,
      type: "reload",
      description: "Added funds to wallet",
      date: new Date(),
      status: "completed",
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: "Funds Added",
      description: `$${amount.toFixed(2)} has been added to your wallet`,
    });
  };

  const removeFromBalance = (amount: number): boolean => {
    if (amount <= 0) return true;
    if (balance < amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this transaction",
        variant: "destructive",
      });
      return false;
    }
    
    setBalance(prev => prev - amount);
    return true;
  };

  const addGiftCard = (giftCard: Omit<GiftCard, "id" | "createdAt">) => {
    const newGiftCard: GiftCard = {
      ...giftCard,
      id: `gc-${Date.now()}`,
      createdAt: new Date(),
    };
    
    setGiftCards(prev => [newGiftCard, ...prev]);
    
    // Add transaction record if purchased
    if (giftCard.purchasedBy) {
      const newTransaction: Transaction = {
        id: `tr-${Date.now()}`,
        amount: giftCard.initialAmount,
        type: "gift",
        description: "Gift card purchase",
        date: new Date(),
        status: "completed",
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    }
    
    toast({
      title: "Gift Card Added",
      description: `A new gift card with $${giftCard.balance.toFixed(2)} has been added`,
    });
  };

  const redeemGiftCard = (code: string): boolean => {
    const index = giftCards.findIndex(
      card => card.code.toLowerCase() === code.toLowerCase() && card.isActive && card.balance > 0
    );
    
    if (index === -1) {
      toast({
        title: "Invalid Gift Card",
        description: "The gift card code is invalid or has already been redeemed",
        variant: "destructive",
      });
      return false;
    }
    
    const card = giftCards[index];
    const amount = card.balance;
    
    // Add to wallet balance
    setBalance(prev => prev + amount);
    
    // Mark gift card as redeemed
    const updatedGiftCards = [...giftCards];
    updatedGiftCards[index] = { ...card, balance: 0, isActive: false };
    setGiftCards(updatedGiftCards);
    
    // Add transaction record
    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      amount,
      type: "redemption",
      description: "Gift card redemption",
      date: new Date(),
      status: "completed",
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: "Gift Card Redeemed",
      description: `$${amount.toFixed(2)} has been added to your wallet`,
    });
    
    return true;
  };

  const addPickupSchedule = (schedule: Omit<PickupSchedule, "id" | "createdAt" | "userId">) => {
    const newPickup: PickupSchedule = {
      ...schedule,
      id: `pu-${Date.now()}`,
      userId: user.name, // Using name as a simple user ID
      createdAt: new Date(),
    };
    
    setPickupSchedules(prev => [newPickup, ...prev]);
    
    // Deduct from wallet
    removeFromBalance(schedule.total);
    
    // Add transaction record
    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      amount: schedule.total,
      type: "purchase",
      description: `Pickup order - ${schedule.items.map(i => i.menuItem.name).join(", ")}`,
      date: new Date(),
      status: "completed",
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: "Pickup Scheduled",
      description: `Your order is scheduled for ${newPickup.pickupTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    });
  };

  const updatePickupStatus = (id: string, status: PickupSchedule["status"]) => {
    setPickupSchedules(prev => 
      prev.map(pickup => 
        pickup.id === id 
          ? { ...pickup, status } 
          : pickup
      )
    );
    
    toast({
      title: "Order Updated",
      description: `Your order status has been updated to: ${status}`,
    });
  };

  const cancelPickup = (id: string) => {
    const pickup = pickupSchedules.find(p => p.id === id);
    if (!pickup) return;
    
    // Update status
    setPickupSchedules(prev => 
      prev.map(p => 
        p.id === id 
          ? { ...p, status: "cancelled" } 
          : p
      )
    );
    
    // Refund to wallet if cancellation is allowed (e.g., more than 30 minutes before pickup)
    const pickupTime = new Date(pickup.pickupTime).getTime();
    const now = Date.now();
    const minutesUntilPickup = (pickupTime - now) / (1000 * 60);
    
    if (minutesUntilPickup > 30) {
      // Full refund
      setBalance(prev => prev + pickup.total);
      
      // Add transaction record
      const newTransaction: Transaction = {
        id: `tr-${Date.now()}`,
        amount: pickup.total,
        type: "refund",
        description: "Pickup cancellation refund",
        date: new Date(),
        status: "completed",
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast({
        title: "Order Cancelled",
        description: `Your order has been cancelled and $${pickup.total.toFixed(2)} has been refunded to your wallet.`,
      });
    } else {
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled. No refund is available for cancellations less than 30 minutes before pickup.",
        variant: "destructive",
      });
    }
  };

  return (
    <CoffeeContext.Provider
      value={{
        user,
        balance,
        addToBalance,
        removeFromBalance,
        giftCards,
        addGiftCard,
        redeemGiftCard,
        pickupSchedules,
        addPickupSchedule,
        updatePickupStatus,
        cancelPickup,
        transactions,
        menuItems,
        isLoading,
      }}
    >
      {children}
    </CoffeeContext.Provider>
  );
};

export const useCoffee = () => useContext(CoffeeContext);
