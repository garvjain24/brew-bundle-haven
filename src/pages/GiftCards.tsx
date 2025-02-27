
import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, CreditCard, Copy, Check, ArrowRight, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCoffee, GiftCard } from "@/context/coffee-context";
import { format } from "date-fns";

export default function GiftCards() {
  const { giftCards, balance, addGiftCard, removeFromBalance } = useCoffee();
  const [activeTab, setActiveTab] = useState("cards");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Purchase new gift card state
  const [purchaseAmount, setPurchaseAmount] = useState<string>("25");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<GiftCard["theme"]>("classic");
  
  // Gift card themes
  const cardThemes = [
    { id: "classic", name: "Classic", color: "bg-gradient-to-br from-coffee-500 to-coffee-700" },
    { id: "birthday", name: "Birthday", color: "bg-gradient-to-br from-blue-500 to-purple-500" },
    { id: "holiday", name: "Holiday", color: "bg-gradient-to-br from-red-500 to-green-500" },
    { id: "thank-you", name: "Thank You", color: "bg-gradient-to-br from-yellow-400 to-amber-600" },
  ];
  
  // Quick amounts
  const quickAmounts = ["15", "25", "50", "100"];
  
  // Handle copy gift card code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast.success("Gift card code copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };
  
  // Generate random gift card code
  const generateGiftCardCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  // Handle purchase gift card
  const handlePurchaseGiftCard = async () => {
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (amount > balance) {
      toast.error("Insufficient wallet balance");
      return;
    }
    
    if (recipientEmail && !recipientEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove amount from wallet
    const success = removeFromBalance(amount);
    if (!success) {
      setIsProcessing(false);
      return;
    }
    
    // Create new gift card
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const newGiftCard: Omit<GiftCard, "id" | "createdAt"> = {
      code: generateGiftCardCode(),
      balance: amount,
      initialAmount: amount,
      expiryDate,
      isActive: true,
      purchasedBy: "self",
      theme: selectedTheme,
    };
    
    addGiftCard(newGiftCard);
    
    // Reset form
    setPurchaseAmount("25");
    setRecipientEmail("");
    setRecipientName("");
    setMessage("");
    setSelectedTheme("classic");
    setIsProcessing(false);
    
    // Navigate to cards tab
    setActiveTab("cards");
    
    toast.success("Gift card purchased successfully");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Gift Cards</h1>
        <p className="text-muted-foreground">
          Purchase, manage, and send gift cards to friends and family
        </p>
      </div>
      
      <Tabs defaultValue="cards" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cards">My Gift Cards</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Gift Card</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards" className="animate-slide-up">
          <div className="space-y-6">
            {giftCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {giftCards.map((card) => {
                  const theme = cardThemes.find((t) => t.id === card.theme) || cardThemes[0];
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`overflow-hidden ${
                        !card.isActive || card.balance <= 0 ? "opacity-60" : ""
                      }`}>
                        <div className={`aspect-[1.8/1] ${theme.color} relative p-6 text-white`}>
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                              {card.theme.charAt(0).toUpperCase() + card.theme.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Gift className="h-5 w-5" />
                                <h3 className="font-semibold">Brewful Gift Card</h3>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm opacity-80 mb-1">Balance</p>
                              <p className="text-3xl font-bold">${card.balance.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Gift Card Code</p>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{card.code}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopyCode(card.code)}
                                  disabled={!card.isActive || card.balance <= 0}
                                >
                                  {copiedCode === card.code ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {(card.isActive && card.balance > 0) ? (
                              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Redeemed
                              </Badge>
                            )}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expiration</span>
                            <span>{format(new Date(card.expiryDate), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Initial Value</span>
                            <span>${card.initialAmount.toFixed(2)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-3">
                          {(card.isActive && card.balance > 0) ? (
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => setActiveTab("purchase")}
                            >
                              Send as Gift
                            </Button>
                          ) : (
                            <Button 
                              className="w-full" 
                              variant="outline"
                              disabled
                            >
                              Redeemed
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Gift Cards Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You don't have any gift cards yet. Purchase a gift card to get started.
                  </p>
                  <Button onClick={() => setActiveTab("purchase")}>
                    Purchase a Gift Card
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="purchase" className="animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase a Gift Card</CardTitle>
                  <CardDescription>
                    Create a new gift card to use yourself or send to someone else
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Gift Card Amount</Label>
                    <div className="flex gap-3 mb-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={purchaseAmount === amount ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setPurchaseAmount(amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="5"
                        step="1"
                        className="pl-7"
                        placeholder="Custom amount"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gift Card Theme</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cardThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                            selectedTheme === theme.id
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-primary/40"
                          }`}
                          onClick={() => setSelectedTheme(theme.id as GiftCard["theme"])}
                        >
                          <div className={`${theme.color} h-16 flex items-center justify-center text-white`}>
                            <Gift className="h-6 w-6" />
                          </div>
                          <div className="p-2 text-center text-sm font-medium bg-muted/50">
                            {theme.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipient">Recipient Information (Optional)</Label>
                      <Badge variant="outline" className="font-normal">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Fill this out if you want to send this gift card to someone else
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Recipient Name</Label>
                        <Input
                          id="name"
                          placeholder="Jane Doe"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Recipient Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Gift Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Add a personal message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gift Card Amount</span>
                      <span>${parseFloat(purchaseAmount || "0").toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${parseFloat(purchaseAmount || "0").toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Wallet Balance</p>
                        <p className="text-xs text-muted-foreground">
                          Current balance: ${balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {parseFloat(purchaseAmount || "0") > balance ? (
                      <Badge variant="outline" className="text-destructive">
                        Insufficient
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500">
                        Sufficient
                      </Badge>
                    )}
                  </div>
                  
                  {parseFloat(purchaseAmount || "0") > balance && (
                    <div className="text-sm text-destructive">
                      Your wallet balance is insufficient. Please add funds to your wallet.
                    </div>
                  )}
                  
                  <div className="pt-2 space-y-3">
                    <Button
                      className="w-full"
                      onClick={handlePurchaseGiftCard}
                      disabled={
                        isProcessing ||
                        parseFloat(purchaseAmount || "0") <= 0 ||
                        parseFloat(purchaseAmount || "0") > balance
                      }
                    >
                      {isProcessing ? "Processing..." : (
                        <>
                          {recipientEmail ? "Send Gift Card" : "Purchase Gift Card"}
                          {recipientEmail && <Send className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("cards")}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
