import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, CreditCard, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BanAppealPage() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const appealBanMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      // Create Stripe payment session for $25
      const response = await base44.functions.invoke('createBanAppealPayment', {
        userId: user.id,
        userEmail: user.email,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Redirect to Stripe checkout
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    },
    onError: (error) => {
      console.error('Ban appeal payment error:', error);
      toast.error(error.message || "Failed to process payment");
      setIsProcessing(false);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user.is_banned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Account is Active</h1>
            <p className="text-gray-400 mb-6">You're not currently banned.</p>
            <Button
              onClick={() => window.location.href = '/#/Home'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Go to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ban className="w-12 h-12 text-red-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Account Banned
          </h1>
          
          <Badge className="bg-red-500 text-white text-lg px-6 py-2">
            Your account has been suspended
          </Badge>
        </motion.div>

        {/* Ban Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#1a1a24] border-red-500/50 p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">Ban Reason</h2>
                <p className="text-gray-300 mb-4">
                  {user.ban_reason || "Your account was banned for violating our community guidelines."}
                </p>
                {user.ban_date && (
                  <p className="text-gray-400 text-sm">
                    Banned on: {new Date(user.ban_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-red-400" />
                Common Ban Reasons:
              </h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Using VPN or proxy services</li>
                <li>Auto-clicker or bot detection</li>
                <li>Inappropriate content or behavior</li>
                <li>Violation of community guidelines</li>
                <li>Spam or harassment</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Appeal Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Appeal Your Ban
              </h2>
              <p className="text-gray-300 mb-6">
                You can appeal this ban by paying a one-time reinstatement fee of <span className="text-green-400 font-bold text-2xl">$25</span>
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-300 font-bold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Important Information:
              </h3>
              <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                <li>Your account will be <strong>completely reset</strong></li>
                <li>Coins will be reset to 0</li>
                <li>Level will be reset to 0</li>
                <li>All progress will be lost</li>
                <li>You'll start fresh with a clean slate</li>
                <li>Repeated violations may result in permanent ban</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => appealBanMutation.mutate()}
                disabled={isProcessing || appealBanMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-8 text-xl font-bold"
              >
                {isProcessing || appealBanMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 mr-3" />
                    Pay $25 to Appeal Ban
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                🔒 Secure payment powered by Stripe
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                By proceeding, you agree to start over with a fresh account and follow all community guidelines.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm mb-2">
            Believe this ban was a mistake?
          </p>
          <Button
            onClick={() => window.location.href = '/#/Messages'}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
          >
            Contact Admin Support
          </Button>
        </motion.div>
      </div>
    </div>
  );
}