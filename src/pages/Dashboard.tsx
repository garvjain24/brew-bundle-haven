
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Clock, Wallet, Gift, Coffee, ChevronRight, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCoffee } from "@/context/coffee-context";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    user, balance, pickupSchedules, transactions, 
    updatePickupStatus, cancelPickup 
  } = useCoffee();
  const [activeTab, setActiveTab] = useState("overview");

  // Get active pickups
  const activePickups = pickupSchedules.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Calculate loyalty progress
  const loyaltyGoal = 500;
  const loyaltyProgress = (user.loyaltyPoints / loyaltyGoal) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/pickup")}>
            New Order
          </Button>
          <Button onClick={() => navigate("/wallet")}>
            Add Funds
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wallet Card */}
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">${balance.toFixed(2)}</span>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2" 
                    onClick={() => navigate("/wallet")}
                  >
                    Manage Wallet →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Card */}
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <Coffee className="h-5 w-5 text-primary" />
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{user.loyaltyPoints}</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to free drink</span>
                      <span>{user.loyaltyPoints}/{loyaltyGoal}</span>
                    </div>
                    <Progress value={loyaltyProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders Card */}
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <Clock className="h-5 w-5 text-primary" />
                  Active Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{activePickups.length}</span>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2"
                    onClick={() => setActiveTab("orders")}
                  >
                    View Orders →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <Card key={transaction.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "purchase" ? "bg-primary/10" :
                          transaction.type === "reload" ? "bg-green-500/10" :
                          transaction.type === "gift" ? "bg-purple-500/10" :
                          transaction.type === "refund" ? "bg-blue-500/10" :
                          "bg-muted"
                        }`}>
                          {transaction.type === "purchase" ? <Coffee className="h-4 w-4 text-primary" /> :
                           transaction.type === "reload" ? <Wallet className="h-4 w-4 text-green-500" /> :
                           transaction.type === "gift" ? <Gift className="h-4 w-4 text-purple-500" /> :
                           transaction.type === "refund" ? <Wallet className="h-4 w-4 text-blue-500" /> :
                           <Coffee className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium ${
                        transaction.type === "purchase" || transaction.type === "gift" ? "text-destructive" : "text-green-500"
                      }`}>
                        {transaction.type === "purchase" || transaction.type === "gift" ? "-" : "+"}
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No recent transactions</p>
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setActiveTab("transactions")}
            >
              View All Transactions
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
              <CardDescription>
                View and manage your scheduled pickups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pickupSchedules.length > 0 ? (
                <div className="space-y-4">
                  {pickupSchedules.map((pickup) => (
                    <Card key={pickup.id} className={`bg-card/50 ${
                      pickup.status === "cancelled" ? "opacity-60" : ""
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">Pickup Order</p>
                                <Badge variant={
                                  pickup.status === "scheduled" ? "outline" :
                                  pickup.status === "ready" ? "default" :
                                  pickup.status === "completed" ? "secondary" :
                                  "destructive"
                                }>
                                  {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(pickup.pickupTime).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })} at {new Date(pickup.pickupTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${pickup.total.toFixed(2)}</span>
                            {pickup.status === "scheduled" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs"
                                onClick={() => cancelPickup(pickup.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {pickup.status === "ready" && (
                              <Button 
                                size="sm"
                                className="text-xs"
                                onClick={() => updatePickupStatus(pickup.id, "completed")}
                              >
                                Mark as Picked Up
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pl-9 space-y-2">
                          <p className="text-sm font-medium">Order Items:</p>
                          {pickup.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <p>
                                {item.quantity}x {item.menuItem.name}
                                {item.customizations && (
                                  <span className="text-xs text-muted-foreground"> ({item.customizations})</span>
                                )}
                              </p>
                              <p>${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't scheduled any pickup orders yet.
                  </p>
                  <Button onClick={() => navigate("/pickup")}>
                    Schedule Your First Pickup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your complete transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === "purchase" ? "bg-primary/10" :
                              transaction.type === "reload" ? "bg-green-500/10" :
                              transaction.type === "gift" ? "bg-purple-500/10" :
                              transaction.type === "refund" ? "bg-blue-500/10" :
                              transaction.type === "redemption" ? "bg-amber-500/10" :
                              "bg-muted"
                            }`}>
                              {transaction.type === "purchase" ? <Coffee className="h-4 w-4 text-primary" /> :
                              transaction.type === "reload" ? <Wallet className="h-4 w-4 text-green-500" /> :
                              transaction.type === "gift" ? <Gift className="h-4 w-4 text-purple-500" /> :
                              transaction.type === "refund" ? <Wallet className="h-4 w-4 text-blue-500" /> :
                              transaction.type === "redemption" ? <Gift className="h-4 w-4 text-amber-500" /> :
                              <Coffee className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })} at {new Date(transaction.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <span className={`font-medium ${
                            transaction.type === "purchase" || transaction.type === "gift" ? "text-destructive" : "text-green-500"
                          }`}>
                            {transaction.type === "purchase" || transaction.type === "gift" ? "-" : "+"}
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Transactions</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't made any transactions yet.
                  </p>
                  <Button onClick={() => navigate("/wallet")}>
                    Add Funds to Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
