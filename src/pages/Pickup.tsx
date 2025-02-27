
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Coffee, Plus, Minus, ChevronRight, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, addMinutes, setHours, setMinutes, isBefore, isAfter } from "date-fns";
import { MenuItem, useCoffee } from "@/context/coffee-context";

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string;
};

type StepType = "menu" | "details" | "review";

export default function Pickup() {
  const navigate = useNavigate();
  const { menuItems, balance, user, addPickupSchedule } = useCoffee();
  const [activeTab, setActiveTab] = useState<string>("coffee");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<StepType>("menu");
  const [selectedLocation, setSelectedLocation] = useState("Downtown Cafe");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    addMinutes(new Date(), 30)
  );
  const [pickupTime, setPickupTime] = useState<string>("ASAP");
  const [customNote, setCustomNote] = useState("");
  
  // Calculate cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  
  // Filter menu items by category
  const filteredItems = menuItems.filter(
    (item) => activeTab === "all" || item.category === activeTab
  );
  
  // Generate available pickup time slots
  const generateTimeSlots = () => {
    const now = new Date();
    const slots = [];
    const startHour = now.getHours();
    const startMinute = Math.ceil(now.getMinutes() / 15) * 15;
    
    // Add ASAP option
    slots.push("ASAP");
    
    // Generate time slots for every 15 minutes
    for (let h = startHour; h < 22; h++) {
      for (let m = h === startHour ? startMinute : 0; m < 60; m += 15) {
        const timeString = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${
          h < 12 ? "AM" : "PM"
        }`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Handle adding item to cart
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((i) => i.menuItem.id === item.id);
    
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    
    toast.success(`Added ${item.name} to your order`);
  };
  
  // Handle updating item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((i) => i.menuItem.id !== itemId));
    } else {
      setCart(
        cart.map((i) =>
          i.menuItem.id === itemId
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    }
  };
  
  // Handle updating item customizations
  const updateCustomizations = (itemId: string, customizations: string) => {
    setCart(
      cart.map((i) =>
        i.menuItem.id === itemId
          ? { ...i, customizations }
          : i
      )
    );
  };
  
  // Generate final pickup time
  const getPickupDateTime = () => {
    if (!pickupDate) return new Date();
    
    if (pickupTime === "ASAP") {
      return addMinutes(new Date(), 20);
    }
    
    const timeParts = pickupTime.match(/^(\d+):(\d+) (AM|PM)$/);
    if (!timeParts) return pickupDate;
    
    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3];
    
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    const date = new Date(pickupDate);
    return setMinutes(setHours(date, hours), minutes);
  };
  
  // Handle submit order
  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (balance < cartTotal) {
      toast.error("Insufficient balance in your wallet");
      return;
    }
    
    const pickupDateTime = getPickupDateTime();
    
    addPickupSchedule({
      items: cart,
      pickupTime: pickupDateTime,
      pickupLocation: selectedLocation,
      status: "scheduled",
      total: cartTotal,
    });
    
    // Reset cart and navigate to success page
    setCart([]);
    navigate("/dashboard");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Order Pickup</h1>
        <p className="text-muted-foreground">
          Schedule a pickup at your favorite location
        </p>
      </div>
      
      {/* Multistep Order Process */}
      <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            currentStep === "menu" || currentStep === "details" || currentStep === "review"
              ? "bg-primary text-white"
              : "bg-muted border"
          }`}>
            1
          </div>
          <span className={currentStep === "menu" ? "font-medium" : "text-muted-foreground"}>
            Select Items
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            currentStep === "details" || currentStep === "review"
              ? "bg-primary text-white"
              : "bg-muted border"
          }`}>
            2
          </div>
          <span className={currentStep === "details" ? "font-medium" : "text-muted-foreground"}>
            Pickup Details
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            currentStep === "review"
              ? "bg-primary text-white"
              : "bg-muted border"
          }`}>
            3
          </div>
          <span className={currentStep === "review" ? "font-medium" : "text-muted-foreground"}>
            Review Order
          </span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {currentStep === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Menu</CardTitle>
                    <CardDescription>Select items to add to your order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="coffee" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="coffee">Coffee</TabsTrigger>
                        <TabsTrigger value="tea">Tea</TabsTrigger>
                        <TabsTrigger value="pastry">Pastries</TabsTrigger>
                        <TabsTrigger value="sandwich">Food</TabsTrigger>
                      </TabsList>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
                          <Card key={item.id} className="bg-card/50 overflow-hidden hover-lift">
                            <div className="grid grid-cols-3">
                              <div className="col-span-1 bg-muted h-full">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="col-span-2 p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                      {item.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline">${item.price.toFixed(2)}</Badge>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full mt-3"
                                  onClick={() => addToCart(item)}
                                >
                                  Add to Order
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="sticky top-20">
                  <CardHeader className="pb-3">
                    <CardTitle>Your Order</CardTitle>
                    <CardDescription>
                      {cart.length === 0
                        ? "Your cart is empty"
                        : `${cart.reduce((sum, item) => sum + item.quantity, 0)} items in your cart`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <div className="py-8 text-center">
                        <Coffee className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          Add items from the menu to get started
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-4">
                          {cart.map((item) => (
                            <div key={item.menuItem.id} className="pb-4 border-b last:border-0">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{item.menuItem.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ${item.menuItem.price.toFixed(2)} each
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-5 text-center">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <Input
                                  placeholder="Add special instructions..."
                                  className="text-xs"
                                  value={item.customizations || ""}
                                  onChange={(e) =>
                                    updateCustomizations(item.menuItem.id, e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>$0.00</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                          
                          <Button
                            className="w-full mt-4"
                            disabled={cart.length === 0}
                            onClick={() => setCurrentStep("details")}
                          >
                            Continue to Pickup Details
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
        
        {currentStep === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Details</CardTitle>
                    <CardDescription>When and where would you like to pick up your order?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Pickup Location</Label>
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Downtown Cafe">Downtown Cafe</SelectItem>
                          <SelectItem value="Westside Shop">Westside Shop</SelectItem>
                          <SelectItem value="Riverside Cafe">Riverside Cafe</SelectItem>
                          <SelectItem value="University Hub">University Hub</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {selectedLocation === "Downtown Cafe" && "123 Main St, Downtown"}
                          {selectedLocation === "Westside Shop" && "456 West Ave, Westside"}
                          {selectedLocation === "Riverside Cafe" && "789 River Rd, Riverside"}
                          {selectedLocation === "University Hub" && "101 Campus Dr, University Area"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Pickup Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {pickupDate ? (
                                format(pickupDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={pickupDate}
                              onSelect={setPickupDate}
                              initialFocus
                              disabled={(date) => 
                                isBefore(date, new Date()) || 
                                isAfter(date, new Date(new Date().setDate(new Date().getDate() + 7)))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="time">Pickup Time</Label>
                        <Select
                          value={pickupTime}
                          onValueChange={setPickupTime}
                        >
                          <SelectTrigger id="time">
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {pickupTime === "ASAP" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Your order will be ready in approximately 20 minutes
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any special instructions for pickup..."
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.menuItem.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2 pt-4">
                        <Button
                          className="w-full"
                          onClick={() => setCurrentStep("review")}
                        >
                          Review Order
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setCurrentStep("menu")}
                        >
                          Back to Menu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
        
        {currentStep === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
                <CardDescription>Please review your order details before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.menuItem.id} className="flex justify-between">
                          <div>
                            <p>{item.quantity}x {item.menuItem.name}</p>
                            {item.customizations && (
                              <p className="text-xs text-muted-foreground">
                                Note: {item.customizations}
                              </p>
                            )}
                          </div>
                          <p>${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Pickup Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedLocation}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLocation === "Downtown Cafe" && "123 Main St, Downtown"}
                            {selectedLocation === "Westside Shop" && "456 West Ave, Westside"}
                            {selectedLocation === "Riverside Cafe" && "789 River Rd, Riverside"}
                            {selectedLocation === "University Hub" && "101 Campus Dr, University Area"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {pickupDate
                              ? format(pickupDate, "EEEE, MMMM d")
                              : "Today"}{" "}
                            at{" "}
                            {pickupTime === "ASAP"
                              ? format(addMinutes(new Date(), 20), "h:mm a")
                              : pickupTime}
                          </p>
                          {pickupTime === "ASAP" && (
                            <p className="text-xs text-muted-foreground">
                              Ready in approximately 20 minutes
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {customNote && (
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm font-medium">Additional Notes:</p>
                          <p className="text-sm text-muted-foreground">{customNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Payment Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Payment Method</h3>
                    <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Wallet Balance</p>
                          <p className="text-xs text-muted-foreground">
                            Current balance: ${balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {balance < cartTotal ? (
                        <Badge variant="outline" className="text-destructive">
                          Insufficient
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-500">
                          Sufficient
                        </Badge>
                      )}
                    </div>
                    
                    {balance < cartTotal && (
                      <div className="mt-2 text-sm text-destructive">
                        Your wallet balance is insufficient. Please add funds to your wallet.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <div className="px-6 py-4 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("details")}
                >
                  Back
                </Button>
                <Button
                  disabled={balance < cartTotal}
                  onClick={handleSubmitOrder}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
