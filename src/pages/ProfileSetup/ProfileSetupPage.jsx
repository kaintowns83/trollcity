
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, User, AtSign, MessageSquare, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Added useNavigate

export default function ProfileSetupPage() {
  const navigate = useNavigate(); // Initialized useNavigate
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentUsername, setPaymentUsername] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankRouting, setBankRouting] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      console.log("🔗 Referral code detected:", refCode);
      // Store in sessionStorage to use after profile completion
      sessionStorage.setItem('referral_code', refCode);
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const completeProfileMutation = useMutation({
    mutationFn: async () => {
      // Validate username before proceeding with mutation
      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }

      let avatarUrl = user?.avatar || "";

      if (avatar) {
        setIsUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: avatar });
        avatarUrl = file_url;
        setIsUploading(false);
      }

      // Generate a unique referral code for this user
      const referralCode = `${username.toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const updates = {
        username: username.trim(), // Username is validated and lowercased by input already
        display_name: displayName.trim() || user.full_name,
        bio: bio.trim() || "",
        avatar: avatarUrl,
        payment_method: paymentMethod, // Storing selected payment method
        profile_completed: true,
        referral_code: referralCode, // Add the generated referral code
      };

      // Add payment details based on method
      if (paymentMethod === "paypal") {
        updates.payment_email = paymentEmail;
      } else if (paymentMethod === "cashapp" || paymentMethod === "venmo") {
        // Auto-add $ for CashApp if not present
        let formattedUsername = paymentUsername.trim();
        if (paymentMethod === "cashapp" && !formattedUsername.startsWith("$")) {
          formattedUsername = "$" + formattedUsername;
        }
        updates.payment_username = formattedUsername;
      } else if (paymentMethod === "bank_transfer") {
        updates.bank_account_number = bankAccount;
        updates.bank_routing_number = bankRouting;
      }

      // Update the current user's profile
      await base44.auth.updateMe(updates);

      // Process referral if a code was detected in the URL
      const refCode = sessionStorage.getItem('referral_code');
      if (refCode) {
        console.log("✅ Processing referral with code:", refCode);
        
        // Find the referrer by their referral code
        const referrers = await base44.entities.User.filter({ referral_code: refCode });
        
        if (referrers.length > 0) {
          const referrer = referrers[0];
          console.log("✅ Found referrer:", referrer.username || referrer.full_name);
          
          // Create referral record
          await base44.entities.Referral.create({
            referrer_id: referrer.id,
            referrer_name: referrer.full_name,
            referrer_username: referrer.username || referrer.full_name,
            referred_id: user.id, // ID of the user whose profile is being set up
            referred_name: user.full_name,
            referred_username: username, // The username just set for the current user
            referral_code: refCode,
            status: "pending",
            reward_given: false,
            referred_user_level: 1,
          });

          // Update the new user (current user) with who referred them
          await base44.auth.updateMe({
            referred_by_code: refCode
          });

          console.log("✅ Referral record created");
          toast.success(`Welcome! You were referred by ${referrer.username || referrer.full_name}`);
        } else {
          console.log("⚠️ Referrer not found for code:", refCode);
        }
        
        // Clean up the referral code from session storage
        sessionStorage.removeItem('referral_code');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Profile setup complete! Welcome to TrollCity! 🎉");
      setTimeout(() => {
        navigate('/'); // Use navigate for redirection
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ Profile setup error:", error); // Added console error
      toast.error(error.message || "Failed to complete setup");
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!username) { // Username is now required
        toast.error("Username is required");
        return;
      }
      if (username.length < 3) {
        toast.error("Username must be at least 3 characters");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      if (paymentMethod === "paypal" && !paymentEmail.includes("@")) {
        toast.error("Please enter a valid PayPal email");
        return;
      }

      if ((paymentMethod === "cashapp" || paymentMethod === "venmo") && !paymentUsername.trim()) {
        toast.error(`Please enter your ${paymentMethod === "cashapp" ? "Cash App Tag" : "Venmo Username"}`);
        return;
      }

      if (paymentMethod === "bank_transfer" && (!bankAccount.trim() || !bankRouting.trim())) {
        toast.error("Please enter both bank account and routing numbers");
        return;
      }

      completeProfileMutation.mutate();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 flex items-center justify-center">
      <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="text-purple-400">Troll</span><span className="text-pink-400">City</span>! 🎉
          </h1>
          <p className="text-gray-400">Let's set up your profile</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-500' : 'bg-gray-700'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-semibold">Profile</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-700" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-500' : 'bg-gray-700'}`}>
                2
              </div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Profile Info */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                {avatarPreview || user.avatar ? (
                  <img
                    src={avatarPreview || user.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-purple-500">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Username *
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="coolstreamer123"
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers and underscores only</p>
            </div>

            {/* Display Name */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Display Name (optional)
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.full_name}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                maxLength={50}
              />
            </div>

            {/* Bio */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Bio (optional)
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
            >
              Next: Payment Setup
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-semibold mb-1">💰 Why add payment info now?</p>
                  <p className="text-blue-200 text-sm">
                    To cash out your earnings later, you'll need to reach Level 20 and have $125 (20,000 coins) in earned coins. 
                    Adding your payment method now saves time when you're ready to cash out!
                  </p>
                </div>
              </div>
 