
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, DollarSign, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Lock, Award, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EarningsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: receivedGifts } = useQuery({
    queryKey: ['receivedGifts', user?.id],
    queryFn: () => base44.entities.StreamGift.filter({ stream_id: user?.id }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: payouts } = useQuery({
    queryKey: ['payouts', user?.id],
    queryFn: () => base44.entities.Payout.filter({ user_id: user?.id }, "-created_date"),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: paymentVerifications = [] } = useQuery({
    queryKey: ['paymentVerifications', user?.id],
    queryFn: () => base44.entities.PaymentVerification.filter({ user_id: user.id }),
    enabled: !!user,
    initialData: [],
  });

  const earnedCoins = user?.earned_coins || 0;
  const userLevel = user?.level || 1;
  const streamingHours = user?.total_streaming_hours || 0;
  const hoursSinceLastPayout = user?.hours_since_last_payout || 0; // New: Hours since last payout
  const isBroadcasterApproved = user?.is_broadcaster_approved || false;
  const hasPaymentMethod = user?.payment_method && (
    user?.payment_email || user?.payment_username || user?.bank_account_number
  );
  
  // NEW PAYOUT TIER SYSTEM
  const getPayoutTier = () => {
    // Elite tier: Must wait 200 hours between payouts (but keeps higher limits)
    if (userLevel >= 20 && streamingHours >= 400 && hoursSinceLastPayout >= 200) {
      return { tier: 'elite', name: '👑 Elite', maxCashout: 275, fee: 0.10, feeType: 'percentage', levelReq: 20, hoursReq: 400, unlocked: true, minCoins: 44000, grossAmount: 275, waitHours: 200 };
    } else if (userLevel >= 15 && streamingHours >= 40) { // hoursSinceLastPayout >= 40 check is handled by `canRequestPayout`
      return { tier: 'regular', name: '⭐ Regular', maxCashout: 45, fee: 1, feeType: 'flat', levelReq: 15, hoursReq: 40, unlocked: true, minCoins: 7200, grossAmount: 45, waitHours: 40 };
    } else if (userLevel >= 10 && streamingHours >= 15) { // hoursSinceLastPayout >= 15 check is handled by `canRequestPayout`
      return { tier: 'starter', name: '🌟 Starter', maxCashout: 20, fee: 1, feeType: 'flat', levelReq: 10, hoursReq: 15, unlocked: true, minCoins: 3200, grossAmount: 20, waitHours: 15 };
    }
    return { tier: 'none', name: 'Locked', maxCashout: 0, fee: 0, feeType: 'flat', levelReq: 10, hoursReq: 15, unlocked: false, minCoins: 0, grossAmount: 0, waitHours: 0 };
  };

  const currentTier = getPayoutTier();
  const meetsRequirements = currentTier.unlocked;

  // Convert coins to USD - 160 coins = $1 (0.00625 per coin)
  const coinsToUSD = (coins) => {
    return coins * 0.00625;
  };

  const calculatePayout = (coins) => {
    const usdAmount = coinsToUSD(coins);
    
    // Calculate fee based on tier
    let feeAmount;
    if (currentTier.feeType === 'percentage') {
      // Elite tier: 10% fee
      feeAmount = usdAmount * currentTier.fee;
    } else {
      // Starter/Regular: Flat $1 fee
      feeAmount = currentTier.fee;
    }
    
    const payoutAmount = Math.max(0, usdAmount - feeAmount);
    
    // Apply tier max limit (Elite has $300 max)
    const finalPayout = Math.min(payoutAmount, currentTier.maxCashout);
    
    return {
      usdAmount,
      feeAmount,
      payoutAmount: finalPayout,
      cappedByTier: finalPayout < payoutAmount
    };
  };

  const requestPayoutMutation = useMutation({
    mutationFn: async (payoutData) => {
      await base44.entities.Payout.create(payoutData);
      await base44.auth.updateMe({
        coins: (user?.coins || 0) - payoutData.coin_amount,
        earned_coins: (user?.earned_coins || 0) - payoutData.coin_amount,
        hours_since_last_payout: 0, // Reset hours since last payout
        last_payout_date: new Date().toISOString() // Update last payout date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['payouts']);
      toast.success("Payout request submitted! Awaiting admin approval.");
      setShowPayoutDialog(false);
    },
    onError: () => {
      toast.error("Failed to submit payout request. Please try again.");
    },
  });

  const handleRequestPayout = () => {
    if (!hasPaymentMethod) {
      toast.error("Please add a payment method in your profile settings");
      return;
    }

    const verifications = paymentVerifications.filter(v => v.user_id === user.id);
    const latestVerification = verifications[0];

    if (!latestVerification || !latestVerification.verified_by_user) {
      toast.error("Please verify your payment method before requesting a payout. Check your Profile → Payment tab.");
      return;
    }

    // All tiers now require waiting hours between payouts
    if (hoursSinceLastPayout < currentTier.waitHours) {
      toast.error(`You need to stream ${(currentTier.waitHours - hoursSinceLastPayout).toFixed(1)} more hours since your last payout to request another payout.`);
      return;
    }

    const { usdAmount, feeAmount, payoutAmount } = calculatePayout(earnedCoins);

    requestPayoutMutation.mutate({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      coin_amount: earnedCoins,
      usd_amount: usdAmount,
      fee_amount: feeAmount,
      payout_amount: payoutAmount,
      payment_method: user.payment_method,
      payment_details: user.payment_email || user.payment_username || "Bank Transfer",
      status: "pending",
      notes: `Tier: ${currentTier.name}`
    });
  };

  const totalEarned = receivedGifts.reduce((sum, gift) => sum + (gift.coin_value || 0), 0);
  const { usdAmount, feeAmount, payoutAmount, cappedByTier } = calculatePayout(earnedCoins);
  const totalPaidOut = payouts
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    processing: <AlertCircle className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />
  };

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500",
    completed: "bg-green-500/20 text-green-300 border-green-500",
    rejected: "bg-red-500/20 text-red-300 border-red-500"
  };

  // Calculate XP requirements for next level
  const getXPForLevel = (level) => {
    return Math.floor(1500 * Math.pow(1.6, level - 1));
  };

  const getTotalXPNeeded = (targetLevel) => {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += getXPForLevel(i);
    }
    return total;
  };

  const currentXP = user?.experience || 0;

  // Minimum coins to request payout based on current tier
  const minPayoutCoins = currentTier.minCoins || 3200;
  const isPaymentVerified = paymentVerifications.some(v => v.user_id === user?.id && v.verified_by_user);
  const canRequestPayout = earnedCoins >= minPayoutCoins && meetsRequirements && isBroadcasterApproved && hasPaymentMethod && isPaymentVerified && hoursSinceLastPayout >= currentTier.waitHours;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Earnings & Payouts
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Cash out your earned coins with our new tier system</p>
        </div>

        {/* NEW TIER SYSTEM BANNER */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Zap className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">🎉 New Payout Tier System!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Starter Tier */}
                <div className={`bg-[#0a0a0f] rounded-lg p-4 border-2 ${
                  currentTier.tier === 'starter' ? 'border-yellow-500' : 'border-[#2a2a3a]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🌟</span>
                    <h4 className="text-white font-bold">Starter</h4>
                    {userLevel >= 10 && streamingHours >= 15 && (
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Lvl 10 + 15 total hrs</p>
                  <p className="text-green-400 font-bold">Max $20</p>
                  <p className="text-xs text-yellow-400">3,200 coins min</p>
                  <p className="text-xs text-gray-500">$1 flat fee</p>
                  <p className="text-xs text-orange-400 mt-1">⏰ Wait 15hrs between payouts</p>
                </div>

                {/* Regular Tier */}
                <div className={`bg-[#0a0a0f] rounded-lg p-4 border-2 ${
                  currentTier.tier === 'regular' ? 'border-blue-500' : 'border-[#2a2a3a]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <h4 className="text-white font-bold">Regular</h4>
                    {userLevel >= 15 && streamingHours >= 40 && (
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Lvl 15 + 40 total hrs</p>
                  <p className="text-green-400 font-bold">Max $45</p>
                  <p className="text-xs text-yellow-400">7,200 coins min</p>
                  <p className="text-xs text-gray-500">$1 flat fee</p>
                  <p className="text-xs text-orange-400 mt-1">⏰ Wait 40hrs between payouts</p>
                </div>

                {/* Elite Tier */}
                <div className={`bg-[#0a0a0f] rounded-lg p-4 border-2 ${
                  currentTier.tier === 'elite' ? 'border-purple-500' : 'border-[#2a2a3a]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <h4 className="text-white font-bold">Elite</h4>
                    {userLevel >= 20 && streamingHours >= 400 && (
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Lvl 20 + 400 total hrs</p>
                  <p className="text-green-400 font-bold">Max $275</p>
                  <p className="text-xs text-yellow-400">44,000 coins min</p>
                  <p className="text-xs text-gray-500">10% fee</p>
                  <p className="text-xs text-orange-400 mt-1">⏰ Wait 200hrs between payouts</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Progress */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Progress */}
            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Level</span>
                <Badge className="bg-purple-500 text-white text-lg px-4 py-1">
                  Level {userLevel}
                </Badge>
              </div>
              <p className="text-cyan-400 text-sm mb-2">{(user?.experience || 0).toLocaleString()} XP</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Starter (Lvl 10):</span>
                  <span className={userLevel >= 10 ? "text-green-400" : "text-gray-500"}>
                    {userLevel >= 10 ? "✓" : `${10 - userLevel} more`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Regular (Lvl 15):</span>
                  <span className={userLevel >= 15 ? "text-green-400" : "text-gray-500"}>
                    {userLevel >= 15 ? "✓" : `${15 - userLevel} more`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Elite (Lvl 20):</span>
                  <span className={userLevel >= 20 ? "text-green-400" : "text-gray-500"}>
                    {userLevel >= 20 ? "✓" : `${20 - userLevel} more`}
                  </span>
                </div>
              </div>
            </div>

            {/* Streaming Hours */}
            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Streaming Hours</span>
                <Badge className="bg-red-500 text-white text-lg px-4 py-1">
                  {streamingHours.toFixed(1)} hrs
                </Badge>
              </div>
              <p className="text-orange-400 text-sm mb-2">
                {hoursSinceLastPayout.toFixed(1)} hrs since last payout
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Starter (15 total hrs):</span>
                  <span className={streamingHours >= 15 ? "text-green-400" : "text-gray-500"}>
                    {streamingHours >= 15 ? "✓ Unlocked" : `${(15 - streamingHours).toFixed(1)} more`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Regular (40 total hrs):</span>
                  <span className={streamingHours >= 40 ? "text-green-400" : "text-gray-500"}>
                    {streamingHours >= 40 ? "✓ Unlocked" : `${(40 - streamingHours).toFixed(1)} more`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Elite (400 total hrs):</span>
                  <span className={streamingHours >= 400 ? "text-green-400" : "text-gray-500"}>
                    {streamingHours >= 400 ? "✓ Unlocked" : `${(400 - streamingHours).toFixed(1)} more`}
                  </span>
                </div>
                {currentTier.tier !== 'none' && (
                  <>
                    <div className="h-px bg-[#2a2a3a] my-1" />
                    <div className="flex justify-between text-orange-400">
                      <span>Next payout in:</span>
                      <span className={hoursSinceLastPayout >= currentTier.waitHours ? "text-green-400" : "text-orange-400"}>
                        {hoursSinceLastPayout >= currentTier.waitHours ? "✓ Ready!" : `${(currentTier.waitHours - hoursSinceLastPayout).toFixed(1)}hrs`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Current Tier Display */}
          <div className="mt-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Tier</p>
                <p className="text-2xl font-bold text-white">{currentTier.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Max Cashout</p>
                <p className="text-2xl font-bold text-green-400">
                  {currentTier.maxCashout === Infinity ? "Unlimited" : `$${currentTier.maxCashout}`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method Required Notice */}
        {!hasPaymentMethod && (
          <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500 p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">💳 Payment Method Required</h3>
                <p className="text-sm text-red-200 mb-3">
                  You must add a payment method before you can request payouts.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Profile') + '?tab=payment')}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Update Payment Method
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Verification Required Notice */}
        {hasPaymentMethod && !isPaymentVerified && (
          <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500 p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">✅ Payment Verification Required</h3>
                <p className="text-sm text-red-200 mb-3">
                  Your payment method needs to be verified before you can request payouts. Please check your Profile → Payment tab.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Profile') + '?tab=payment')}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Go to Payment Settings
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tier Requirements Notice */}
        {!meetsRequirements && (
          <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">🔒 Unlock Payouts</h3>
                <p className="text-sm text-orange-200">
                  You need <strong>Level {currentTier.levelReq}</strong> and <strong>{currentTier.hoursReq} streaming hours</strong> to unlock {currentTier.name} tier
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Broadcaster Application Notice */}
        {meetsRequirements && !isBroadcasterApproved && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">📝 Broadcaster Application Required</h3>
                <p className="text-sm text-purple-200 mb-3">You've unlocked a tier! Now apply to become an approved broadcaster to enable payouts.</p>
                <Button
                  onClick={() => window.location.href = createPageUrl('BroadcasterApplication')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="sm"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Earned Coins</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <span className="text-3xl font-bold text-yellow-400">
                    {earnedCoins.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Cash Value:</span>
                <span className="text-2xl font-bold text-green-400">
                  ${usdAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">160 coins = $1</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Troll Coins</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-green-400" />
                  <span className="text-3xl font-bold text-green-400">
                    {(user?.purchased_coins || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Value:</span>
                <span className="text-xl font-bold text-purple-400">
                  ${((user?.purchased_coins || 0) * 0.00625).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">For spending only</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Free Coins</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-red-400" />
                  <span className="text-3xl font-bold text-red-400">
                    {(user?.free_coins || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Cash Value:</span>
                <span className="text-xl font-bold text-gray-400">
                  $0.00
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">Cannot cash out</p>
            </div>
          </Card>
        </div>

        {/* Payout Request Card */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Request Payout</h2>
              <p className="text-gray-400 mb-4">
                Minimum: <span className="text-yellow-400 font-semibold">{minPayoutCoins.toLocaleString()} earned coins (${currentTier.grossAmount})</span>
              </p>
              
              {canRequestPayout ? (
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Your Earned Coins:</span>
                    <span className="font-semibold">{earnedCoins.toLocaleString()} coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span className="font-semibold">${usdAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Fee:</span>
                    <span>
                      {currentTier.feeType === 'percentage' 
                        ? `-$${feeAmount.toFixed(2)} (${currentTier.fee * 100}%)` 
                        : '-$1.00'}
                    </span>
                  </div>
                  {cappedByTier && (
                    <div className="flex justify-between text-orange-400">
                      <span>Tier Cap:</span>
                      <span>${currentTier.maxCashout}</span>
                    </div>
                  )}
                  <div className="h-px bg-[#2a2a3a] my-2" />
                  <div className="flex justify-between text-green-400 text-lg">
 