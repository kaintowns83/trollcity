
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function TipButton({ streamerId, streamerName, streamId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("coins");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const sendTipMutation = useMutation({
    mutationFn: async () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (paymentMethod === 'coins') {
        const coinAmount = Math.floor(numAmount * 100); // $1 = 100 coins (same rate as purchase)
        if ((user.coins || 0) < coinAmount) {
          throw new Error("Not enough coins!");
        }
        
        // Use purchased coins first, then free coins
        let purchasedCoinsToUse = Math.min(user.purchased_coins || 0, coinAmount);
        let freeCoinsToUse = coinAmount - purchasedCoinsToUse;

        // Ensure freeCoinsToUse doesn't exceed available free coins
        freeCoinsToUse = Math.min(user.free_coins || 0, freeCoinsToUse);
        
        // In case there aren't enough free coins for the remainder, adjust purchased coins
        // This scenario should ideally not happen if (user.coins || 0) < coinAmount check passes
        // but as a safety measure for precise accounting.
        // However, the current logic for purchasedCoinsToUse and freeCoinsToUse is based on
        // ensuring the *total* coinAmount is covered.
        // The previous simple subtraction for `purchased_coins` and `free_coins` in updateMe
        // relies on these being the exact amounts to reduce.

        await base44.auth.updateMe({
          coins: (user.coins || 0) - coinAmount,
          purchased_coins: (user.purchased_coins || 0) - purchasedCoinsToUse,
          free_coins: (user.free_coins || 0) - freeCoinsToUse
        });

        // Add earned coins to streamer
        const streamerUsers = await base44.entities.User.filter({ id: streamerId });
        if (streamerUsers.length > 0) {
          const streamerUser = streamerUsers[0];
          await base44.entities.User.update(streamerId, {
            coins: (streamerUser.coins || 0) + coinAmount,
            earned_coins: (streamerUser.earned_coins || 0) + coinAmount
          });
        }

        const tip = await base44.entities.Tip.create({
          tipper_id: user.id,
          tipper_name: isAnonymous ? "Anonymous" : (user.username || user.full_name),
          streamer_id: streamerId,
          streamer_name: streamerName,
          amount_usd: numAmount,
          amount_coins: coinAmount,
          payment_method: 'coins',
          message: message.trim(),
          is_anonymous: isAnonymous,
          stream_id: streamId,
          status: "completed"
        });

        await base44.entities.Transaction.create({
          user_id: user.id,
          user_name: user.username || user.full_name,
          transaction_type: "tip",
          amount_usd: numAmount,
          amount_coins: coinAmount,
          direction: "outgoing",
          related_user_id: streamerId,
          related_user_name: streamerName,
          payment_method: 'coins',
          reference_id: tip.id,
          description: `Tipped ${streamerName} ${isAnonymous ? '(Anonymous)' : ''}`,
          status: "completed"
        });

        return tip;
      } else {
        throw new Error("PayPal tips coming soon!");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['tipsReceived']);
      queryClient.invalidateQueries(['tipsSent']);
      toast.success(`Tip sent! ${isAnonymous ? '(Anonymous)' : ''} 💝`);
      setShowDialog(false);
      setAmount("");
      setMessage("");
      setIsAnonymous(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send tip");
    },
  });

  if (!user || user.id === streamerId) return null;

  const quickAmounts = [1, 5, 10, 20, 50];

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-pink-500 text-pink-400 hover:bg-pink-500/10 gap-2"
        >
          <Gift className="w-4 h-4" />
          Send Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
        <DialogHeader>
          <DialogTitle className="2xl flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            Send a Tip to {streamerName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Show your support with a direct donation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Method */}
          <div>
            <Label className="text-white mb-3 block">Payment Method</Label>
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="bg-[#0a0a0f] border border-[#2a2a3a] w-full">
                <TabsTrigger value="coins" className="flex-1 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                  Coins
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white" disabled>
                  PayPal (Soon)
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-gray-500 mt-2">
              {paymentMethod === 'coins' ? '100 coins = $1.00 (same as buying!)' : 'Direct PayPal payments'}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-white mb-3 block">Quick Amount</Label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  onClick={() => setAmount(amt.toString())}
                  className={`border-[#2a2a3a] ${amount === amt.toString() ? 'bg-purple-500/20 border-purple-500' : ''}`}
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount" className="text-white mb-2 block">
              Amount (USD)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
            />
            {amount && (
              <p className="text-sm text-gray-400 mt-1">
                = {Math.floor(parseFloat(amount || 0) * 100)} coins
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-white mb-2 block">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Say something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-[#0a0a0f] border-[#2a2a3a] text-white h-20"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/200
            </p>
          </div>

          {/* Anonymous */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              className="border-[#2a2a3a]"
            />
            <label
              htmlFor="anonymous"
              className="text-sm text-gray-300 cursor-pointer"
            >
              Send as anonymous
            </label>
          </div>

          {/* Summary */}
          {amount && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Tip Amount:</span>
                <span className="text-white font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">In Coins:</span>
                <span className="text-yellow-400 font-semibold">
                  {Math.floor(parseFloat(amount) * 100)} coins (100 per $1)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Balance:</span>
                <span className="text-white">{user?.coins || 0} coins</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => sendTipMutation.mutate()}
            disabled={!amount || sendTipMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 font-bold py-6"
          >
            {sendTipMutation.isPending ? "Sending..." : `Send $${parseFloat(amount || 0).toFixed(2)} Tip`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
