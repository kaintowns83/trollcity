
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Share2, Gift, CheckCircle, Clock, Coins, Trophy } from "lucide-react";
import { toast } from "sonner";
import UserLink from "../components/UserLink";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Generate referral code if user doesn't have one
  useEffect(() => {
    const generateReferralCode = async () => {
      if (user && !user.referral_code) {
        try {
          // Generate a unique referral code
          const username = user.username || user.full_name || user.email.split('@')[0];
          const referralCode = `${username.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          
          console.log("📝 Generating referral code for user:", referralCode);
          
          await base44.auth.updateMe({
            referral_code: referralCode
          });
          
          // Refresh user data
          queryClient.invalidateQueries(['currentUser']);
          
          toast.success("Referral code generated!");
        } catch (error) {
          console.error("Failed to generate referral code:", error);
          toast.error("Failed to generate referral code.");
        }
      }
    };

    generateReferralCode();
  }, [user?.id, user?.referral_code, queryClient, user?.username, user?.full_name, user?.email]); // Added dependencies for safety

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['myReferrals', user?.id],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: user.id }, "-created_date"),
    enabled: !!user?.id,
    initialData: [],
  });

  const referralLink = user?.referral_code 
    ? `${window.location.origin}/#/ProfileSetup?ref=${user.referral_code}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TrollCity!',
          text: `Join me on TrollCity and we'll both get 2,000 coins when you reach Level 10! Use my referral code: ${user?.referral_code}`,
          url: referralLink
        });
      } catch (err) {
        console.log('Share failed:', err);
        // Fallback to copy if share fails
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const pendingReferrals = myReferrals.filter(r => r.status === 'pending');
  const completedReferrals = myReferrals.filter(r => r.status === 'completed');

  // Show loading state while generating referral code
  if (!user?.referral_code) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Setting up your referral program...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
 