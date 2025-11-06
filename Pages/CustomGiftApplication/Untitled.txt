
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Upload, DollarSign, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomGiftApplicationPage() {
  const queryClient = useQueryClient();
  const [giftName, setGiftName] = useState("");
  const [giftEmoji, setGiftEmoji] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const [effectType, setEffectType] = useState("sparkle");
  const [color, setColor] = useState("#FF1493");
  const [giftImage, setGiftImage] = useState(null);
  const [giftImagePreview, setGiftImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ['myCustomGiftApplications', user?.id],
    queryFn: () => base44.entities.CustomGiftApplication.filter({ user_id: user.id }, "-created_date"),
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: myCustomGifts = [] } = useQuery({
    queryKey: ['myCustomGifts', user?.id],
    queryFn: () => base44.entities.CustomGift.filter({ creator_id: user.id }, "-created_date"),
    enabled: !!user?.id,
    initialData: [],
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!giftName.trim() || !giftEmoji.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // Check if user has enough purchased coins, or if they are an admin
      const purchasedCoins = user.purchased_coins || 0;
      if (purchasedCoins < 10000 && user.role !== 'admin') {
        throw new Error(`Not enough Troll Coins! You need 10,000 but only have ${purchasedCoins.toLocaleString()}`);
      }

      // Upload image if provided
      let imageUrl = "";
      if (giftImage) {
        setIsUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: giftImage });
          imageUrl = file_url;
        } catch (error) {
          throw new Error("Failed to upload gift image");
        } finally {
          setIsUploading(false);
        }
      }

      // Deduct 10k troll coins only if not admin
      if (user.role !== 'admin') {
        await base44.auth.updateMe({
          coins: (user.coins || 0) - 10000,
          purchased_coins: purchasedCoins - 10000
        });

        // Create transaction record
        await base44.entities.Transaction.create({
          user_id: user.id,
          user_name: user.full_name,
          transaction_type: "gift",
          amount_coins: 10000,
          direction: "outgoing",
          description: `Custom gift application fee: ${giftName}`,
          status: "completed"
        });
      }


      // Create application
      await base44.entities.CustomGiftApplication.create({
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        gift_name: giftName.trim(),
        gift_emoji: giftEmoji.trim(),
        gift_image_url: imageUrl,
        gift_description: giftDescription.trim(),
        effect_type: effectType,
        color: color,
        application_fee_paid: user.role === 'admin' ? 0 : 10000, // Admin pays no fee
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myCustomGiftApplications']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Application submitted! You'll be notified when it's reviewed.");
      
      // Reset form
      setGiftName("");
      setGiftEmoji("");
      setGiftDescription("");
      setEffectType("sparkle");
      setColor("#FF1493");
      setGiftImage(null);
      setGiftImagePreview("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGiftImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setGiftImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const purchasedCoins = user.purchased_coins || 0;
  const canAffordApplication = purchasedCoins >= 10000 || user.role === 'admin'; // Admin can always access

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Your Custom Gift
          </h1>
          
          <p className="text-gray-300 text-lg mb-4">
            Design a unique gift and earn 100 coins every time it's sent!
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500 text-lg px-6 py-2">
              <DollarSign className="w-5 h-5 mr-2" />
              Application Fee: {user.role === 'admin' ? 'Free (Admin)' : '10,000 Troll Coins'}
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500 text-lg px-6 py-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Earn 100 coins per send
            </Badge>
          </div>

          {user.role !== 'admin' && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-purple-300 text-sm">
                💰 Your Troll Coins: <span className="font-bold text-yellow-400">{purchasedCoins.toLocaleString()}</span>
                {!canAffordApplication && (
                  <span className="text-red-400 ml-2">(Need {(10000 - purchasedCoins).toLocaleString()} more)</span>
                )}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Application Form</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Gift Name *</Label>
                  <Input
                    value={giftName}
                    onChange={(e) => setGiftName(e.target.value)}
                    placeholder="e.g., Golden Dragon"
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">{giftName.length}/30</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Gift Emoji *</Label>
                  <Input
                    value={giftEmoji}
                    onChange={(e) => setGiftEmoji(e.target.value)}
                    placeholder="🐉"
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white text-3xl"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">Single emoji or up to 5 characters</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Description</Label>
                  <Textarea
                    value={giftDescription}
                    onChange={(e) => setGiftDescription(e.target.value)}
                    placeholder="Describe your gift..."
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{giftDescription.length}/200</p>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Effect Type</Label>
                  <Select value={effectType} onValueChange={setEffectType}>
                    <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-[#2a2a3a]">
                      <SelectItem value="sparkle" className="text-white">✨ Sparkle</SelectItem>
                      <SelectItem value="fire" className="text-white">🔥 Fire</SelectItem>
                      <SelectItem value="confetti" className="text-white">🎉 Confetti</SelectItem>
                      <SelectItem value="hearts" className="text-white">❤️ Hearts</SelectItem>
                      <SelectItem value="explosion" className="text-white">💥 Explosion</SelectItem>
                      <SelectItem value="rainbow" className="text-white">🌈 Rainbow</SelectItem>
                      <SelectItem value="stars" className="text-white">⭐ Stars</SelectItem>
                      <SelectItem value="lightning" className="text-white">⚡ Lightning</SelectItem>
                      <SelectItem value="snow" className="text-white">❄️ Snow</SelectItem>
                      <SelectItem value="bubbles" className="text-white">🫧 Bubbles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Color Theme</Label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2a2a3a] h-12"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Custom Image (Optional)</Label>
                  {giftImagePreview && (
                    <div className="mb-3">
                      <img src={giftImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a custom image for your gift</p>
                </div>

                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={!canAffordApplication || !giftName.trim() || !giftEmoji.trim() || applyMutation.isPending || isUploading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-6 text-lg"
                >
                  {applyMutation.isPending || isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3" />
                      {isUploading ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-3" />
                      Submit Application ({user.role === 'admin' ? 'Free' : '10,000 coins'})
                    </>
                  )}
                </Button>

                {!canAffordApplication && user.role !== 'admin' && (
                  <p className="text-red-400 text-sm text-center">
                    ⚠️ You need {(10000 - purchasedCoins).toLocaleString()} more Troll Coins to apply
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
                  <div>
                    <p className="text-white font-bold">Pay Application Fee</p>
                    <p className="text-gray-300 text-sm">{user.role === 'admin' ? 'No fee (Admin)' : '10,000 Troll Coins (purchased coins only)'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
                  <div>
                    <p className="text-white font-bold">Submit Your Design</p>
                    <p className="text-gray-300 text-sm">Name, emoji, effect, and optional custom image</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
                  <div>
                    <p className="text-white font-bold">Admin Reviews</p>
                    <p className="text-gray-300 text-sm">We'll review and approve quality gifts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
                  <div>
                    <p className="text-white font-bold">Start Earning!</p>
                    <p className="text-gray-300 text-sm">Earn 100 coins every time someone sends your gift (2,000 coins each)</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
              <h3 className="text-xl font-bold text-white mb-4">Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Must be original or properly licensed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>No offensive, hateful, or inappropriate content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>No copyright violations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>High quality images (if uploading custom image)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Application fee is non-refundable</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* My Applications */}
        {myApplications.length > 0 && (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">My Applications</h2>
            <div className="space-y-3">
              {myApplications.map((app) => (
                <Card key={app.id} className={`bg-[#0a0a0f] p-4 ${
                  app.status === 'pending' ? 'border-yellow-500/50' :
                  app.status === 'approved' ? 'border-green-500/50' :
                  'border-red-500/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{app.gift_emoji}</div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{app.gift_name}</h3>
                        <p className="text-gray-400 text-sm">{app.gift_description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Applied: {new Date(app.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' :
                        app.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500' :
                        'bg-red-500/20 text-red-300 border-red-500'
                      }>
                        {app.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {app.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {app.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {app.status.toUpperCase()}
                      </Badge>
                      {app.status === 'approved' && (
                        <p className="text-green-400 text-sm font-bold">
                          Earned: {app.total_earnings?.toLocaleString() || 0} coins
                        </p>
                      )}
                    </div>
                  </div>
                  {app.rejection_reason && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 text-sm">
                        <strong>Rejection Reason:</strong> {app.rejection_reason}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* My Approved Gifts */}
        {myCustomGifts.length > 0 && (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
            <h2 className="text-2xl font-bold text-white mb-4">My Active Gifts</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {myCustomGifts.map((gift) => (
                <Card key={gift.id} className="bg-[#0a0a0f] border-green-500/50 p-4 text-center">
                  <div className="text-6xl mb-3">{gift.emoji}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{gift.gift_name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Times Sent:</span>
                      <span className="text-purple-400 font-bold">{gift.total_times_sent || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Earned:</span>
                      <span className="text-green-400 font-bold">{gift.total_earnings?.toLocaleString() || 0} coins</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
