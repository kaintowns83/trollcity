import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Coins } from "lucide-react";
import { toast } from "sonner";

export default function SquareReturnPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing your payment...");
  
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const amount = parseFloat(urlParams.get('amount') || '0');
  const coins = parseInt(urlParams.get('coins') || '0');

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('💳 Processing Square payment...');
        console.log('User ID:', userId, 'Amount:', amount, 'Coins:', coins);

        if (!userId || !amount || !coins) {
          throw new Error("Missing payment information");
        }

        // Get current user
        const user = await base44.auth.me();
        
        if (user.id !== userId) {
          throw new Error("User mismatch");
        }

        console.log('✅ User verified, adding coins...');

        // Add coins to user
        await base44.auth.updateMe({
          coins: (user.coins || 0) + coins,
          purchased_coins: (user.purchased_coins || 0) + coins,
        });

        // Log transaction
        await base44.entities.Transaction.create({
          user_id: user.id,
          user_name: user.username || user.full_name,
          transaction_type: "coin_purchase",
          amount_usd: amount,
          amount_coins: coins,
          direction: "incoming",
          payment_method: "square",
          description: `Purchased ${coins} coins via Square`,
          status: "completed"
        });

        console.log('✅ Payment completed!');
        setStatus("success");
        setMessage(`Successfully added ${coins.toLocaleString()} coins to your account!`);
        toast.success(`${coins.toLocaleString()} coins added! 🎉`);

        // Redirect to store after 3 seconds
        setTimeout(() => {
          navigate("/Store");
        }, 3000);

      } catch (error) {
        console.error('❌ Payment processing error:', error);
        setStatus("error");
        setMessage(error.message || "Payment processing failed");
        toast.error("Payment failed");
      }
    };

    processPayment();
  }, [userId, amount, coins, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 md:p-12 text-center max-w-md w-full">
        {status === "processing" && (
          <>
            <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
            <p className="text-gray-400 mb-6">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">
                  +{coins.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Coins added to your balance</p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to store in 3 seconds...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button
              onClick={() => navigate("/Store")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Return to Store
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}