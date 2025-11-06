
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Flame, Star, Trophy, Crown, Zap, CheckCircle, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function RewardsPage() {
  const queryClient = useQueryClient();
  const [canClaim, setCanClaim] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: lastReward } = useQuery({
    queryKey: ['lastDailyReward', user?.id],
    queryFn: async () => {
      if (!user?.id) return null; // Ensure user.id exists before calling filter
      const rewards = await base44.entities.DailyReward.filter(
        { user_id: user.id },
        "-created_date",
        1
      );
      return rewards[0] || null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!lastReward) {
      setCanClaim(true);
      return;
    }

    const lastClaimDate = new Date(lastReward.last_claim_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastClaimDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastClaimDate) / (1000 * 60 * 60 * 24));
    setCanClaim(daysDiff >= 1);
  }, [lastReward]);

  const claimDailyRewardMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let dayNumber = 1;
      let streakCount = 1;
      
      if (lastReward) {
        const lastDate = new Date(lastReward.last_claim_date);
        const todayDate = new Date();
        const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          dayNumber = (lastReward.day_number % 30) + 1;
          streakCount = lastReward.streak_count + 1;
        } else {
          dayNumber = 1;
          streakCount = 1;
        }
      }

      let coinsEarned = 50 + (dayNumber * 10);
      let bonusApplied = false;

      if (dayNumber % 7 === 0) {
        coinsEarned *= 2;
        bonusApplied = true;
      }

      if (dayNumber === 30) {
        coinsEarned = 1000;
        bonusApplied = true;
      }

      // Get current user data to ensure we're adding to existing coins
      const currentUser = await base44.auth.me();
      
      console.log("💰 Daily Reward (FREE COINS):", {
        currentCoins: currentUser.coins,
        currentFreeCoins: currentUser.free_coins,
        coinsToAdd: coinsEarned,
        newTotal: (currentUser.coins || 0) + coinsEarned,
        newFreeCoins: (currentUser.free_coins || 0) + coinsEarned
      });

      // Create reward record
      await base44.entities.DailyReward.create({
        user_id: user.id,
        user_name: user.full_name,
        day_number: dayNumber,
        coins_earned: coinsEarned,
        bonus_applied: bonusApplied,
        last_claim_date: today,
        streak_count: streakCount
      });

      // Update user coins - ADD FREE COINS (no cash value)
      await base44.auth.updateMe({
        coins: (currentUser.coins || 0) + coinsEarned,
        free_coins: (currentUser.free_coins || 0) + coinsEarned,
        experience: (currentUser.experience || 0) + 50
      });

      return { coinsEarned, dayNumber, bonusApplied, streakCount };
    },
    onSuccess: (data) => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      toast.success(`Claimed ${data.coinsEarned} FREE coins! Day ${data.dayNumber} 🎉`);
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['lastDailyReward']);
    },
    onError: (error) => {
      console.error("❌ Daily reward claim failed:", error);
      toast.error("Failed to claim reward");
    }
  });

  const dailyRewards = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let coins = 50 + (day * 10);
    let isBonus = false;
    
    if (day % 7 === 0) {
      coins *= 2;
      isBonus = true;
    }
    
    if (day === 30) {
      coins = 1000;
      isBonus = true;
    }
    
    return { day, coins, isBonus };
  });

  const currentDay = lastReward?.day_number || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">🎉</div>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  rotate: 0
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 1000,
                  y: (Math.random() - 0.5) * 1000,
                  opacity: 0,
                  rotate: 360
                }}
                transition={{ duration: 2, delay: i * 0.05 }}
                className="absolute text-4xl"
              >
                {['🎊', '✨', '💫', '⭐', '🌟'][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header with FREE COINS notice */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Daily Rewards
              </h1>
              <p className="text-gray-400 text-sm mt-1">
 