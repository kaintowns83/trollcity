
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubscribeButton({ streamerId, streamerName }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("coins");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id, streamerId],
    queryFn: async () => {
      if (!user?.id) return null;
      const subs = await base44.entities.UserSubscription.filter({
        subscriber_id: user.id,
        streamer_id: streamerId,
        status: "active"
      });
      return subs[0] || null;
    },
    enabled: !!user?.id && !!streamerId,
  });

  const { data: tiers } = useQuery({
    queryKey: ['streamerTiers', streamerId],
    queryFn: () => base44.entities.SubscriptionTier.filter({ 
      streamer_id: streamerId,
      is_active: true 
    }),
    initialData: [],
    enabled: !!streamerId,
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ tier, paymentMethod }) => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const price = paymentMethod === 'coins' ? tier.price_coins : tier.price_usd;

      if (paymentMethod === 'coins') {
        if ((user.coins || 0) < tier.price_coins) {
          throw new Error("Not enough coins!");
        }
        
        // Use purchased coins first, then free coins (cannot use earned coins for subscriptions)
        const purchasedCoinsUsed = Math.min(user.purchased_coins || 0, tier.price_coins);
        const freeCoinsUsed = tier.price_coins - purchasedCoinsUsed;

        await base44.auth.updateMe({
          coins: (user.coins || 0) - tier.price_coins,
          purchased_coins: (user.purchased_coins || 0) - purchasedCoinsUsed,
          free_coins: (user.free_coins || 0) - freeCoinsUsed
        });

        // Add earned coins to streamer
        const streamerUsers = await base44.entities.User.filter({ id: streamerId });
        if (streamerUsers.length > 0) {
          const streamerUser = streamerUsers[0];
          await base44.entities.User.update(streamerId, {
            coins: (streamerUser.coins || 0) + tier.price_coins,
            earned_coins: (streamerUser.earned_coins || 0) + tier.price_coins
          });
        }
      }

      const sub = await base44.entities.UserSubscription.create({
        subscriber_id: user.id,
        subscriber_name: user.username || user.full_name,
        streamer_id: streamerId,
        streamer_name: streamerName,
        tier_id: tier.id,
        tier_name: tier.tier_name,
        tier_level: tier.tier_level,
        price_paid: paymentMethod === 'coins' ? tier.price_coins / 100 : tier.price_usd,
        payment_method: paymentMethod,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        badge_emoji: tier.badge_emoji
      });

      // Update tier subscriber count
      await base44.entities.SubscriptionTier.update(tier.id, {
        subscriber_count: (tier.subscriber_count || 0) + 1
      });

      // Log transaction
      await base44.entities.Transaction.create({
        user_id: user.id,
        user_name: user.username || user.full_name,
        transaction_type: "subscription",
        amount_usd: paymentMethod === 'paypal' ? tier.price_usd : 0,
        amount_coins: paymentMethod === 'coins' ? tier.price_coins : 0,
        direction: "outgoing",
        related_user_id: streamerId,
        related_user_name: streamerName,
        payment_method: paymentMethod,
        reference_id: sub.id,
        description: `Subscribed to ${streamerName} - ${tier.tier_name}`,
        status: "completed"
      });

      return sub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['streamerTiers']);
      toast.success("Successfully subscribed! 🎉");
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to subscribe");
    },
  });

  const handleSubscribe = () => {
    if (!selectedTier) {
      toast.error("Please select a tier");
      return;
    }
    subscribeMutation.mutate({ tier: selectedTier, paymentMethod });
  };

  if (!user || user.id === streamerId) return null;

  if (subscription) {
    return (
      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        {subscription.badge_emoji} Subscribed
      </Badge>
    );
  }

  if (tiers.length === 0) return null;

  const tierLevelConfig = {
    1: { name: "Bronze", color: "from-orange-600 to-amber-600" },
    2: { name: "Silver", color: "from-gray-400 to-slate-400" },
    3: { name: "Gold", color: "from-yellow-500 to-orange-500" },
    4: { name: "Platinum", color: "from-purple-500 to-pink-500" }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
          <Crown className="w-4 h-4" />
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-400" />
            Subscribe to {streamerName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a tier and get exclusive perks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Method Selector */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Payment Method</label>
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="bg-[#0a0a0f] border border-[#2a2a3a] w-full">
                <TabsTrigger value="coins" className="flex-1 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                  Pay with Coins
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Pay with PayPal
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.sort((a, b) => a.tier_level - b.tier_level).map((tier) => {
              const config = tierLevelConfig[tier.tier_level];
              const isSelected = selectedTier?.id === tier.id;
              
              return (
                <Card
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${config.color}/30 border-2 border-purple-500 scale-105`
                      : 'bg-[#0a0a0f] border-[#2a2a3a] hover:border-purple-500/50'
                  } p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}>
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{tier.tier_name}</h3>
                        <Badge className="mt-1">{tier.badge_emoji}</Badge>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-6 h-6 text-purple-400" />}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {paymentMethod === 'coins' ? `${tier.price_coins} coins` : `$${tier.price_usd}`}
                      </span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tier.perks?.map((perk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{perk}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedTier && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">You'll get:</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <p>• {selectedTier.badge_emoji} Exclusive subscriber badge</p>
                <p>• Priority in chat</p>
                <p>• All perks listed above</p>
                <p>• Support your favorite streamer!</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubscribe}
            disabled={!selectedTier || subscribeMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold py-6 text-lg"
          >
            {subscribeMutation.isPending ? "Processing..." : `Subscribe for ${
              paymentMethod === 'coins' 
                ? `${selectedTier?.price_coins || 0} coins` 
                : `$${selectedTier?.price_usd || 0}`
            }/month`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
