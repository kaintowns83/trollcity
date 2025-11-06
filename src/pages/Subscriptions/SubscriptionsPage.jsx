
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Plus, Edit, Trash2, Star, CheckCircle, Users, DollarSign, TrendingUp, Settings } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [showCreateTier, setShowCreateTier] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    tier_name: "",
    tier_level: 1,
    price_usd: 4.99,
    price_coins: 499,
    perks: [],
    badge_emoji: "⭐",
    badge_color: "#8b5cf6"
  });
  const [newPerk, setNewPerk] = useState("");

  // New states for subscription dialog
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null); // This will hold the tier the user wants to subscribe to

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myTiers = [] } = useQuery({
    queryKey: ['myTiers', user?.id],
    queryFn: () => base44.entities.SubscriptionTier.filter({ 
      streamer_id: user.id,
      is_active: true 
    }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: mySubscribers = [] } = useQuery({
    queryKey: ['mySubscribers', user?.id],
    queryFn: () => base44.entities.UserSubscription.filter({
      streamer_id: user.id,
      status: "active"
    }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: mySubscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.id],
    queryFn: () => base44.entities.UserSubscription.filter({
      subscriber_id: user.id,
      status: "active"
    }),
    initialData: [],
    enabled: !!user?.id,
  });

  const createTierMutation = useMutation({
    mutationFn: async (tierData) => {
      await base44.entities.SubscriptionTier.create({
        ...tierData,
        streamer_id: user.id,
        streamer_name: user.username || user.full_name,
        is_active: true,
        subscriber_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTiers']);
      setShowCreateTier(false);
      setTierForm({
        tier_name: "",
        tier_level: 1,
        price_usd: 4.99,
        price_coins: 499,
        perks: [],
        badge_emoji: "⭐",
        badge_color: "#8b5cf6"
      });
      toast.success("Subscription tier created!");
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.SubscriptionTier.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTiers']);
      setEditingTier(null);
      toast.success("Tier updated!");
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: async (tierId) => {
      await base44.entities.SubscriptionTier.update(tierId, { is_active: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTiers']);
      toast.success("Tier deleted");
    },
  });

  // New subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (tierData) => { // tierData will be the selectedTier object
      // Simulate payment processing (if any)
      console.log("Attempting to subscribe to tier:", tierData.tier_name, "by streamer:", tierData.streamer_name);

      await base44.entities.UserSubscription.create({
        tier_id: tierData.id,
        streamer_id: tierData.streamer_id,
        streamer_name: tierData.streamer_name,
        subscriber_id: user.id,
        subscriber_name: user.username || user.full_name,
        price_paid: tierData.price_usd,
        tier_name: tierData.tier_name,
        badge_emoji: tierData.badge_emoji,
        status: "active",
        auto_renew: true, // Default to auto-renew
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });

      // Increment subscriber count for the tier
      // This update would typically require service role permissions if it's not the current user's tier.
      // For this example, we assume `base44` client allows updating external tiers (or a backend hook handles it).
      await base44.entities.SubscriptionTier.update(tierData.id, {
        subscriber_count: (tierData.subscriber_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mySubscriptions']);
      queryClient.invalidateQueries(['myTiers']); // To potentially update streamer's tiers subscriber counts
      queryClient.invalidateQueries(['currentUser']);
      
      // Send notification to streamer
      base44.asServiceRole.entities.Notification.create({
        user_id: selectedTier.streamer_id,
        type: "subscription",
        title: "⭐ New Subscriber!",
        message: `${user.username || user.full_name} subscribed to your ${selectedTier.tier_name} tier!`,
        icon: "👑",
        link_url: `/#/Profile?userId=${user.id}`,
        related_user_id: user.id,
        related_user_name: user.full_name
      }).catch(console.error);
      
      setShowSubscribeDialog(false);
      setSelectedTier(null);
      toast.success("Successfully subscribed!");
    },
    onError: (error) => {
      toast.error(`Subscription failed: ${error.message}`);
      console.error("Subscription error:", error);
    }
  });

  const handleAddPerk = () => {
    if (!newPerk.trim()) return;
    setTierForm(prev => ({
      ...prev,
      perks: [...(prev.perks || []), newPerk.trim()]
    }));
    setNewPerk("");
  };

  const handleRemovePerk = (index) => {
    setTierForm(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
  };

  const handleCreateTier = () => {
    if (!tierForm.tier_name || !tierForm.price_usd || tierForm.perks.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    createTierMutation.mutate(tierForm);
  };

  const totalRevenue = mySubscribers.reduce((sum, sub) => sum + (sub.price_paid || 0), 0);
  const tierLevelConfig = {
    1: { name: "Bronze", color: "from-orange-600 to-amber-600", emoji: "🥉" },
    2: { name: "Silver", color: "from-gray-400 to-slate-400", emoji: "🥈" },
    3: { name: "Gold", color: "from-yellow-500 to-orange-500", emoji: "🥇" },
    4: { name: "Platinum", color: "from-purple-500 to-pink-500", emoji: "💎" }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Subscriptions
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage your subscription tiers and supporters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400">Subscribers</span>
            </div>
            <p className="text-4xl font-bold text-purple-400">{mySubscribers.length}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <span className="text-gray-400">Monthly Revenue</span>
            </div>
            <p className="text-4xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-cyan-400" />
              <span className="text-gray-400">Active Tiers</span>
            </div>
            <p className="text-4xl font-bold text-cyan-400">{myTiers.length}</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-400">Subscribed To</span>
            </div>
            <p className="text-4xl font-bold text-yellow-400">{mySubscriptions.length}</p>
          </Card>
        </div>

        <Tabs defaultValue="my-tiers" className="space-y-6">
          <TabsList className="bg-[#1a1a24] border border-[#2a2a3a]">
            <TabsTrigger value="my-tiers">My Tiers</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="subscribed-to">Subscribed To</TabsTrigger>
          </TabsList>

          {/* My Tiers Tab */}
          <TabsContent value="my-tiers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Subscription Tiers</h2>
              <Button
                onClick={() => setShowCreateTier(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tier
              </Button>
            </div>

            {myTiers.length === 0 ? (
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
                <Crown className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">No subscription tiers yet</h3>
                <p className="text-gray-500 mb-6">Create your first tier to start earning from subscriptions</p>
                <Button
                  onClick={() => setShowCreateTier(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tier
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTiers.sort((a, b) => a.tier_level - b.tier_level).map((tier) => {
                  const config = tierLevelConfig[tier.tier_level];
                  return (
                    <Card key={tier.id} className="bg-[#1a1a24] border-[#2a2a3a] overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{config.emoji}</span>
                            <div>
                              <h3 className="text-xl font-bold text-white">{tier.tier_name}</h3>
                              <Badge className={`bg-gradient-to-r ${config.color} text-white border-0 text-xs mt-1`}>
                                Level {tier.tier_level}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTier(tier);
                                setTierForm(tier);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (window.confirm("Delete this tier?")) {
                                  deleteTierMutation.mutate(tier.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-white">${tier.price_usd}</span>
                            <span className="text-gray-400">/month</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            or {tier.price_coins} coins/month
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {tier.perks?.map((perk, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{perk}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#2a2a3a]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-400">{tier.subscriber_count || 0} subscribers</span>
                          </div>
                          <Badge className="text-2xl">{tier.badge_emoji}</Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
