
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, CreditCard, Gift, Plus, Wallet as WalletIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useCoffee } from "@/context/coffee-context";
import { formatDistanceToNow } from "date-fns";

export default function Wallet() {
  const { balance, addToBalance, transactions } = useCoffee();
  const [activeTab, setActiveTab] = useState("wallet");
  const [reloadAmount, setReloadAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");

  // Filter transactions to show wallet-related
  const walletTransactions = transactions.filter(
    t => t.type === "reload" || t.type === "redemption" || t.type === "refund"
  );

  // Quick reload amounts
  const quickAmounts = [10, 25, 50, 100];

  const handleReload = async () => {
    const amount = parseFloat(reloadAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addToBalance(amount);
    setReloadAmount("");
    setIsProcessing(false);
    
    toast.success(`$${amount.toFixed(2)} has been added to your wallet`);
  };

  const handleRedeemGiftCard = () => {
    if (!giftCardCode.trim()) {
      toast.error("Please enter a gift card code");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const redeemed = useCoffee().redeemGiftCard(giftCardCode);
      
      setIsProcessing(false);
      setGiftCardCode("");
      
      if (!redeemed) {
        toast.error("Invalid gift card code or already redeemed");
      }
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your wallet, add funds, and view transaction history
        </p>
      </div>

      <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6 animate-slide-up">
          {/* Balance Card */}
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <WalletIcon className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Current Balance</h2>
                  <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add Funds</CardTitle>
              <CardDescription>
                Reload your wallet with credit or debit card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 justify-between">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setReloadAmount(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Custom Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="1"
                      className="pl-7"
                      placeholder="Enter amount"
                      value={reloadAmount}
                      onChange={(e) => setReloadAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={handleReload}
                    disabled={!reloadAmount || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Add Funds"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Card className="bg-muted/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">•••• 4242</p>
                        <p className="text-xs text-muted-foreground">
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Change
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Redeem Gift Card */}
          <Card>
            <CardHeader>
              <CardTitle>Redeem Gift Card</CardTitle>
              <CardDescription>
                Add a gift card balance to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gift-card">Gift Card Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="gift-card"
                    placeholder="Enter gift card code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                  />
                  <Button
                    className="shrink-0"
                    onClick={handleRedeemGiftCard}
                    disabled={!giftCardCode || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Redeem"}
                  </Button>
                </div>
              </div>

              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  Try using the code "WELCOME2023" for a complimentary $15 gift card.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your wallet transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletTransactions.length > 0 ? (
                <div className="space-y-4">
                  {walletTransactions.map((transaction) => (
                    <Card key={transaction.id} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === "reload" ? "bg-green-500/10" :
                              transaction.type === "redemption" ? "bg-amber-500/10" :
                              "bg-blue-500/10"
                            }`}>
                              {transaction.type === "reload" ? (
                                <ArrowDown className="h-4 w-4 text-green-500" />
                              ) : transaction.type === "redemption" ? (
                                <Gift className="h-4 w-4 text-amber-500" />
                              ) : (
                                <ArrowUp className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.date), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-green-500">
                            +${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <WalletIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Transactions</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't made any wallet transactions yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
