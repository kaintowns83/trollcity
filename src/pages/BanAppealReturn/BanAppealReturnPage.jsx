import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BanAppealReturnPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const processAppeal = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        if (!userId) {
          setStatus("error");
          setMessage("Invalid request");
          return;
        }

        // Wait a moment for payment to process
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Reset user account
        await base44.asServiceRole.entities.User.update(userId, {
          is_banned: false,
          ban_reason: null,
          ban_date: null,
          banned_by: null,
          coins: 0,
          purchased_coins: 0,
          earned_coins: 0,
          free_coins: 0,
          level: 0,
          experience: 0,
          total_gifts_received: 0,
          total_likes_given: 0,
          total_likes_received: 0,
        });

        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          user_id: userId,
          type: "achievement",
          title: "✅ Account Reinstated",
          message: "Your ban appeal was successful. Your account has been reset and you can start fresh!",
          icon: "🎉",
          link_url: "/#/Profile"
        });

        setStatus("success");
        setMessage("Your account has been reinstated!");
        toast.success("Welcome back! Your account has been reset.");

        // Redirect to home after 3 seconds
        setTimeout(() => {
          window.location.href = '/#/Home';
        }, 3000);

      } catch (error) {
        console.error('Ban appeal processing error:', error);
        setStatus("error");
        setMessage("Failed to process your appeal. Please contact support.");
        toast.error("Something went wrong. Please contact admin.");
      }
    };

    processAppeal();
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center p-6">
      <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center max-w-md">
        {status === "processing" && (
          <>
            <Loader2 className="w-20 h-20 text-purple-500 animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Processing Payment</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Appeal Successful!</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm">
                ✅ Your account has been reset to level 0 with 0 coins
              </p>
            </div>
            <p className="text-sm text-gray-500">Redirecting you to home...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Appeal Failed</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/#/Messages'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Contact Support
              </Button>
              <Button
                onClick={() => window.location.href = '/#/BanAppeal'}
                variant="outline"
                className="w-full border-[#2a2a3a]"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}