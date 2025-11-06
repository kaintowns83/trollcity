
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart, Sparkles, Gift, CreditCard, Loader2, DollarSign, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function StorePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("coins");
  const [customAmount, setCustomAmount] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: gifts } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
    initialData: [],
  });

  const { data: entranceEffects } = useQuery({
    queryKey: ['entranceEffects'],
    queryFn: () => base44.entities.EntranceEffect.list(),
    initialData: [],
  });

  const { data: userEffects } = useQuery({
    queryKey: ['userEffects', user?.id],
    queryFn: () => base44.entities.UserEntranceEffect.filter({ user_id: user.id }),
    initialData: [],
    enabled: !!user?.id,
  });

  const purchaseEffectMutation = useMutation({
    mutationFn: async (effect) => {
      const coinCost = Math.floor(effect.price_usd * 100);
      
      const currentUser = await base44.auth.me();
      
      if ((currentUser.coins || 0) < coinCost) {
        throw new Error("Not enough Troll Coins.");
      }

      const purchasedCoinsUsed = Math.min(currentUser.purchased_coins || 0, coinCost);
      const freeCoinsUsed = coinCost - purchasedCoinsUsed;

      await base44.auth.updateMe({
        coins: (currentUser.coins || 0) - coinCost,
        purchased_coins: (currentUser.purchased_coins || 0) - purchasedCoinsUsed,
        free_coins: (currentUser.free_coins || 0) - freeCoinsUsed
      });

      await base44.entities.UserEntranceEffect.create({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        effect_id: effect.id,
        effect_name: effect.name,
        animation_type: effect.animation_type,
        purchased_price: effect.price_usd,
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['userEffects']);
      toast.success("Entrance effect purchased!");
    },
    onError: (error) => {
      console.error("❌ Effect purchase failed:", error);
      toast.error(error.message || "Purchase failed");
    }
  });

  const purchaseCoinsMutation = useMutation({
    mutationFn: async ({ amount, coinAmount }) => {
      console.log('🟦 [Store] Starting Square payment');
      
      if (!user?.id) {
        throw new Error("User not logged in");
      }

      toast.loading("Creating Square checkout...", { id: 'square-checkout' });

      try {
        const response = await base44.functions.invoke('createSquarePayment', {
          amount: parseFloat(amount),
          coinAmount: coinAmount,
        });

        console.log('🟦 [Store] Full response:', response);

        toast.dismiss('square-checkout');

        if (!response || !response.data) {
          throw new Error("No response from server");
        }

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        if (!response.data.checkoutUrl) {
          throw new Error("No checkout URL received from Square");
        }

        console.log('✅ [Store] Got checkout URL:', response.data.checkoutUrl);
        toast.success("Redirecting to Square...");
        
        setTimeout(() => {
          window.location.href = response.data.checkoutUrl;
        }, 500);

        return response.data;
      } catch (error) {
        console.error('❌ Catch block error:', error);
        toast.dismiss('square-checkout');
        throw error;
      }
    },
    onError: (error) => {
      console.error('❌ [MUTATION ERROR]:', error);
      const errorMsg = error.message || "Payment failed. Check console for details.";
      toast.error(errorMsg, { duration: 5000 });
    }
  });

  const calculateCoinsForAmount = (amount) => {
    // Match the same coins-per-dollar ratio as packages
    // Based on new pricing: $6.49 = 500 coins, $12.99 = 1370 coins, etc.
    // Using tiered rates matching the packages
    if (amount >= 279.99) return 39900; // Elite tier rate
    if (amount >= 139.99) return 19700; // Gold tier rate
    if (amount >= 49.99) return 6850; // Premium tier rate
    if (amount >= 19.99) return 3140; // Pro tier rate
    if (amount >= 12.99) return 1370; // Basic tier rate
    if (amount >= 6.49) return 500; // Starter tier rate
    
    // For amounts less than starter pack, use base rate (~77 coins per dollar)
    return Math.floor(amount * 77);
  };

  const coinPackages = [
    { 
      id: 1, 
      coins: 500, 
      price: 6.49, 
      popular: false,
      emoji: "🪙",
      bonus: 0
    },
    { 
      id: 2, 
      coins: 1370, 
      price: 12.99, 
      popular: true,
      emoji: "💰",
      bonus: 70
    },
    { 
      id: 3, 
      coins: 3140, 
      price: 19.99, 
      popular: false,
      emoji: "💎",
      bonus: 140
    },
    { 
      id: 4, 
      coins: 6850, 
      price: 49.99, 
      popular: false,
      emoji: "🏆",
      bonus: 850
    },
    { 
      id: 5, 
      coins: 19700, 
      price: 139.99, 
      popular: false,
      emoji: "👑",
      bonus: 5700
    },
    { 
      id: 6, 
      coins: 39900, 
      price: 279.99, 
      popular: false,
      emoji: "💸",
      bonus: 11900
    },
  ];

  const handlePurchaseEffect = (effect) => {
    const owned = userEffects?.some(e => e.effect_id === effect.id);
    if (owned) {
      toast.error("You already own this effect");
      return;
    }
    purchaseEffectMutation.mutate(effect);
  };

  const handlePurchaseCoins = (pkg) => {
    if (!user) {
      toast.error("Please login to purchase coins");
      return;
    }
    
    const totalCoins = pkg.coins + pkg.bonus;

    purchaseCoinsMutation.mutate({
      amount: pkg.price.toFixed(2),
      coinAmount: totalCoins
    });
  };

  const handleCustomPurchase = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 0.99) {
      toast.error("Minimum purchase is $0.99");
      return;
    }
    if (amount > 500) {
      toast.error("Maximum purchase is $500.00");
      return;
    }

    const totalCoins = calculateCoinsForAmount(amount);

    purchaseCoinsMutation.mutate({
      amount: amount.toFixed(2),
      coinAmount: totalCoins
    });
  };

  const getCustomTotal = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount)) return 0;
    return calculateCoinsForAmount(amount);
  };

  const getCoinsPerDollar = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount === 0) return 0;
    return Math.floor(calculateCoinsForAmount(amount) / amount);
  };

  const rarityColors = {
    common: "from-gray-500 to-slate-500",
    rare: "from-blue-500 to-cyan-500",
    epic: "from-purple-500 to-pink-500",
    legendary: "from-yellow-500 to-orange-500"
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <style>{`
        .neon-troll {
          color: #00ff88;
          text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-4xl font-bold">
                <span className="neon-troll">Troll</span>
                <span className="text-yellow-400"> Store</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                💰 Purchased Troll Coins have REAL VALUE and can be cashed out by streamers
              </p>
            </div>
          </div>
          {user && (
            <Card className="bg-[#1a1a24] border-[#2a2a3a] px-6 py-3">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-400">Total Balance</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {(user.coins || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {(user.purchased_coins || 0).toLocaleString()} Troll
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {(user.free_coins || 0).toLocaleString()} Free
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Payment Info Banner */}
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">💎 Real Value Troll Coins</h3>
              <p className="text-sm text-gray-300">Purchased Troll Coins (green) can be earned by streamers and cashed out. Free coins (red) are for fun only!</p>
            </div>
          </div>
        </Card>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {(user?.coins || 0).toLocaleString()}
                </p>
              </div>
              <Coins className="w-12 h-12 text-yellow-400/50" />
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Total Value:</span>
                <span className="text-lg font-bold text-green-400">
                  ${((user?.coins || 0) * 0.00625).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-sm">Troll Coins</p>
                <p className="text-3xl font-bold text-green-400">
                  {(user?.purchased_coins || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-2xl">✓</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Value:</span>
                <span className="text-lg font-bold text-purple-400">
                  ${((user?.purchased_coins || 0) * 0.00625).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Real value • Can spend</p>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-sm">Free Coins</p>
                <p className="text-3xl font-bold text-red-400">
                  {(user?.free_coins || 0).toLocaleString()}
                </p>
              </div>
              <X className="w-12 h-12 text-red-400/50" />
            </div>
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Value:</span>
                <span className="text-lg font-bold text-gray-400">
                  $0.00
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">No cash value • Can spend</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("coins")}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                activeTab === "coins"
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Coins & Gifts
            </button>
            <button
              onClick={() => setActiveTab("effects")}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                activeTab === "effects"
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Entrance Effects
            </button>
          </div>
        </div>

        {/* Coins Tab */}
        {activeTab === "coins" && (
          <div className="space-y-8">
            {/* Coin Packages Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Troll Coin Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coinPackages.map((pkg) => {
                  const totalCoins = pkg.coins + pkg.bonus;
                  return (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className={`relative overflow-hidden cursor-pointer ${
                        pkg.popular 
                          ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 shadow-xl shadow-purple-500/30' 
                          : 'bg-[#1a1a24] border-[#2a2a3a] hover:border-purple-500/50'
                      } transition-all duration-300`}>
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                            MOST POPULAR
                          </div>
                        )}
                        <div className="p-6">
                          <div className="text-center mb-4">
                            <div className="text-6xl mb-3">{pkg.emoji}</div>
                            <div className="text-4xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                              <Coins className="w-8 h-8" />
                              {totalCoins.toLocaleString()}
                            </div>
                            {pkg.bonus > 0 && (
                              <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                +{pkg.bonus} BONUS
                              </div>
                            )}
                            <div className="text-2xl font-bold text-white mt-2">${pkg.price.toFixed(2)}</div>
                            <p className="text-xs text-gray-400 mt-1">
                              {totalCoins && pkg.price ? Math.floor(totalCoins / pkg.price) : 0} Troll Coins per $1
                            </p>
                            <Button
                              onClick={() => handlePurchaseCoins(pkg)}
                              disabled={purchaseCoinsMutation.isPending}
                              className={`w-full mt-4 ${
                                pkg.popular
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                  : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                              }`}
                            >
                              {purchaseCoinsMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Purchase Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Section */}
            <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                Custom Amount
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-400 mb-2 block">Enter Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0.99"
                    max="500"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white text-2xl py-6"
                  />
                  <p className="text-xs text-gray-500 mt-2">Min: $0.99 • Max: $500.00</p>
                </div>
                
                <Card className="bg-[#0a0a0f] border-[#2a2a3a] p-6">
                  <h3 className="text-lg font-bold text-white mb-4">You'll Receive:</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-yellow-400 text-2xl">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold flex items-center gap-2">
                        <Coins className="w-6 h-6" />
                        {getCustomTotal().toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      {getCoinsPerDollar()} Troll Coins per $1
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <h4 className="text-blue-300 text-sm font-bold mb-2">💎 Rate Tiers:</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p>• $6.49+: <span className="text-cyan-400">~77 coins/$</span></p>
                      <p>• $12.99+: <span className="text-cyan-400">~105 coins/$</span></p>
                      <p>• $19.99+: <span className="text-cyan-400">~157 coins/$</span></p>
                      <p>• $49.99+: <span className="text-cyan-400">~137 coins/$</span></p>
                      <p>• $139.99+: <span className="text-cyan-400">~141 coins/$</span></p>
                      <p>• $279.99+: <span className="text-cyan-400">~143 coins/$</span></p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCustomPurchase}
                    disabled={!customAmount || parseFloat(customAmount) < 0.99 || purchaseCoinsMutation.isPending}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-6 text-lg font-bold"
                  >
                    {purchaseCoinsMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Purchase {getCustomTotal().toLocaleString()} Troll Coins
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            </Card>

            {/* Gifts Preview */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Available Gifts</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {gifts.slice(0, 12).map((gift) => (
                  <Card key={gift.id} className="bg-[#1a1a24] border-[#2a2a3a] p-4 text-center">
                    <div className="text-4xl mb-2">{gift.emoji}</div>
                    <p className="text-white text-sm font-semibold">{gift.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">{gift.coin_value}</span>
                    </div>
                  </Card>
                ))}
 