
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, X, CheckCircle } from "lucide-react"; // Added CheckCircle
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GiftBox({ open, onClose, stream, streamId, streamerId, streamerName, user, gifts, onGiftSent }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const queryClient = useQueryClient();

  // Don't allow user to send gifts to themselves
  if (user?.id === streamerId) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Send Gift
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-400 text-lg mb-2">⚠️ You cannot send gifts to yourself</p>
            <p className="text-gray-400">You can only send gifts to other streamers</p>
            <Button
              onClick={onClose}
              className="mt-6 bg-purple-600 hover:bg-purple-700"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const sendGiftMutation = useMutation({
    mutationFn: async (gift) => {
      if (!user) throw new Error("Must be logged in");
      if (!gift) throw new Error("No gift selected");

      // Check if user has enough coins
      if ((user.coins || 0) < gift.coin_value) {
        throw new Error(`Not enough coins! You need ${gift.coin_value} coins.`);
      }

      // Determine coin type used - prioritize purchased coins
      const purchasedCoinsAvailable = user.purchased_coins || 0;
      const freeCoinsAvailable = user.free_coins || 0;
      
      // `isPurchasedCoins` here means if the *entire* gift value was covered by purchased coins.
      const isPurchasedCoins = purchasedCoinsAvailable >= gift.coin_value;
      const purchasedCoinsUsed = Math.min(purchasedCoinsAvailable, gift.coin_value);
      const freeCoinsUsed = gift.coin_value - purchasedCoinsUsed;

      console.log("💝 Gift Payment:", {
        giftCost: gift.coin_value,
        purchasedCoinsUsed,
        freeCoinsUsed,
        isPurchasedCoins
      });

      // Deduct coins from sender
      const newBalance = (user.coins || 0) - gift.coin_value;
      await base44.auth.updateMe({
        coins: newBalance,
        purchased_coins: purchasedCoinsAvailable - purchasedCoinsUsed,
        free_coins: freeCoinsAvailable - freeCoinsUsed
      });
      console.log("✅ Deducted coins from sender. New balance:", newBalance);

      // Add coins to streamer - only add to earned_coins if purchased coins were used for the whole gift
      const streamerUsers = await base44.entities.User.filter({ id: streamerId });
      const streamer = streamerUsers[0];
      
      if (streamer) {
        const updatedStreamer = {
          coins: (streamer.coins || 0) + gift.coin_value,
          earned_coins: isPurchasedCoins 
            ? (streamer.earned_coins || 0) + gift.coin_value
            : (streamer.earned_coins || 0),
          total_gifts_received: (streamer.total_gifts_received || 0) + gift.coin_value,
          experience: (streamer.experience || 0) + (gift.coin_value * 10)
        };
        
        await base44.entities.User.update(streamerId, updatedStreamer);
        console.log("✅ Added coins to streamer:", updatedStreamer);
      } else {
        console.error("❌ Streamer not found!");
      }

      // Update stream total
      const newStreamTotal = (stream.total_gifts || 0) + gift.coin_value;
      await base44.entities.Stream.update(streamId, {
        total_gifts: newStreamTotal
      });
      console.log("✅ Updated stream total gifts:", newStreamTotal);

      // Create gift record
      await base44.entities.StreamGift.create({
        stream_id: streamId,
        gift_id: gift.id,
        sender_id: user.id,
        sender_name: user.full_name,
        gift_name: gift.name,
        gift_emoji: gift.emoji,
        coin_value: gift.coin_value
      });
      console.log("✅ Created StreamGift record");

      // Update or create leaderboard entry
      const leaderboardEntries = await base44.entities.StreamerLeaderboard.filter({
        streamer_id: streamerId,
        gifter_id: user.id
      });

      if (leaderboardEntries.length > 0) {
        const entry = leaderboardEntries[0];
        await base44.entities.StreamerLeaderboard.update(entry.id, {
          total_coins_gifted: (entry.total_coins_gifted || 0) + gift.coin_value,
          total_gifts_sent: (entry.total_gifts_sent || 0) + 1,
          last_gift_date: new Date().toISOString()
        });
        console.log("✅ Updated leaderboard entry");
      } else {
        await base44.entities.StreamerLeaderboard.create({
          streamer_id: streamerId,
          streamer_name: streamerName,
          gifter_id: user.id,
          gifter_name: user.full_name,
          gifter_username: user.username || user.full_name,
          gifter_avatar: user.avatar,
          total_coins_gifted: gift.coin_value,
          total_gifts_sent: 1,
          last_gift_date: new Date().toISOString()
        });
        console.log("✅ Created new leaderboard entry");
      }

      // Send chat message about the gift
      await base44.entities.ChatMessage.create({
        stream_id: streamId,
        user_id: user.id,
        username: user.username || user.full_name,
        message: `sent ${gift.emoji} ${gift.name} (${gift.coin_value} coins${isPurchasedCoins ? ' ✓' : ''})!`,
        user_avatar: user.avatar,
        user_level: user.level || 1
      });
      console.log("✅ Sent gift announcement to chat");

      return { gift, isPurchasedCoins };
    },
    onSuccess: ({ gift, isPurchasedCoins }) => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['stream']);
      queryClient.invalidateQueries(['profileUser']);
      queryClient.invalidateQueries(['chatMessages']);
      
      toast.success(
        `🎁 Sent ${gift.emoji} ${gift.name}!` + 
        (isPurchasedCoins ? ' ✅ Real Value' : ' (Free coins)')
      );
      
      onGiftSent(gift);
      setSelectedGift(null);
      onClose(); // Auto close the dialog after successful gift send
    },
    onError: (error) => {
      console.error("❌ Gift sending error:", error);
      toast.error(error.message || "Failed to send gift");
    }
  });

  const handleSendGift = () => {
    if (!selectedGift) {
      toast.error("Please select a gift");
      return;
    }
    sendGiftMutation.mutate(selectedGift);
  };

  if (!gifts || gifts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Send Gift
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-gray-400">No gifts available at the moment</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Send Gift to {streamerName}
          </DialogTitle>
        </DialogHeader>

        {user && (
          <div className="bg-[#0a0a0f] p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Balance:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-xl">
                  {user.coins?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mt-3 pt-3 border-t border-[#2a2a3a]">
              <div>
                <p className="text-gray-500 mb-1">Purchased (Real Value)</p>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold">{user.purchased_coins || 0}</span>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Free (No Value)</p>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 font-bold">{user.free_coins || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 mt-3">
              <p className="text-purple-300 text-xs">
                💡 Purchased coins are used first. Streamers earn real value from purchased coin gifts ✓
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {gifts.map((gift) => (
            <motion.button
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedGift?.id === gift.id
                  ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50'
                  : 'border-[#2a2a3a] hover:border-yellow-400/50'
              }`}
            >
              <div className="text-5xl mb-3">{gift.emoji}</div>
              <p className="text-white font-bold mb-1">{gift.name}</p>
              <div className="flex items-center justify-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{gift.coin_value}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#2a2a3a]">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[#2a2a3a]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendGift}
            disabled={!selectedGift || sendGiftMutation.isPending || !user}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            {sendGiftMutation.isPending ? (
              "Sending..."
            ) : selectedGift ? (
              <>
                Send {selectedGift.emoji} ({selectedGift.coin_value} <Coins className="w-4 h-4 inline" />)
              </>
            ) : (
              "Select a Gift"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
