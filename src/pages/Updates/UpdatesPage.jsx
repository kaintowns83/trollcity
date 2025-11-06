import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Trophy, Shield, Users, Gift, Heart, MessageCircle, Radio, DollarSign, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function UpdatesPage() {
  const updates = [
    {
      version: "2.0.0",
      date: "2025-01-15",
      title: "Major Platform Overhaul",
      category: "major",
      items: [
        { icon: Shield, text: "Troll Officer Voting System - Democratic approval process for new officers", color: "text-cyan-400" },
        { icon: Gift, text: "Top Supporters Leaderboard - Auto-tracks ALL gifts (streams + posts + comments)", color: "text-yellow-400" },
        { icon: Crown, text: "Troll Officer Benefits - 50K free coins welcome bonus + 2% revenue share", color: "text-purple-400" },
        { icon: Radio, text: "Officer-Only Stream & Chat - Exclusive pages for moderation team", color: "text-blue-400" },
        { icon: DollarSign, text: "Payment Verification System - $0.00 test payments before payouts", color: "text-green-400" },
      ]
    },
    {
      version: "1.9.0",
      date: "2025-01-10",
      title: "Admin & Moderation Tools",
      category: "feature",
      items: [
        { icon: Trophy, text: "Add/Remove Levels - Admins can adjust user levels manually", color: "text-cyan-400" },
        { icon: Gift, text: "Subtract Coins - Remove coins from any user account", color: "text-orange-400" },
        { icon: Gift, text: "Convert Coins - Change purchased coins to free coins", color: "text-purple-400" },
        { icon: Shield, text: "Stream Ending Powers - Level 70+ can end lower-level streams", color: "text-red-400" },
        { icon: Users, text: "User Management - View total streaming hours in admin dashboard", color: "text-blue-400" },
      ]
    },
    {
      version: "1.8.0",
      date: "2025-01-05",
      title: "Referral & Social Features",
      category: "feature",
      items: [
        { icon: Users, text: "Universal Referral Codes - Everyone can invite new users", color: "text-green-400" },
        { icon: Gift, text: "Referral Rewards - 2,000 Troll Coins when referred user hits Level 10", color: "text-yellow-400" },
        { icon: Heart, text: "Profile Posts - Create text, image, and video posts", color: "text-pink-400" },
        { icon: MessageCircle, text: "Direct Messaging - Message any user privately", color: "text-blue-400" },
        { icon: Trophy, text: "Top Supporters - Shows top 10 gifters on each profile", color: "text-purple-400" },
      ]
    },
    {
      version: "1.7.0",
      date: "2024-12-28",
      title: "Streaming Enhancements",
      category: "feature",
      items: [
        { icon: Radio, text: "Multi-Troll Streams - Up to 14 participants in grid view", color: "text-cyan-400" },
        { icon: Radio, text: "LiveKit Integration - Professional streaming backend", color: "text-blue-400" },
        { icon: Radio, text: "Stream Categories - Gaming, Music, Talk, Creative, and more", color: "text-purple-400" },
        { icon: Users, text: "Stream Participants - Real-time viewer tracking system", color: "text-green-400" },
      ]
    },
    {
      version: "1.6.0",
      date: "2024-12-20",
      title: "Monetization & Earnings",
      category: "feature",
      items: [
        { icon: DollarSign, text: "Tiered Payout System - Better rates for higher earnings", color: "text-green-400" },
        { icon: Gift, text: "Custom Gifts - Users can create custom gifts for 10K coins", color: "text-yellow-400" },
        { icon: Gift, text: "Gift Creator Earnings - 100 coins per custom gift sent", color: "text-orange-400" },
        { icon: Trophy, text: "Daily Rewards - Login daily for increasing coin bonuses", color: "text-cyan-400" },
        { icon: Crown, text: "Broadcaster Application - Level 20+ can apply for payouts", color: "text-purple-400" },
      ]
    },
    {
      version: "1.5.0",
      date: "2024-12-15",
      title: "Level System & Progression",
      category: "feature",
      items: [
        { icon: Trophy, text: "9-Tier Level System - From Basement Dwellers to Troll Officers", color: "text-cyan-400" },
        { icon: Sparkles, text: "XP System - Earn XP from likes, gifts, streaming", color: "text-purple-400" },
        { icon: Shield, text: "OG Badges - Early adopters get special badges", color: "text-yellow-400" },
        { icon: Crown, text: "Level Perks - Unlock features as you level up", color: "text-orange-400" },
      ]
    },
    {
      version: "1.4.0",
      date: "2024-12-10",
      title: "Moderation & Safety",
      category: "security",
      items: [
        { icon: Shield, text: "AI Content Moderation - Automatic flagging of inappropriate content", color: "text-red-400" },
        { icon: Shield, text: "Keyword Filtering - Block specific words and phrases", color: "text-orange-400" },
        { icon: Shield, text: "Auto-Clicker Detection - Ban bots and automated liking", color: "text-yellow-400" },
        { icon: Users, text: "Block System - Block users from interacting with you", color: "text-purple-400" },
      ]
    },
    {
      version: "1.3.0",
      date: "2024-12-05",
      title: "Coins & Economy",
      category: "feature",
      items: [
        { icon: Gift, text: "3 Coin Types - Purchased (real value), Earned (cashout), Free (no value)", color: "text-green-400" },
        { icon: DollarSign, text: "Real Money Value - Purchased coins = real money for streamers", color: "text-yellow-400" },
        { icon: Trophy, text: "Coin Earning Boosts - Level-based earning multipliers", color: "text-cyan-400" },
        { icon: Gift, text: "Gift System - 20+ unique gifts with animations", color: "text-pink-400" },
      ]
    },
    {
      version: "1.2.0",
      date: "2024-11-30",
      title: "Social Features",
      category: "feature",
      items: [
        { icon: Heart, text: "Follow System - Follow your favorite streamers", color: "text-pink-400" },
        { icon: Users, text: "Follower Management - See who follows you", color: "text-purple-400" },
        { icon: MessageCircle, text: "Chat System - Real-time chat in streams", color: "text-blue-400" },
        { icon: Trophy, text: "Leaderboards - Top streamers, gifters, and earners", color: "text-yellow-400" },
      ]
    },
    {
      version: "1.1.0",
      date: "2024-11-25",
      title: "Profile & Customization",
      category: "feature",
      items: [
        { icon: Sparkles, text: "Profile Customization - Avatars, bios, cover photos", color: "text-purple-400" },
        { icon: Sparkles, text: "Entrance Effects - Custom animations when joining streams", color: "text-cyan-400" },
        { icon: Trophy, text: "Achievements System - Unlock badges and rewards", color: "text-yellow-400" },
      ]
    },
    {
      version: "1.0.0",
      date: "2024-11-20",
      title: "Platform Launch",
      category: "major",
      items: [
        { icon: Radio, text: "Live Streaming - Go live instantly with camera/screen", color: "text-red-400" },
        { icon: Gift, text: "Gift System - Send virtual gifts to streamers", color: "text-yellow-400" },
        { icon: Users, text: "User Profiles - Customizable profiles for all users", color: "text-purple-400" },
        { icon: Trophy, text: "Coin System - Earn and spend Troll Coins", color: "text-green-400" },
        { icon: MessageCircle, text: "Real-time Chat - Engage with streamers and viewers", color: "text-blue-400" },
      ]
    },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "major": return "from-purple-500 to-pink-500";
      case "feature": return "from-blue-500 to-cyan-500";
      case "security": return "from-red-500 to-orange-500";
      case "bugfix": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "major": return { text: "MAJOR UPDATE", class: "bg-purple-500" };
      case "feature": return { text: "NEW FEATURE", class: "bg-blue-500" };
      case "security": return { text: "SECURITY", class: "bg-red-500" };
      case "bugfix": return { text: "BUG FIX", class: "bg-green-500" };
      default: return { text: "UPDATE", class: "bg-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Platform Updates
          </h1>
          <p className="text-gray-400 text-lg">
 