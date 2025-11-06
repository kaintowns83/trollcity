
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea }
 from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Users,
  DollarSign,
  Coins,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Ban,
  Flag,
  MessageSquare,
  Eye,
  Trash,
  Trash2,
  Plus,
  UserX,
  Mail,
  Copy,
  RotateCcw,
  Clock,
  Radio, // Added
  Gift, // Added
  Heart, // Added
  StopCircle, // Added
  MoreVertical, // Added
  X, // Added for new coin types
  Trophy, // Added for new button
  MoveUp, // Added for levels
  MoveDown, // Added for levels
  Minus, // Added for subtract coins
  RefreshCcw, // Added for convert coins
  Bell // New icon for update notification
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { format } from "date-fns";
import UserLink from "../components/UserLink";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [showAddCoinsDialog, setShowAddCoinsDialog] = useState(false);
  const [showSubtractCoinsDialog, setShowSubtractCoinsDialog] = useState(false);
  const [showConvertCoinsDialog, setShowConvertCoinsDialog] = useState(false);
  const [showAddLevelsDialog, setShowAddLevelsDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinsToAdd, setCoinsToAdd] = useState("");
  const [coinsToSubtract, setCoinsToSubtract] = useState("");
  const [coinsToConvert, setCoinsToConvert] = useState("");
  const [levelsToAdd, setLevelsToAdd] = useState("");
  const [coinType, setCoinType] = useState("free");
  const [banReason, setBanReason] = useState("");
  const [generatingIds, setGeneratingIds] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showDeletedAccounts, setShowDeletedAccounts] = useState(false);
  const [showManualPayoutDialog, setShowManualPayoutDialog] = useState(false);
  const [manualPayoutUser, setManualPayoutUser] = useState(null);
  const [manualPayoutAmount, setManualPayoutAmount] = useState("");
  const [manualPayoutMethod, setManualPayoutMethod] = useState("paypal");
  const [manualPayoutDetails, setManualPayoutDetails] = useState("");
  const [showEndStreamDialog, setShowEndStreamDialog] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [endStreamReason, setEndStreamReason] = useState("");
  const [showSendUpdateDialog, setShowSendUpdateDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");


  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: flags = [] } = useQuery({
    queryKey: ['chatFlags'],
    queryFn: () => base44.entities.ChatFlag.filter({}, "-created_date"),
    initialData: [],
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.filter({}, "-created_date", 1000), // Updated queryFn and limit
    initialData: [],
    enabled: user?.role === 'admin' || user?.is_troll_officer, // Broader access for Troll Officers
  });

  const { data: coinRequests = [] } = useQuery({
    queryKey: ['coinRequests'],
    queryFn: () => base44.entities.CoinRequest.filter({}, "-created_date"),
    initialData: [],
    enabled: !!user && user.role === 'admin',
  });

  const { data: pendingPayouts = [] } = useQuery({
    queryKey: ['pendingPayouts'],
    queryFn: () => base44.entities.Payout.filter({ status: "pending" }, "-created_date"),
    initialData: [],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
  });

  const { data: allPayouts = [] } = useQuery({
    queryKey: ['allPayouts'],
    queryFn: () => base44.entities.Payout.list("-created_date", 100),
    initialData: [],
    enabled: !!user && user.role === 'admin',
  });

  const { data: allStreams = [] } = useQuery({
    queryKey: ['allStreams'],
    queryFn: () => base44.entities.Stream.filter({ status: "live" }, "-created_date"),
    initialData: [],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
  });

  const { data: trollOfficerApps = [] } = useQuery({
    queryKey: ['trollOfficerApplications'],
    queryFn: () => base44.entities.TrollOfficerApplication.filter({}, "-created_date"),
    initialData: [],
    enabled: user?.role === 'admin' || user?.is_troll_officer,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['myTrollOfficerVotes', user?.id],
    queryFn: () => base44.entities.TrollOfficerVote.filter({ voter_id: user.id }),
    initialData: [],
    enabled: !!(user?.role === 'admin' || user?.is_troll_officer),
  });

  const { data: allVotes = [] } = useQuery({
    queryKey: ['allTrollOfficerVotes'],
    queryFn: () => base44.entities.TrollOfficerVote.list("-created_date", 1000),
    initialData: [],
    enabled: !!(user?.role === 'admin' || user?.is_troll_officer),
  });

  const { data: allOfficers = [] } = useQuery({
    queryKey: ['allTrollOfficers'],
    queryFn: () => base44.entities.User.filter({ is_troll_officer: true }),
    initialData: [],
    enabled: !!(user?.role === 'admin' || user?.is_troll_officer),
  });

  const isAdmin = user?.role === 'admin';
  const isTrollOfficer = user?.is_troll_officer;
  const isLimitedAdmin = user?.role === 'admin' && user?.admin_level === 'limited';
  const isFullAdmin = user?.role === 'admin' && (!user?.admin_level || user?.admin_level === 'full');
  const canEndStreams = isFullAdmin || (isTrollOfficer && (user?.level || 0) >= 80);
  const canManageCoins = isFullAdmin; // Only full admins can manage coins
  const canSeeSensitiveData = isFullAdmin; // Only full admins can see IPs and emails

  useEffect(() => {
    // This effect should only run for admins to generate IDs
    if (!isAdmin || !allUsers.length || generatingIds) return;

    // Filter to only consider users that *should* have an ID and don't yet, and are not deleted
    const usersWithoutId = allUsers.filter(u => !u.user_id && !u.account_deleted);

    if (usersWithoutId.length === 0) {
      // console.log("✅ All active users have IDs!"); // Commented to reduce noise
      return;
    }

    console.log(`🔄 Generating IDs for ${usersWithoutId.length} users...`);
    setGeneratingIds(true);

    let generated = 0;

    const generateUserIds = async () => {
      for (const usr of usersWithoutId) {
        const userId = `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        console.log(`📝 Generating ID for ${usr.email}: ${userId}`);

        try {
          await base44.entities.User.update(usr.id, { user_id: userId });
          generated++;
          console.log(`✅ [${generated}/${usersWithoutId.length}] Generated: ${userId}`);
        } catch (error) {
          console.error(`❌ Failed to generate ID for ${usr.email}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to prevent rate limits
      }

      console.log(`🎉 Generated ${generated} user IDs!`);
      queryClient.invalidateQueries(['allUsers']);
      setGeneratingIds(false);
      if (generated > 0) {
        toast.success(`Generated ${generated} user IDs!`);
      }
    };

    generateUserIds();
  }, [allUsers.length, isAdmin, generatingIds, queryClient]);

  const handleSearch = (query) => {
    setSearchUserId(query);

    if (query.trim().length > 0) {
      const results = allUsers.filter(u =>
        u.user_id?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.username?.toLowerCase().includes(query.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const copyUserId = (userId) => {
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied!");
  };

  const goToUserProfile = (userId) => {
    console.log('🔵 Admin navigating to profile:', userId);
    window.location.hash = `/Profile?userId=${userId}`;
  };

  const regenerateAllUserIds = async () => {
    if (!isAdmin) return;

    console.log("🔄 Manually regenerating all user IDs...");
    setGeneratingIds(true);

    try {
      // Fetch all users to ensure we get any newly created ones
      const users = await base44.entities.User.list("-created_date", 10000);
      const usersWithoutId = users.filter(u => !u.user_id && !u.account_deleted);

      console.log(`Found ${usersWithoutId.length} users without IDs to generate`);

      let generated = 0;

      for (const usr of usersWithoutId) {
        const userId = `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        try {
          await base44.entities.User.update(usr.id, { user_id: userId });
          generated++;
          console.log(`✅ [${generated}/${usersWithoutId.length}] ${userId} -> ${usr.email}`);
        } catch (error) {
          console.error(`❌ Failed for ${usr.email}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      queryClient.invalidateQueries(['allUsers']);
      toast.success(`Generated ${generated} user IDs!`);
    } catch (error) {
      console.error("❌ Failed to regenerate IDs:", error);
      toast.error("Failed to generate IDs");
    } finally {
      setGeneratingIds(false);
    }
  };

  const openAddCoinsDialog = (user) => {
    setSelectedUser(user);
    setCoinsToAdd("");
    setCoinType("free");
    setShowAddCoinsDialog(true);
  };

  const openBanDialog = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setShowBanDialog(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const openPermanentDeleteDialog = (user) => {
    setSelectedUser(user);
    setShowPermanentDeleteDialog(true);
  };

  const openManualPayoutDialog = () => {
    setManualPayoutUser(null);
    setManualPayoutAmount("");
    setManualPayoutMethod("paypal");
    setManualPayoutDetails("");
    setShowManualPayoutDialog(true);
  };

  const openEndStreamDialog = (stream) => {
    if (!canEndStreams) {
      toast.error("You need to be Level 80+ to end streams as a Troll Officer");
      return;
    }
    setSelectedStream(stream);
    setEndStreamReason("");
    setShowEndStreamDialog(true);
  };

  // New dialog openers
  const openAddLevelsDialog = (user) => {
    setSelectedUser(user);
    setLevelsToAdd("");
    setShowAddLevelsDialog(true);
  };

  const openSubtractCoinsDialog = (user) => {
    setSelectedUser(user);
    setCoinsToSubtract("");
    setCoinType("free"); // Default to free coins for subtraction
    setShowSubtractCoinsDialog(true);
  };

  const openConvertCoinsDialog = (user) => {
    setSelectedUser(user);
    setCoinsToConvert("");
    setShowConvertCoinsDialog(true);
  };

  const addCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount, type }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      const updates = {
        coins: (targetUser.coins || 0) + amount
      };

      if (type === "free") {
        updates.free_coins = (targetUser.free_coins || 0) + amount;
      } else if (type === "purchased") {
        updates.purchased_coins = (targetUser.purchased_coins || 0) + amount;
      } else if (type === "earned") {
        updates.earned_coins = (targetUser.earned_coins || 0) + amount;
      }

      await base44.asServiceRole.entities.User.update(userId, updates);

      await base44.entities.Transaction.create({
        user_id: userId,
        user_name: targetUser.full_name,
        transaction_type: "coin_purchase", // Can reuse this type for admin grants
        amount_coins: amount,
        direction: "incoming",
        payment_method: "admin_grant",
        description: `Admin ${user.full_name} added ${amount} ${type} coins`,
        status: "completed"
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "💰 Coins Added!",
        message: `Admin added ${amount.toLocaleString()} ${type} coins to your account!`,
        icon: "💎",
        link_url: "/#/Store"
      });
    },
    onSuccess: async () => {
      // Immediate refetch
      await queryClient.refetchQueries(['allUsers']);
      setShowAddCoinsDialog(false);
      setCoinsToAdd("");
      setSelectedUser(null);
      toast.success("✅ Coins added instantly!", { duration: 3000 });
    },
    onError: (error) => {
      toast.error("Failed to add coins: " + error.message);
    }
  });

  const subtractCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount, type }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      const updates = {
        coins: Math.max(0, (targetUser.coins || 0) - amount)
      };

      if (type === "free") {
        updates.free_coins = Math.max(0, (targetUser.free_coins || 0) - amount);
      } else if (type === "purchased") {
        updates.purchased_coins = Math.max(0, (targetUser.purchased_coins || 0) - amount);
      } else if (type === "earned") {
        updates.earned_coins = Math.max(0, (targetUser.earned_coins || 0) - amount);
      }

      await base44.asServiceRole.entities.User.update(userId, updates);

      await base44.entities.Transaction.create({
        user_id: userId,
        user_name: targetUser.full_name,
        transaction_type: "admin_action",
        amount_coins: amount,
        direction: "outgoing",
        payment_method: "admin_subtract",
        description: `Admin ${user.full_name} subtracted ${amount} ${type} coins`,
        status: "completed"
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "⚠️ Coins Adjusted",
        message: `Admin removed ${amount.toLocaleString()} ${type} coins from your account.`,
        icon: "⚙️",
        link_url: "/#/Profile"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowSubtractCoinsDialog(false);
      setCoinsToSubtract("");
      setSelectedUser(null);
      toast.success("✅ Coins subtracted and user notified!");
    },
    onError: (error) => {
      toast.error("Failed to subtract coins: " + error.message);
    }
  });

  const convertCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      // Logic for converting free coins to purchased coins
      const currentPurchased = targetUser.purchased_coins || 0;
      const currentFree = targetUser.free_coins || 0;

      if (amount > currentFree) {
        throw new Error("User doesn't have enough free coins to convert");
      }

      await base44.asServiceRole.entities.User.update(userId, {
        purchased_coins: currentPurchased + amount,
        free_coins: Math.max(0, currentFree - amount)
      });

      await base44.entities.Transaction.create({
        user_id: userId,
        user_name: targetUser.full_name,
        transaction_type: "coin_conversion_admin", // Custom type for admin conversion
        amount_coins: amount,
        direction: "incoming", // As purchased coins are added
        payment_method: "admin_convert",
        description: `Admin ${user.full_name} converted ${amount} free coins to purchased coins`,
        status: "completed"
      });

       // Send notification to user
       await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "💎 Coins Converted!",
        message: `Admin converted ${amount.toLocaleString()} free coins to Troll Coins! These now have real value.`,
        icon: "✨",
        link_url: "/#/Store"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowConvertCoinsDialog(false);
      setCoinsToConvert("");
      setSelectedUser(null);
      toast.success("✅ Coins converted and user notified!");
    },
    onError: (error) => {
      toast.error("Failed to convert coins: " + error.message);
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      await base44.asServiceRole.entities.User.update(userId, {
        is_banned: true,
        ban_reason: reason,
        ban_date: new Date().toISOString(),
        banned_by: user.full_name // Changed to user.full_name as per outline
      });

      await base44.asServiceRole.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: userId,
        target_username: targetUser.username || targetUser.full_name,
        action_type: "ban",
        reason: reason
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "🚫 Account Banned",
        message: `Your account has been banned. Reason: ${reason}`,
        icon: "⛔",
        link_url: "/#/BanAppeal"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowBanDialog(false);
      setBanReason("");
      setSelectedUser(null); // Added from outline
      toast.success("✅ User banned and notified!");
    },
    onError: (error) => {
      toast.error("Failed to ban user: " + error.message);
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");
      
      await base44.asServiceRole.entities.User.update(userId, {
        is_banned: false,
        ban_reason: null,
        ban_date: null,
        banned_by: null
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "✅ Account Unbanned",
        message: "Your account has been unbanned by admin. Welcome back to TrollCity!",
        icon: "🎉",
        link_url: "/#/Home"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success("✅ User unbanned and notified!");
    },
    onError: (error) => {
      toast.error("Failed to unban user: " + error.message);
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (userId) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      await base44.asServiceRole.entities.User.update(userId, {
        account_deleted: true,
        deleted_date: new Date().toISOString(),
        deleted_by: `admin_${user.full_name}`, // Using admin's full name
        email: `DELETED_${userId}@deleted.com`, // Keep anonymization
        full_name: "[DELETED USER]", // Keep anonymization
        username: null, // Keep anonymization
        avatar: null, // Keep anonymization
        bio: null, // Keep anonymization
        is_banned: true, // Also ban deleted accounts
        ban_reason: "Account permanently deleted by admin (soft-delete)" // Keep ban reason
      });

      await base44.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: userId,
        target_username: targetUser.username || targetUser.full_name,
        action_type: "soft_delete",
        reason: "Account soft-deleted by admin"
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "⚠️ Account Deleted",
        message: "Your account has been deleted by admin.",
        icon: "🗑️",
        link_url: "/#/Home"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowDeleteDialog(false);
      setSelectedUser(null); // Added from outline
      toast.success("✅ Account marked as deleted and user notified!");
    },
    onError: (error) => {
      toast.error("Failed to soft-delete account: " + error.message);
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (userId) => {
      // This completely removes the user record from the database
      // THIS IS A DANGEROUS OPERATION
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowPermanentDeleteDialog(false);
      setSelectedUser(null);
      toast.success("User permanently removed from database");
    },
    onError: (error) => {
      toast.error("Failed to permanently delete: " + error.message);
    }
  });

  const restoreAccountMutation = useMutation({
    mutationFn: async (userId) => {
      const targetUser = allUsers.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, {
        account_deleted: false,
        deleted_date: null,
        deleted_by: null,
        is_banned: false, // Unban on restore
        ban_reason: null,
        // Potentially restore email/full_name if stored elsewhere or prompt
        // For now, if it was [DELETED USER], change it to 'Restored User'
        full_name: targetUser.full_name === "[DELETED USER]" ? "Restored User" : targetUser.full_name,
        // Email needs to be restored carefully if anonymized. For now, if it starts with DELETED_, remove it.
        email: targetUser.email.startsWith("DELETED_") ? targetUser.email.replace(`DELETED_${userId}@deleted.com`, "") : targetUser.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success("Account restored");
    },
    onError: (error) => {
      toast.error("Failed to restore account: " + error.message);
    }
  });

  const approvePayoutMutation = useMutation({
    mutationFn: async (payoutId) => {
      await base44.entities.Payout.update(payoutId, {
        status: "completed",
        notes: `Approved by ${user.full_name}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayouts']);
      queryClient.invalidateQueries(['allPayouts']);
      toast.success("Payout approved!");
    },
    onError: (error) => {
      toast.error("Failed to approve payout: " + error.message);
    }
  });

  const rejectPayoutMutation = useMutation({
    mutationFn: async ({ payoutId, reason }) => {
      let payout = pendingPayouts.find(p => p.id === payoutId);
      if (!payout) { // If not found in pending, try to fetch it
        payout = await base44.entities.Payout.get(payoutId);
      }
      
      if (!payout) throw new Error("Payout not found");

      await base44.entities.Payout.update(payoutId, {
        status: "rejected",
        notes: reason || "Rejected by admin"
      });

      // Return coins to user
      const targetUser = allUsers.find(u => u.id === payout.user_id);
      if (targetUser) {
        await base44.entities.User.update(payout.user_id, {
          coins: (targetUser.coins || 0) + payout.coin_amount,
          earned_coins: (targetUser.earned_coins || 0) + payout.coin_amount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayouts']);
      queryClient.invalidateQueries(['allPayouts']);
      queryClient.invalidateQueries(['allUsers']);
      toast.success("Payout rejected and coins returned");
    },
    onError: (error) => {
      toast.error("Failed to reject payout: " + error.message);
    }
  });

  const createManualPayoutMutation = useMutation({
    mutationFn: async ({ userId, amount, method, details }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      const earnedCoins = targetUser.earned_coins || 0;
      if (earnedCoins < amount) {
        throw new Error("User doesn't have enough earned coins");
      }
      if (amount < 20000) {
        throw new Error("Minimum payout amount is 20,000 coins.");
      }

      // Calculate payout using tiered system
      let remaining = amount;
      let totalUSD = 0;
      
      if (remaining > 0) {
        const tier1Coins = Math.min(remaining, 20000); // First 20k coins
        totalUSD += tier1Coins / 160;
        remaining -= tier1Coins;
      }
      
      if (remaining > 0) {
        const tier2Coins = Math.min(remaining, 20000); // Next 20k coins
        totalUSD += tier2Coins / 200;
        remaining -= tier2Coins;
      }
      
      if (remaining > 0) {
        const tier3Coins = Math.min(remaining, 20000); // Next 20k coins
        totalUSD += tier3Coins / 250;
        remaining -= tier3Coins;
      }
      
      if (remaining > 0) {
        totalUSD += remaining / 300; // Remaining coins
      }

      // Create payout record
      await base44.entities.Payout.create({
        user_id: userId,
        user_name: targetUser.full_name,
        user_email: targetUser.email,
        coin_amount: amount,
        usd_amount: totalUSD,
        fee_amount: 0, // Assuming no fee for manual payout by admin
        payout_amount: totalUSD,
        payment_method: method,
        payment_details: details,
        status: "completed",
        notes: `Manual payout created by ${user.full_name}`
      });

      // Update user coins
      await base44.entities.User.update(userId, {
        coins: (targetUser.coins || 0) - amount,
        earned_coins: earnedCoins - amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPayouts']);
      queryClient.invalidateQueries(['allUsers']);
      setShowManualPayoutDialog(false);
      setManualPayoutAmount("");
      setManualPayoutDetails("");
      setManualPayoutUser(null);
      toast.success("Manual payout created!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payout");
    }
  });

  const sendTestPaymentsMutation = useMutation({
    mutationFn: async () => {
      const usersWithPayment = allUsers.filter(u => 
        u.payment_method && (u.payment_email || u.payment_username || u.bank_account_number)
      );

      let sent = 0;
      for (const u of usersWithPayment) {
        try {
          // Check if verification already exists
          const existing = await base44.entities.PaymentVerification.filter({
            user_id: u.id
          });

          if (existing.length > 0) {
            // Update existing
            await base44.entities.PaymentVerification.update(existing[0].id, {
              test_payment_sent: true,
              test_payment_date: new Date().toISOString(),
              notes: `Test payment sent by ${user.full_name}`
            });
          } else {
            // Create new
            await base44.entities.PaymentVerification.create({
              user_id: u.id,
              user_name: u.full_name,
              user_email: u.email,
              payment_method: u.payment_method,
              payment_details: u.payment_email || u.payment_username || (u.bank_account_number ? "Bank Account" : ""),
              test_payment_sent: true,
              test_payment_date: new Date().toISOString(),
              verified_by_user: false,
              verification_required: true,
              notes: `Test payment sent by ${user.full_name}`
            });
          }

          await base44.asServiceRole.entities.Notification.create({
            user_id: u.id,
            type: "achievement",
            title: "💳 Test Payment Sent",
            message: "We've sent a $0.00 test payment to verify your payment method. Please confirm you received it in your Profile → Payment tab.",
            icon: "✅",
            link_url: "/#/Profile?tab=payment"
          });

          sent++;
        } catch (error) {
          console.error(`Failed to send test to ${u.email}:`, error);
        }
      }

      return { sent, total: usersWithPayment.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['paymentVerifications']);
      toast.success(`Test payments sent to ${data.sent}/${data.total} users!`);
    }
  });

  const addLevelsMutation = useMutation({
    mutationFn: async ({ userId, levels }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      const newLevel = Math.max(1, Math.min(100, (targetUser.level || 1) + levels));

      await base44.entities.User.update(userId, {
        level: newLevel
      });

      await base44.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: userId,
        target_username: targetUser.username || targetUser.full_name,
        action_type: "level_change",
        reason: `Admin ${user.full_name} changed level from ${targetUser.level || 1} to ${newLevel} (${levels > 0 ? '+' : ''}${levels} levels)`,
        details: `Level change: ${levels > 0 ? 'added' : 'removed'} ${Math.abs(levels)} level(s)`
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: "⬆️ Level Update!",
        message: `Admin adjusted your level! Your new level is ${newLevel}.`,
        icon: "✨",
        link_url: "/#/Profile"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setShowAddLevelsDialog(false);
      setLevelsToAdd("");
      setSelectedUser(null);
      toast.success("User level updated!");
    },
    onError: (error) => {
      toast.error("Failed to update level: " + error.message);
    }
  });

  const endStreamMutation = useMutation({
    mutationFn: async ({ streamId, reason }) => {
      const stream = allStreams.find(s => s.id === streamId);
      if (!stream) throw new Error("Stream not found");
      
      await base44.entities.Stream.update(streamId, {
        status: "ended",
        viewer_count: 0
      });

      await base44.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: stream.streamer_id,
        target_username: stream.streamer_name,
        action_type: "stream_ended",
        reason: reason || "Stream ended by moderator",
        stream_id: streamId
      });

      // Send notification to streamer
      await base44.asServiceRole.entities.Notification.create({
        user_id: stream.streamer_id,
        type: "stream_ended",
        title: "⛔ Your Stream Was Ended",
        message: reason || "Your stream was ended by a moderator.",
        icon: "⚠️",
        link_url: "/#/Profile"
      });

      if (stream.ivs_stage_arn) {
        try {
          await base44.functions.invoke('manageIVS', {
            action: 'deleteStage',
            stream_id: streamId
          });
        } catch (error) {
          console.error("Failed to delete IVS stage:", error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allStreams']);
      setShowEndStreamDialog(false);
      setSelectedStream(null);
      setEndStreamReason("");
      toast.success("Stream ended and streamer notified");
    },
    onError: (error) => {
      toast.error("Failed to end stream: " + error.message);
    }
  });

  const reviewFlagMutation = useMutation({
    mutationFn: async ({ flagId, action, notes }) => {
      const flag = flags.find(f => f.id === flagId);

      await base44.entities.ChatFlag.update(flagId, {
        status: action === "dismiss" ? "dismissed" : "action_taken",
        reviewed_by: user.id,
        review_notes: notes,
        action_taken: action
      });

      if (action === "ban_user") {
        await base44.entities.User.update(flag.user_id, {
          is_banned: true,
          ban_reason: `Banned by ${user.username || user.full_name}: ${notes}`,
          ban_date: new Date().toISOString(),
          banned_by: user.id
        });

        await base44.entities.ModerationAction.create({
          moderator_id: user.id,
          moderator_name: user.username || user.full_name,
          target_user_id: flag.user_id,
          target_username: flag.username,
          action_type: "ban",
          reason: notes
        });
      } else if (action === "mute_24h") {
        await base44.entities.User.update(flag.user_id, {
          is_muted: true,
          muted_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

        await base44.entities.ModerationAction.create({
          moderator_id: user.id,
          moderator_name: user.username || user.full_name,
          target_user_id: flag.user_id,
          target_username: flag.username,
          action_type: "mute",
          duration_minutes: 1440,
          reason: notes
        });
      } else if (action === "delete_message") {
        await base44.entities.ChatMessage.update(flag.message_id, {
          is_deleted: true,
          deleted_by: user.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatFlags']);
      toast.success("Flag reviewed successfully");
      setSelectedFlag(null);
      setReviewNotes("");
    }
  });

  const toggleTrollOfficerMutation = useMutation({
    mutationFn: async ({ userId, makeOfficer }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      await base44.entities.User.update(userId, {
        is_troll_officer: makeOfficer
      });

      await base44.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: userId,
        target_username: targetUser.username || targetUser.full_name,
        action_type: makeOfficer ? "troll_officer_granted" : "troll_officer_removed",
        reason: makeOfficer 
          ? "Granted Troll Officer privileges by admin"
          : "Removed Troll Officer privileges by admin"
      });
    },
    onSuccess: (_, { makeOfficer }) => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['allTrollOfficers']);
      toast.success(makeOfficer ? "User promoted to Troll Officer!" : "Troll Officer status removed");
    },
    onError: (error) => {
      toast.error("Failed to update Troll Officer status: " + error.message);
    }
  });

  const toggleLimitedAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }) => {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) throw new Error("User not found");

      if (makeAdmin) {
        // Make them a limited admin
        await base44.asServiceRole.entities.User.update(userId, {
          role: 'admin',
          admin_level: 'limited'
        });
      } else {
        // Remove admin, keep as regular user
        await base44.asServiceRole.entities.User.update(userId, {
          role: 'user',
          admin_level: null
        });
      }

      await base44.entities.ModerationAction.create({
        moderator_id: user.id,
        moderator_name: user.full_name,
        target_user_id: userId,
        target_username: targetUser.username || targetUser.full_name,
        action_type: makeAdmin ? "limited_admin_granted" : "limited_admin_removed",
        reason: makeAdmin 
          ? "Granted Limited Admin privileges (moderation only, no sensitive data access)"
          : "Removed Limited Admin privileges"
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: "achievement",
        title: makeAdmin ? "👔 Limited Admin Access Granted" : "👔 Admin Access Removed",
        message: makeAdmin 
          ? "You've been granted Limited Admin access! You can moderate but cannot see IPs, emails, or manage coins/levels."
          : "Your admin access has been removed.",
        icon: makeAdmin ? "🛡️" : "⚠️",
        link_url: "/#/Admin"
      });
    },
    onSuccess: async (_, { makeAdmin }) => {
      // Immediate refetch of all user data
      await queryClient.refetchQueries(['allUsers']);
      toast.success(makeAdmin ? "✅ User is now Limited Admin!" : "✅ Admin status removed!", {
        duration: 3000
      });
    },
    onError: (error) => {
      toast.error("Failed to update admin status: " + error.message);
    }
  });

  const approveTrollOfficerMutation = useMutation({
    mutationFn: async (applicationId) => {
      const app = trollOfficerApps.find(a => a.id === applicationId);
      if (!app) throw new Error("Application not found");

      // Update application
      await base44.entities.TrollOfficerApplication.update(applicationId, {
        status: "approved",
        approved_by: user.full_name,
        approved_date: new Date().toISOString()
      });

      // Make user a troll officer
      await base44.entities.User.update(app.user_id, {
        is_troll_officer: true
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: app.user_id,
        type: "achievement",
        title: "🎉 Troll Officer Approved!",
        message: "Congratulations! You've been approved as a Troll Officer. You now have moderation powers and earn 2% monthly revenue share!",
        icon: "🛡️",
        link_url: "/#/Admin"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trollOfficerApplications']);
      queryClient.invalidateQueries(['allTrollOfficers']); // Invalidate this new query
      toast.success("Application approved!");
    },
    onError: (error) => {
      toast.error("Failed to approve: " + error.message);
    }
  });

  const rejectTrollOfficerMutation = useMutation({
    mutationFn: async ({ applicationId, reason }) => {
      const app = trollOfficerApps.find(a => a.id === applicationId);
      if (!app) throw new Error("Application not found");

      await base44.entities.TrollOfficerApplication.update(applicationId, {
        status: "rejected",
        approved_by: user.full_name,
        approved_date: new Date().toISOString(),
        rejection_reason: reason
      });

      await base44.asServiceRole.entities.Notification.create({
        user_id: app.user_id,
        type: "achievement",
        title: "Troll Officer Application Update",
        message: `Your application was reviewed. ${reason}`,
        icon: "📋",
        link_url: "/#/TrollOfficerApplication"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trollOfficerApplications']);
      toast.success("Application rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject: " + error.message);
    }
  });

  const voteTrollOfficerMutation = useMutation({
    mutationFn: async ({ applicationId, vote, comment }) => {
      const app = trollOfficerApps.find(a => a.id === applicationId);
      if (!app) throw new Error("Application not found");

      // Create vote record
      await base44.entities.TrollOfficerVote.create({
        application_id: applicationId,
        voter_id: user.id,
        voter_name: user.full_name,
        vote: vote,
        comment: comment || ""
      });

      // Count total officers + admin (voters)
      const currentAdmins = allUsers.filter(u => u.role === 'admin' && !u.account_deleted);
      const currentOfficers = allOfficers.filter(u => !u.account_deleted);
      const totalVoters = currentAdmins.length + currentOfficers.length;
      const requiredVotes = Math.ceil(totalVoters / 2); // Majority vote

      // Get all votes for this application (re-fetch to be fresh)
      const appVotes = await base44.entities.TrollOfficerVote.filter({ application_id: applicationId });
      const approveVotes = appVotes.filter(v => v.vote === 'approve').length;
      const rejectVotes = appVotes.filter(v => v.vote === 'reject').length;

      // Update application with vote counts
      await base44.entities.TrollOfficerApplication.update(applicationId, {
        total_votes: appVotes.length,
        approve_votes: approveVotes,
        reject_votes: rejectVotes,
        required_votes: requiredVotes // Update required votes too
      });

      // Check if majority reached (only if the application is still pending)
      if (app.status === 'pending') {
        if (approveVotes >= requiredVotes) {
          // Approve application
          await base44.entities.TrollOfficerApplication.update(applicationId, {
            status: "approved",
            approved_by: "Voting System (Majority)",
            approved_date: new Date().toISOString()
          });

          // Get applicant user data to update coins
          const applicantUsers = await base44.entities.User.filter({ id: app.user_id });
          const applicant = applicantUsers[0];

          // Make user a troll officer AND give them 50k free coins
          await base44.entities.User.update(app.user_id, {
            is_troll_officer: true,
            coins: (applicant?.coins || 0) + 50000,
            free_coins: (applicant?.free_coins || 0) + 50000
          });

          // Create transaction record for the coins
          await base44.entities.Transaction.create({
            user_id: app.user_id,
            user_name: app.user_name,
            transaction_type: "coin_purchase", // Can reuse this type for admin grants
            amount_coins: 50000,
            direction: "incoming",
            payment_method: "troll_officer_grant",
            description: "Welcome bonus: Promoted to Troll Officer",
            status: "completed"
          });

          // Send notification
          await base44.asServiceRole.entities.Notification.create({
            user_id: app.user_id,
            type: "achievement",
            title: "🎉 Troll Officer Approved!",
            message: "Congratulations! The Troll Officer team voted to approve your application. You now have moderation powers, earn 2% monthly revenue share, and received 50,000 free coins!",
            icon: "🛡️",
            link_url: "/#/Admin"
          });
          toast.success("Application approved by majority vote!");

        } else if (rejectVotes >= requiredVotes) {
          // Reject application
          await base44.entities.TrollOfficerApplication.update(applicationId, {
            status: "rejected",
            approved_by: "Voting System (Majority)",
            approved_date: new Date().toISOString(),
            rejection_reason: "Application did not receive majority approval from the Troll Officer team."
          });

          // Send notification
          await base44.asServiceRole.entities.Notification.create({
            user_id: app.user_id,
            type: "achievement",
            title: "Troll Officer Application Update",
            message: "Your application was reviewed by the team. Unfortunately, it did not receive majority approval at this time. You may reapply in the future.",
            icon: "📋",
            link_url: "/#/TrollOfficerApplication"
          });
          toast.success("Application rejected by majority vote.");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trollOfficerApplications']);
      queryClient.invalidateQueries(['myTrollOfficerVotes']);
      queryClient.invalidateQueries(['allTrollOfficerVotes']);
      queryClient.invalidateQueries(['allUsers']); // Status might change
      queryClient.invalidateQueries(['allOfficers']); // Officers list might change
      toast.success("Vote submitted!");
    },
    onError: (error) => {
      toast.error("Failed to submit vote: " + error.message);
    }
  });

  const sendUpdateNotificationMutation = useMutation({
    mutationFn: async (message) => {
      const allActiveUsers = allUsers.filter(u => !u.account_deleted && !u.is_banned);
      
      let sent = 0;
      for (const u of allActiveUsers) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_id: u.id,
            type: "achievement",
            title: "🚀 App Update Available!",
            message: message,
            icon: "✨",
            link_url: "/#/Updates"
          });
          sent++;
        } catch (error) {
          console.error(`Failed to notify ${u.email}:`, error);
        }
      }

      return { sent, total: allActiveUsers.length };
    },
    onSuccess: (data) => {
      toast.success(`Update notification sent to ${data.sent} users!`);
      setShowSendUpdateDialog(false);
      setUpdateMessage("");
    },
    onError: (error) => {
      toast.error("Failed to send update notification: " + error.message);
    }
  });

  const activeUsers = allUsers.filter(u => !u.account_deleted);
  const deletedUsers = allUsers.filter(u => u.account_deleted);

  const filteredUsers = showDeletedAccounts ? deletedUsers : (searchUserId
    ? activeUsers.filter(u =>
        u.user_id?.toLowerCase().includes(searchUserId.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUserId.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchUserId.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchUserId.toLowerCase())
      )
    : activeUsers);

  const pendingFlags = flags.filter(f => f.status === "pending");
  const criticalFlags = pendingFlags.filter(f => f.severity === "critical");

  const totalAdmins = allUsers.filter(u => u.role === 'admin' && !u.account_deleted).length;
  const currentOfficers = allOfficers.filter(u => !u.account_deleted).length;
  const totalVotersForApps = totalAdmins + currentOfficers;
  const requiredVotesForApps = Math.ceil(totalVotersForApps / 2);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "from-red-600 to-red-800";
      case "high": return "from-orange-500 to-red-500";
      case "medium": return "from-yellow-500 to-orange-500";
      case "low": return "from-blue-500 to-cyan-500";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getFlagTypeEmoji = (type) => {
    switch (type) {
      case "explicit": return "🔞";
      case "harassment": return "😠";
      case "hate_speech": return "💢";
      case "underage": return "👶";
      case "spam": return "📧";
      case "threats": return "⚠️";
      default: return "🚩";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAdmin && !isTrollOfficer) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You need to be an admin or Troll Officer to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a24] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-cyan-400" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white">
              {isAdmin ? "Admin Dashboard" : "Troll Officer Dashboard"}
            </h1>
            <p className="text-gray-400">Moderate and manage the platform</p>
          </div>
          {isFullAdmin && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSendUpdateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Update to All
              </Button>
              <Button
                onClick={regenerateAllUserIds}
                disabled={generatingIds}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generatingIds ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Generating IDs...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Generate All User IDs
                  </>
                )}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    toast.info("Refreshing top supporters...");
                    await base44.functions.invoke('refreshTopSupporters', {});
                    toast.success("Top supporters refreshed!");
                    queryClient.invalidateQueries(['myLeaderboard']);
                  } catch (error) {
                    toast.error("Failed to refresh: " + error.message);
                  }
                }}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Refresh Top Supporters
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a1a24] border border-[#2a2a3a] mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isFullAdmin && (
              <>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Users ({activeUsers.length})
                </TabsTrigger>
                <TabsTrigger value="streams" className="data-[state=active]:bg-red-500/20">
                  <Radio className="w-4 h-4 mr-2" />
                  Live Streams ({allStreams.length})
                </TabsTrigger>
                <TabsTrigger value="payouts" className="data-[state=active]:bg-green-500/20">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payouts ({pendingPayouts.length})
                </TabsTrigger>
              </>
            )}
            {(isAdmin || isTrollOfficer) && (
              <TabsTrigger value="applications">
                <Shield className="w-4 h-4 mr-2" />
                Applications ({trollOfficerApps.filter(app => app.status === 'pending').length})
              </TabsTrigger>
            )}
            {(isAdmin || isTrollOfficer) && (
              <TabsTrigger value="moderation" className="data-[state=active]:bg-red-500/20">
                <Flag className="w-4 h-4 mr-2" />
                Moderation ({pendingFlags.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-[#1a1a24] border-red-500/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Critical Flags</p>
                      <p className="text-3xl font-bold text-red-400">{criticalFlags.length}</p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a24] border-yellow-500/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Flags</p>
                      <p className="text-3xl font-bold text-yellow-400">{pendingFlags.length}</p>
                    </div>
                    <Flag className="w-10 h-10 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              {isAdmin && (
                <>
                  <Card className="bg-[#1a1a24] border-purple-500/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Active Users</p>
                          <p className="text-3xl font-bold text-purple-400">{activeUsers.length}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {deletedUsers.length} deleted
                          </p>
                        </div>
                        <Users className="w-10 h-10 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a24] border-red-500/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Live Streams</p>
                          <p className="text-3xl font-bold text-red-400">{allStreams.length}</p>
                        </div>
                        <Radio className="w-10 h-10 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a24] border-green-500/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Coin Requests</p>
                          <p className="text-3xl font-bold text-green-400">{coinRequests.length}</p>
                        </div>
                        <Coins className="w-10 h-10 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a24] border-cyan-500/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Pending Payouts</p>
                          <p className="text-3xl font-bold text-cyan-400">{pendingPayouts.length}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a24] border-orange-500/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Pending TO Apps</p>
                          <p className="text-3xl font-bold text-orange-400">{trollOfficerApps.filter(app => app.status === 'pending').length}</p>
                        </div>
                        <Shield className="w-10 h-10 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {isFullAdmin && (
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between flex-wrap gap-4">
                    <span>User Management ({allUsers.length} total users)</span>
                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={() => {
                          setShowDeletedAccounts(!showDeletedAccounts);
                          setSearchUserId("");
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }}
                        variant="outline"
                        className={`border-[#2a2a3a] ${showDeletedAccounts ? "bg-red-500/20 border-red-500 text-red-300" : ""}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {showDeletedAccounts ? `Active Users (${activeUsers.length})` : `Show Deleted (${deletedUsers.length})`}
                      </Button>
                      {!showDeletedAccounts && (
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                          <Input
                            placeholder="Search by User ID, email, username, or name..."
                            value={searchUserId}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchUserId && setShowSearchResults(true)}
                            className="w-96 bg-[#0a0a0f] border-[#2a2a3a] text-white pl-10"
                          />
                        </div>
                      )}

                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-96 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto right-0">
                          {searchResults.map((u) => (
                            <div
                              key={u.id}
                              className="p-4 hover:bg-[#2a2a3a] border-b border-[#2a2a3a] last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.full_name} className="w-10 h-10 rounded-full" />
                                ) : (
                                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">{u.full_name?.[0]}</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold truncate">{u.full_name}</p>
                                  {u.username && (
                                    <p className="text-purple-400 text-sm">@{u.username}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-green-400 text-xs">ID: {u.user_id}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyUserId(u.user_id);
                                      }}
                                      className="text-cyan-400 hover:text-cyan-300 ml-1"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToUserProfile(u.id);
                                    setShowSearchResults(false);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardTitle>
                  {generatingIds && (
                    <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-400" />
                        <div>
                          <p className="text-purple-300 font-semibold">Generating User IDs...</p>
                          <p className="text-purple-400 text-xs">This may take a few moments</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      Showing {filteredUsers.length} {showDeletedAccounts ? 'deleted' : 'active'} users
                      {!showDeletedAccounts && allUsers.filter(u => !u.user_id && !u.account_deleted).length > 0 && (
                        <span className="text-yellow-400 ml-2">
                          ({allUsers.filter(u => !u.user_id && !u.account_deleted).length} missing IDs)
                        </span>
                      )}
                    </p>
                  </div>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredUsers.map((u) => (
                        <Card key={u.id} className={`bg-[#0a0a0f] p-4 ${
                          u.account_deleted ? 'border-red-500/50' : 'border-[#2a2a3a]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <UserLink userId={u.id} className="flex items-center gap-4 flex-1">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.full_name} className="w-12 h-12 rounded-full" />
                              ) : (
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">{u.full_name?.[0]}</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-bold hover:text-purple-400">{u.full_name}</p>
                                  {u.username && (
                                    <p className="text-purple-400 text-sm hover:text-purple-300">@{u.username}</p>
                                  )}
                                  <Badge className="bg-purple-500/20 text-purple-300">
                                      Lvl {u.level || 1}
                                  </Badge>
                                  <Badge className="bg-yellow-500/20 text-yellow-300">
                                      {(u.coins || 0).toLocaleString()} coins
                                  </Badge>
                                  {(u.total_streaming_hours || 0) > 0 && (
                                    <Badge className="bg-red-500/20 text-red-300">
                                      {u.total_streaming_hours.toFixed(1)}h streamed
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                                  <span className={u.user_id ? "text-green-400 flex items-center gap-1" : "text-red-400"}>
                                    ID: {u.user_id || "⚠️ Generating..."}
                                    {u.user_id && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyUserId(u.user_id);
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 ml-1"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    )}
                                  </span>
                                  {canSeeSensitiveData && (
                                    <span>Email: {u.email}</span>
                                  )}
                                  <span className="text-green-400 flex items-center gap-1">
                                    ✓ Troll: {(u.purchased_coins || 0).toLocaleString()}
                                  </span>
                                  <span className="text-red-400 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    Free: {(u.free_coins || 0).toLocaleString()}
                                  </span>
                                  {canSeeSensitiveData && u.ip_address && (
                                    <span className="text-red-400 flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      IP: {u.ip_address}
                                    </span>
                                  )}
                                  {u.role === 'admin' && (
                                    <Badge className="bg-cyan-500 text-white">
                                      {u.admin_level === 'limited' ? 'Limited Admin' : 'Admin'}
                                    </Badge>
                                  )}
                                  {u.is_troll_officer && (
                                    <Badge className="bg-cyan-500 text-white">Officer</Badge>
                                  )}
                                  {u.is_banned && (
                                    <Badge className="bg-red-500 text-white">Banned</Badge>
                                  )}
                                  {!u.user_id && (
                                    <Badge className="bg-yellow-500 text-black animate-pulse">No ID</Badge>
                                  )}
                                </div>
                                {u.is_banned && u.ban_reason && (
                                  <p className="text-xs text-red-400 mt-1">Ban Reason: {u.ban_reason}</p>
                                )}
                              </div>
                            </UserLink>
                            <div className="flex gap-2">
                              {u.account_deleted ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => restoreAccountMutation.mutate(u.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={restoreAccountMutation.isPending}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    Restore
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => openPermanentDeleteDialog(u)}
                                    className="bg-red-800 hover:bg-red-900"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove Forever
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {canManageCoins && (
                                    <Button
                                      size="sm"
                                      onClick={() => openAddCoinsDialog(u)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Coins
                                    </Button>
                                  )}
                                  {!u.is_banned ? (
                                    <Button
                                      size="sm"
                                      onClick={() => openBanDialog(u)}
                                      className="bg-orange-600 hover:bg-orange-700"
                                      disabled={u.role === 'admin'}
                                    >
                                      <Ban className="w-4 h-4 mr-1" />
                                      Ban
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => unbanUserMutation.mutate(u.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Unban
                                    </Button>
                                  )}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-[#2a2a3a] hover:bg-[#2a2a3a]"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                      align="end"
                                      className="bg-[#1a1a24] border-[#2a2a3a] text-white"
                                    >
                                      {isFullAdmin && u.role !== 'admin' && (
                                        <>
                                          {u.is_troll_officer ? (
                                            <DropdownMenuItem
                                              onClick={() => toggleTrollOfficerMutation.mutate({
                                                userId: u.id,
                                                makeOfficer: false
                                              })}
                                              disabled={toggleTrollOfficerMutation.isPending}
                                              className="text-orange-400 focus:text-orange-300 focus:bg-orange-500/10 cursor-pointer"
                                            >
                                              <Shield className="w-4 h-4 mr-2" />
                                              Remove Troll Officer
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem
                                              onClick={() => toggleTrollOfficerMutation.mutate({
                                                userId: u.id,
                                                makeOfficer: true
                                              })}
                                              disabled={toggleTrollOfficerMutation.isPending}
                                              className="text-cyan-400 focus:text-cyan-300 focus:bg-cyan-500/10 cursor-pointer"
                                            >
                                              <Shield className="w-4 h-4 mr-2" />
                                              Make Troll Officer
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                                        </>
                                      )}

                                      {isFullAdmin && u.role !== 'admin' && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => toggleLimitedAdminMutation.mutate({
                                              userId: u.id,
                                              makeAdmin: true
                                            })}
                                            disabled={toggleLimitedAdminMutation.isPending}
                                            className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                                          >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Make Limited Admin
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                                        </>
                                      )}

                                      {isFullAdmin && u.role === 'admin' && u.admin_level === 'limited' && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => toggleLimitedAdminMutation.mutate({
                                              userId: u.id,
                                              makeAdmin: false
                                            })}
                                            disabled={toggleLimitedAdminMutation.isPending}
                                            className="text-orange-400 focus:text-orange-300 focus:bg-orange-500/10 cursor-pointer"
                                          >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Remove Admin Access
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                                        </>
                                      )}

                                      <DropdownMenuItem
                                        onClick={() => goToUserProfile(u.id)}
                                        className="focus:bg-purple-500/10 cursor-pointer"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Profile
                                      </DropdownMenuItem>
                                      {u.user_id && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyUserId(u.user_id);
                                          }}
                                          className="focus:bg-purple-500/10 cursor-pointer"
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          Copy User ID
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator className="bg-[#2a2a3a]" />

                                      {/* Only full admins can manage coins and levels */}
                                      {canManageCoins && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => openAddLevelsDialog(u)}
                                            className="focus:bg-purple-500/10 cursor-pointer"
                                          >
                                            <MoveUp className="w-4 h-4 mr-2 text-green-400" />
                                            Adjust Level
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => openSubtractCoinsDialog(u)}
                                            className="focus:bg-purple-500/10 cursor-pointer"
                                          >
                                            <Minus className="w-4 h-4 mr-2 text-red-400" />
                                            Subtract Coins
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => openConvertCoinsDialog(u)}
                                            className="focus:bg-purple-500/10 cursor-pointer"
                                          >
                                            <RefreshCcw className="w-4 h-4 mr-2 text-blue-400" />
                                            Convert Coins
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                                        </>
                                      )}

                                      {u.role !== 'admin' && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => openDeleteDialog(u)}
                                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isFullAdmin && (
            <TabsContent value="streams" className="space-y-4">
              <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Radio className="w-6 h-6 text-red-500" />
                      Live Streams Management
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      Monitor and manage all active streams
                    </p>
                  </CardHeader>
                  <CardContent>
                    {allStreams.length === 0 ? (
                      <div className="text-center py-12">
                        <Radio className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No live streams</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {allStreams.map((stream) => (
                            <Card key={stream.id} className="bg-[#0a0a0f] border-[#2a2a3a] p-4">
                              <div className="flex items-start gap-4">
                                <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                  {stream.thumbnail ? (
                                    <img 
                                      src={stream.thumbnail}
                                      alt={stream.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                                      <Radio className="w-12 h-12 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2">
                                    <Badge className="bg-red-500 text-white animate-pulse">
                                      <div className="w-2 h-2 bg-white rounded-full mr-2" />
                                      LIVE
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-bold text-lg mb-2 truncate">
                                    {stream.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    {stream.streamer_avatar ? (
                                      <img 
                                        src={stream.streamer_avatar}
                                        alt={stream.streamer_name}
                                        className="w-8 h-8 rounded-full"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                          {stream.streamer_name?.[0]?.toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-purple-400 font-semibold">
                                        {stream.streamer_name}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        ID: {stream.streamer_id}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div className="bg-[#1a1a24] p-2 rounded">
                                      <p className="text-gray-500 text-xs">Viewers</p>
                                      <div className="flex items-center gap-1 text-purple-400">
                                        <Eye className="w-4 h-4" />
                                        <span className="font-bold">{stream.viewer_count || 0}</span>
                                      </div>
                                    </div>
                                    <div className="bg-[#1a1a24] p-2 rounded">
                                      <p className="text-gray-500 text-xs">Gifts</p>
                                      <div className="flex items-center gap-1 text-yellow-400">
                                        <Gift className="w-4 h-4" />
                                        <span className="font-bold">{stream.total_gifts || 0}</span>
                                      </div>
                                    </div>
                                    <div className="bg-[#1a1a24] p-2 rounded">
                                      <p className="text-gray-500 text-xs">Likes</p>
                                      <div className="flex items-center gap-1 text-pink-400">
                                        <Heart className="w-4 h-4" />
                                        <span className="font-bold">{stream.likes || 0}</span>
                                      </div>
                                    </div>
                                    <div className="bg-[#1a1a24] p-2 rounded">
                                      <p className="text-gray-500 text-xs">Category</p>
                                      <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">
                                        {stream.category}
                                      </Badge>
                                    </div>
                                  </div>

                                  {stream.stream_mode === "multi" && (
                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500 mt-2">
                                      Multi-Troll ({stream.max_participants} boxes)
                                    </Badge>
                                  )}

                                  <p className="text-gray-500 text-xs mt-2">
                                    Started: {new Date(stream.created_date).toLocaleString()}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('🔵 Admin navigating to stream:', stream.id);
                                      window.location.hash = `/StreamViewer?id=${stream.id}`;
                                    }}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    onClick={() => openEndStreamDialog(stream)}
                                    disabled={!canEndStreams}
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!canEndStreams && isTrollOfficer ? "Requires Level 80+" : ""}
                                  >
                                    <StopCircle className="w-4 h-4 mr-1" />
                                    End Stream
                                  </Button>
                                  {!canEndStreams && isTrollOfficer && (
                                    <p className="text-xs text-yellow-400">
                                      Level {user?.level || 0}/80
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
          )}

          {isFullAdmin && (
            <TabsContent value="payouts" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Payout Management</h2>
                <div className="flex gap-3">
                  <Button
                    onClick={() => sendTestPaymentsMutation.mutate()}
                    disabled={sendTestPaymentsMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {sendTestPaymentsMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Send $0.00 Test to All
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={openManualPayoutDialog}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Manual Payout
                  </Button>
                </div>
              </div>

              {pendingPayouts.length > 0 && (
                <Card className="bg-[#1a1a24] border-yellow-500/50 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      Pending Approval ({pendingPayouts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingPayouts.map((payout) => (
                        <Card key={payout.id} className="bg-[#0a0a0f] border-[#2a2a3a] p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                  <p className="text-white font-bold text-lg">${payout.payout_amount?.toFixed(2)}</p>
                                  <p className="text-gray-400 text-sm">{payout.user_name}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Email:</p>
                                  <p className="text-white">{payout.user_email}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Coins:</p>
                                  <p className="text-yellow-400">{payout.coin_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Method:</p>
                                  <p className="text-white capitalize">{payout.payment_method}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Details:</p>
                                  <p className="text-white">{payout.payment_details}</p>
                                </div>
                              </div>
                              <p className="text-gray-500 text-xs mt-2">
                                Requested: {format(new Date(payout.created_date), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approvePayoutMutation.mutate(payout.id)}
                                disabled={approvePayoutMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  const reason = prompt("Reason for rejection:");
                                  if (reason) {
                                    rejectPayoutMutation.mutate({ payoutId: payout.id, reason });
                                  }
                                }}
                                disabled={rejectPayoutMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                <CardHeader>
                  <CardTitle className="text-white">Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {allPayouts.map((payout) => (
                        <Card key={payout.id} className={`bg-[#0a0a0f] p-4 ${
                          payout.status === "completed" ? "border-green-500/30" :
                          payout.status === "rejected" ? "border-red-500/30" : "border-[#2a2a3a]"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payout.status === "completed" ? "bg-green-500/20" :
                                payout.status === "rejected" ? "bg-red-500/20" : "bg-yellow-500/20"
                              }`}>
                                <DollarSign className={`w-5 h-5 ${
                                  payout.status === "completed" ? "text-green-400" :
                                  payout.status === "rejected" ? "text-red-400" : "text-yellow-400"
                                }`} />
                              </div>
                              <div>
                                <p className="text-white font-bold">${payout.payout_amount?.toFixed(2)}</p>
                                <p className="text-gray-400 text-sm">{payout.user_name}</p>
                                <p className="text-gray-500 text-xs">
                                  {format(new Date(payout.created_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                payout.status === "completed" ? "bg-green-500/20 text-green-300 border-green-500" :
                                payout.status === "rejected" ? "bg-red-500/20 text-red-300 border-red-500" :
                                payout.status === "processing" ? "bg-blue-500/20 text-blue-300 border-blue-500" :
                                "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                              }>
                                {payout.status}
                              </Badge>
                              <p className="text-gray-400 text-xs mt-1">
                                {payout.coin_amount?.toLocaleString()} coins
                              </p>
                            </div>
                          </div>
                          {payout.notes && (
                            <p className="text-gray-500 text-xs mt-2 italic">{payout.notes}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Troll Officer Applications Tab - UPDATED WITH VOTING */}
          {(isAdmin || isTrollOfficer) && (
            <TabsContent value="applications">
              <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                <div className="p-6 border-b border-[#2a2a3a]">
                  <h2 className="text-2xl font-bold text-white">Troll Officer Applications</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    🗳️ Vote on applications - Majority vote from all officers & admin required
                  </p>
                  <div className="mt-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-purple-300 text-sm">
                      <strong>Voting System:</strong> {currentOfficers} Troll Officers + {totalAdmins} Admin = {totalVotersForApps} voters
                      <br />
                      <strong>Required for approval:</strong> {requiredVotesForApps} votes
                    </p>
                  </div>
                </div>

                {trollOfficerApps.length === 0 ? (
                  <div className="p-12 text-center">
                    <Shield className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No applications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#2a2a3a]">
                    {trollOfficerApps.map((app) => {
                      const appVotes = allVotes.filter(v => v.application_id === app.id);
                      const hasVoted = myVotes.some(v => v.application_id === app.id);
                      const myVote = myVotes.find(v => v.application_id === app.id);

                      return (
                        <div key={app.id} className="p-6 hover:bg-[#0a0a0f] transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-white font-bold text-lg mb-1">
                                {app.username || app.user_name}
                              </h3>
                              <p className="text-gray-400 text-sm">{app.user_email}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge className="bg-purple-500/20 text-purple-300">
                                  Level {app.user_level}
                                </Badge>
                                <Badge className="bg-blue-500/20 text-blue-300">
                                  {app.total_streaming_hours?.toFixed(1)}h streamed
                                </Badge>
                              </div>
                            </div>

                            <Badge className={
                              app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' :
                              app.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500' :
                              'bg-red-500/20 text-red-300 border-red-500'
                            }>
                              {app.status}
                            </Badge>
                          </div>

                          <div className="bg-[#0a0a0f] rounded-lg p-4 mb-4 space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm font-bold mb-1">Why they want to be a Troll Officer:</p>
                              <p className="text-white text-sm">{app.reason}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm font-bold mb-1">Experience:</p>
                              <p className="text-white text-sm">{app.experience}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm font-bold mb-1">Availability:</p>
                              <p className="text-white text-sm">{app.availability}</p>
                            </div>
                          </div>

                          {/* Voting Stats */}
                          {app.status === 'pending' && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-bold">Voting Progress</h4>
                                <span className="text-purple-300 text-sm">
                                  {app.total_votes || 0} / {app.required_votes || requiredVotesForApps} votes
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                                  <p className="text-green-400 font-bold text-2xl">{app.approve_votes || 0}</p>
                                  <p className="text-green-300 text-xs">Approve</p>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                                  <p className="text-red-400 font-bold text-2xl">{app.reject_votes || 0}</p>
                                  <p className="text-red-300 text-xs">Reject</p>
                                </div>
                              </div>
                              
                              {/* Show who voted */}
                              {appVotes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-purple-500/30">
                                  <p className="text-purple-300 text-xs mb-2">Votes Cast:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {appVotes.map((vote, idx) => (
                                      <Badge key={idx} className={vote.vote === 'approve' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                        {vote.voter_name} {vote.vote === 'approve' ? '✓' : '✗'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Voting Buttons */}
                          {app.status === 'pending' && !hasVoted && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => {
                                  const comment = prompt("Optional comment for your approval:");
                                  voteTrollOfficerMutation.mutate({
                                    applicationId: app.id,
                                    vote: 'approve',
                                    comment: comment || ""
                                  });
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={voteTrollOfficerMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Vote to Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  const comment = prompt("Optional comment for your rejection:");
                                  voteTrollOfficerMutation.mutate({
                                    applicationId: app.id,
                                    vote: 'reject',
                                    comment: comment || ""
                                  });
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={voteTrollOfficerMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Vote to Reject
                              </Button>
                            </div>
                          )}

                          {hasVoted && app.status === 'pending' && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-blue-300 text-sm">
                                ✓ You voted to <strong>{myVote.vote}</strong> this application
                                {myVote.comment && (
                                  <span className="block mt-1 text-xs text-blue-200">
                                    Comment: "{myVote.comment}"
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {app.rejection_reason && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
                              <p className="text-red-300 text-sm font-bold mb-1">Result:</p>
                              <p className="text-red-200 text-sm">{app.rejection_reason}</p>
                            </div>
                          )}

                          {app.status === 'approved' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                              <p className="text-green-300 text-sm">
                                ✅ Approved by majority vote ({app.approve_votes} votes)
                              </p>
                            </div>
                          )}

                          <p className="text-gray-500 text-xs mt-3">
                            Applied: {new Date(app.created_date).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          {(isAdmin || isTrollOfficer) && (
            <TabsContent value="moderation" className="space-y-4">
              {criticalFlags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    CRITICAL ALERTS
                  </h3>
                  <div className="space-y-3">
                    {criticalFlags.map((flag) => (
                      <FlagCard
                        key={flag.id}
                        flag={flag}
                        onClick={() => setSelectedFlag(flag)}
                        getSeverityColor={getSeverityColor}
                        getFlagTypeEmoji={getFlagTypeEmoji}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-4">All Flagged Messages</h3>
                <div className="space-y-3">
                  {flags.filter(f => f.status === "pending" && f.severity !== "critical").map((flag) => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      onClick={() => setSelectedFlag(flag)}
                      getSeverityColor={getSeverityColor}
                      getFlagTypeEmoji={getFlagTypeEmoji}
                    />
                  ))}
                  {flags.filter(f => f.status !== "pending").map((flag) => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      onClick={() => setSelectedFlag(flag)}
                      getSeverityColor={getSeverityColor}
                      getFlagTypeEmoji={getFlagTypeEmoji}
                    />
                  ))}
                </div>
              </div>

              {flags.length === 0 && (
                <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">All Clear</h3>
                  <p className="text-gray-400">No flagged messages at the moment</p>
                </Card>
              )}
              
              {isAdmin && (
                <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Admin Messages</h3>
                  <p className="text-gray-400 mb-4">
                    ⚠️ Only subscribers can send messages to admin. Non-subscribers will see a message
                    prompting them to subscribe first.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Message system coming soon - users will be able to message you from their profile page
                  </p>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {showSearchResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSearchResults(false)}
        />
      )}

      {/* Add Coins Dialog */}
      <Dialog open={showAddCoinsDialog} onOpenChange={setShowAddCoinsDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              Add Coins to User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-white font-bold">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                <p className="text-purple-400 text-sm">Current Balance: {selectedUser.coins || 0} coins</p>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Amount of Coins</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Coin Type</Label>
                <select
                  value={coinType}
                  onChange={(e) => setCoinType(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white"
                >
                  <option value="free">Free Coins (cannot cash out)</option>
                  <option value="purchased">Purchased Coins (can spend)</option>
                  <option value="earned">Earned Coins (can cash out)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddCoinsDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addCoinsMutation.mutate({
                    userId: selectedUser.id,
                    amount: parseInt(coinsToAdd),
                    type: coinType
                  })}
                  disabled={!coinsToAdd || parseInt(coinsToAdd) <= 0 || addCoinsMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {addCoinsMutation.isPending ? "Adding..." : "Add Coins"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subtract Coins Dialog (NEW) */}
      <Dialog open={showSubtractCoinsDialog} onOpenChange={setShowSubtractCoinsDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-400">
              <Minus className="w-6 h-6" />
              Subtract Coins from User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-white font-bold">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                <p className="text-purple-400 text-sm">Current Total: {selectedUser.coins || 0} coins</p>
                <p className="text-green-400 text-sm">Purchased: {selectedUser.purchased_coins || 0} coins</p>
                <p className="text-red-400 text-sm">Free: {selectedUser.free_coins || 0} coins</p>
                <p className="text-yellow-400 text-sm">Earned: {selectedUser.earned_coins || 0} coins</p>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Amount of Coins to Subtract</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={coinsToSubtract}
                  onChange={(e) => setCoinsToSubtract(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Coin Type to Subtract From</Label>
                <select
                  value={coinType}
                  onChange={(e) => setCoinType(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white"
                >
                  <option value="free">Free Coins</option>
                  <option value="purchased">Purchased Coins</option>
                  <option value="earned">Earned Coins</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSubtractCoinsDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => subtractCoinsMutation.mutate({
                    userId: selectedUser.id,
                    amount: parseInt(coinsToSubtract),
                    type: coinType
                  })}
                  disabled={!coinsToSubtract || parseInt(coinsToSubtract) <= 0 || subtractCoinsMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  {subtractCoinsMutation.isPending ? "Subtracting..." : "Subtract Coins"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert Coins Dialog (NEW) */}
      <Dialog open={showConvertCoinsDialog} onOpenChange={setShowConvertCoinsDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-blue-400">
              <RefreshCcw className="w-6 h-6" />
              Convert Free Coins to Troll Coins
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-white font-bold">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                <p className="text-green-400 text-sm">Purchased Coins: {selectedUser.purchased_coins || 0}</p>
                <p className="text-red-400 text-sm">Free Coins: {selectedUser.free_coins || 0}</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  ⚠️ This action moves coins from "Free" to "Purchased" (Troll Coins). Troll Coins have real value and can be cashed out.
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Amount of Free Coins to Convert</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={coinsToConvert}
                  onChange={(e) => setCoinsToConvert(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  min="1"
                  max={selectedUser.free_coins || 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {(selectedUser.free_coins || 0).toLocaleString()} free coins
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConvertCoinsDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => convertCoinsMutation.mutate({
                    userId: selectedUser.id,
                    amount: parseInt(coinsToConvert)
                  })}
                  disabled={
                    !coinsToConvert || 
                    parseInt(coinsToConvert) <= 0 || 
                    parseInt(coinsToConvert) > (selectedUser.free_coins || 0) ||
                    convertCoinsMutation.isPending
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {convertCoinsMutation.isPending ? "Converting..." : "Convert Coins"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adjust Level Dialog (NEW) */}
      <Dialog open={showAddLevelsDialog} onOpenChange={setShowAddLevelsDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <MoveUp className="w-6 h-6 text-purple-400" />
              Adjust User Level
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-white font-bold">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                <p className="text-purple-400 text-sm">Current Level: {selectedUser.level || 1}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Change in Levels (+ or -)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 5 to add 5 levels, -2 to subtract 2 levels"
                  value={levelsToAdd}
                  onChange={(e) => setLevelsToAdd(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddLevelsDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addLevelsMutation.mutate({
                    userId: selectedUser.id,
                    levels: parseInt(levelsToAdd)
                  })}
                  disabled={!levelsToAdd || parseInt(levelsToAdd) === 0 || addLevelsMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {addLevelsMutation.isPending ? "Adjusting..." : "Adjust Level"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-400">
              <Ban className="w-6 h-6" />
              Ban User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg border border-red-500/30">
                <p className="text-white font-bold mb-2">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm mb-3">{selectedUser.email}</p>
                <p className="text-red-400 text-sm mt-2">⚠️ This will permanently ban this user from the platform</p>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Ban Reason</Label>
                <Textarea
                  placeholder="Enter reason for ban..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowBanDialog(false);
                    setBanReason("");
                  }}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => banUserMutation.mutate({
                    userId: selectedUser.id,
                    reason: banReason || "No reason provided"
                  })}
                  disabled={banUserMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {banUserMutation.isPending ? "Banning..." : "Ban User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-400">
              <Trash2 className="w-6 h-6" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-red-500/10 border border-red-500 p-4 rounded-lg">
                <p className="text-white font-bold mb-2">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm mb-3">{selectedUser.email}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-red-400 font-bold">⚠️ This will soft-delete the account</p>
                  <p className="text-red-300">This will:</p>
                  <ul className="list-disc list-inside text-red-300 space-y-1">
                    <li>Mark account as deleted</li>
                    <li>Anonymize user data (email, name, avatar)</li>
                    <li>Ban the account permanently</li>
                    <li>Keep account in database (can be restored)</li>
                  </ul>
                  <p className="text-yellow-400 mt-3">💡 Tip: Use "Remove Forever" to completely delete from database</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteAccountMutation.mutate(selectedUser.id)}
                  disabled={deleteAccountMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-400">
              <Trash2 className="w-6 h-6" />
              Remove Account Forever
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-red-900/30 border-2 border-red-500 p-4 rounded-lg">
                <p className="text-white font-bold mb-2">{selectedUser.full_name}</p>
                <p className="text-gray-400 text-sm mb-3">{selectedUser.email}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-red-400 font-bold text-lg">🚨 EXTREME WARNING 🚨</p>
                  <p className="text-red-300 font-bold">This PERMANENTLY removes the user from the database!</p>
                  <p className="text-red-300">This action:</p>
                  <ul className="list-disc list-inside text-red-300 space-y-1">
                    <li>CANNOT BE UNDONE</li>
                    <li>Completely removes user record</li>
                    <li>Deletes all user data permanently</li>
                    <li>Cannot be restored</li>
                    <li>May break references in other records</li>
                  </ul>
                  <p className="text-yellow-400 mt-3 font-bold">⚠️ Only use this for spam/bot accounts!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPermanentDeleteDialog(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => permanentDeleteMutation.mutate(selectedUser.id)}
                  disabled={permanentDeleteMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-800 to-black hover:from-red-900 hover:to-black"
                >
                  {permanentDeleteMutation.isPending ? "Removing..." : "🗑️ REMOVE FOREVER"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Review Dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-400" />
              Review Flagged Content
            </DialogTitle>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${getSeverityColor(selectedFlag.severity)} p-4 rounded-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getFlagTypeEmoji(selectedFlag.flag_type)}</span>
                  <Badge className="bg-black/50 text-white">
                    {selectedFlag.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-white font-bold mb-1">Flagged Message:</p>
                <p className="text-white bg-black/30 p-3 rounded">{selectedFlag.message_content}</p>
              </div>

              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">AI Analysis:</p>
                <p className="text-white">{selectedFlag.ai_analysis}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-purple-500">
                    Confidence: {selectedFlag.ai_confidence}%
                  </Badge>
                  <Badge className="bg-cyan-500">
                    Type: {selectedFlag.flag_type}
                  </Badge>
                </div>
              </div>

              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">User:</p>
                <p className="text-white font-bold">@{selectedFlag.username}</p>
                <p className="text-gray-500 text-xs">ID: {selectedFlag.user_id}</p>
              </div>

              {selectedFlag.matched_keywords && selectedFlag.matched_keywords.length > 0 && (
                <div className="bg-[#0a0a0f] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Matched Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlag.matched_keywords.map((keyword, idx) => (
                      <Badge key={idx} className="bg-red-500">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Review Notes:</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your notes about this flag..."
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => reviewFlagMutation.mutate({
                    flagId: selectedFlag.id,
                    action: "delete_message",
                    notes: reviewNotes || "Message deleted"
                  })}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Message
                </Button>

                <Button
                  onClick={() => reviewFlagMutation.mutate({
                    flagId: selectedFlag.id,
                    action: "mute_24h",
                    notes: reviewNotes || "Muted for 24 hours"
                  })}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mute 24h
                </Button>

                <Button
                  onClick={() => reviewFlagMutation.mutate({
                    flagId: selectedFlag.id,
                    action: "ban_user",
                    notes: reviewNotes || "Banned for violating community guidelines"
                  })}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </Button>

                <Button
                  onClick={() => reviewFlagMutation.mutate({
                    flagId: selectedFlag.id,
                    action: "dismiss",
                    notes: reviewNotes || "Dismissed - false positive"
                  })}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Payout Dialog */}
      <Dialog open={showManualPayoutDialog} onOpenChange={setShowManualPayoutDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Create Manual Payout
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a payout for a user manually (deducts from their earned coins)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white mb-2 block">Select User</Label>
              <select
                value={manualPayoutUser?.id || ""}
                onChange={(e) => {
                  const user = allUsers.find(u => u.id === e.target.value);
                  setManualPayoutUser(user);
                }}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select a user...</option>
                {allUsers.filter(u => (u.earned_coins || 0) > 0).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} - {(u.earned_coins || 0).toLocaleString()} earned coins
                  </option>
                ))}
              </select>
            </div>

            {manualPayoutUser && (
              <>
                <Card className="bg-[#0a0a0f] border-[#2a2a3a] p-4">
                  <p className="text-white font-bold mb-1">{manualPayoutUser.full_name}</p>
                  <p className="text-gray-400 text-sm mb-2">{manualPayoutUser.email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Earned Coins:</p>
                      <p className="text-yellow-400 font-bold">{(manualPayoutUser.earned_coins || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Coins:</p>
                      <p className="text-gray-300">{(manualPayoutUser.coins || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <div>
                  <Label className="text-white mb-2 block">Coin Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter coins to payout..."
                    value={manualPayoutAmount}
                    onChange={(e) => setManualPayoutAmount(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                    min="20000"
                    max={manualPayoutUser.earned_coins || 0}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min: 20,000 coins • Max: {(manualPayoutUser.earned_coins || 0).toLocaleString()} coins
                  </p>
                </div>

                {manualPayoutAmount && parseInt(manualPayoutAmount) >= 20000 && (
                  <Card className="bg-blue-500/10 border border-blue-500/30 p-4">
                    <p className="text-blue-300 font-semibold mb-2">Payout Calculation:</p>
                    <div className="space-y-1 text-sm">
                      {(() => {
                        let amount = parseInt(manualPayoutAmount);
                        if (isNaN(amount) || amount <= 0) return null;

                        let remaining = amount;
                        let totalUSD = 0;
                        const breakdown = [];
                        
                        if (remaining > 0) {
                          const tier1Coins = Math.min(remaining, 20000);
                          const tier1USD = tier1Coins / 160;
                          totalUSD += tier1USD;
                          breakdown.push(`${tier1Coins.toLocaleString()} coins @ 160: $${tier1USD.toFixed(2)}`);
                          remaining -= tier1Coins;
                        }
                        
                        if (remaining > 0) {
                          const tier2Coins = Math.min(remaining, 20000);
                          const tier2USD = tier2Coins / 200;
                          totalUSD += tier2USD;
                          breakdown.push(`${tier2Coins.toLocaleString()} coins @ 200: $${tier2USD.toFixed(2)}`);
                          remaining -= tier2Coins;
                        }
                        
                        if (remaining > 0) {
                          const tier3Coins = Math.min(remaining, 20000);
                          const tier3USD = tier3Coins / 250;
                          totalUSD += tier3USD;
                          breakdown.push(`${tier3Coins.toLocaleString()} coins @ 250: $${tier3USD.toFixed(2)}`);
                          remaining -= tier3Coins;
                        }
                        
                        if (remaining > 0) {
                          const tier4Coins = remaining;
                          const tier4USD = remaining / 300;
                          totalUSD += tier4USD;
                          breakdown.push(`${tier4Coins.toLocaleString()} coins @ 300: $${tier4USD.toFixed(2)}`);
                          remaining -= tier4Coins;
                        }

                        return (
                          <>
                            {breakdown.map((line, i) => (
                              <p key={i} className="text-cyan-300">• {line}</p>
                            ))}
                            <div className="h-px bg-blue-500/30 my-2" />
                            <p className="text-green-400 font-bold text-lg">Total Payout: ${totalUSD.toFixed(2)}</p>
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                )}

                <div>
                  <Label className="text-white mb-2 block">Payment Method</Label>
                  <select
                    value={manualPayoutMethod}
                    onChange={(e) => setManualPayoutMethod(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="venmo">Venmo</option>
                    <option value="cashapp">Cash App</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Payment Details</Label>
                  <Input
                    placeholder="Email, account number, etc..."
                    value={manualPayoutDetails}
                    onChange={(e) => setManualPayoutDetails(e.target.value)}
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowManualPayoutDialog(false);
                      setManualPayoutUser(null);
                      setManualPayoutAmount("");
                      setManualPayoutDetails("");
                    }}
                    variant="outline"
                    className="flex-1 border-[#2a2a3a]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createManualPayoutMutation.mutate({
                      userId: manualPayoutUser.id,
                      amount: parseInt(manualPayoutAmount),
                      method: manualPayoutMethod,
                      details: manualPayoutDetails
                    })}
                    disabled={
                      !manualPayoutAmount || 
                      parseInt(manualPayoutAmount) < 20000 || 
                      !manualPayoutDetails.trim() ||
                      createManualPayoutMutation.isPending ||
                      parseInt(manualPayoutAmount) > (manualPayoutUser?.earned_coins || 0)
                    }
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {createManualPayoutMutation.isPending ? "Creating..." : "Create Payout"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* End Stream Dialog */}
      <Dialog open={showEndStreamDialog} onOpenChange={setShowEndStreamDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-400">
              <StopCircle className="w-6 h-6" />
              End Stream
            </DialogTitle>
          </DialogHeader>
          {selectedStream && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0a0a0f] p-4 rounded-lg border border-red-500/30">
                <p className="text-white font-bold mb-2">{selectedStream.title}</p>
                <p className="text-gray-400 text-sm mb-2">by {selectedStream.streamer_name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-purple-400">
                    <Eye className="w-4 h-4" />
                    {selectedStream.viewer_count || 0} viewers
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Gift className="w-4 h-4" />
                    {selectedStream.total_gifts || 0} coins
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-400 mb-2 block">
                  Reason for ending stream (will be sent to streamer)
                </Label>
                <Textarea
                  placeholder="Enter reason (e.g., 'Inappropriate content', 'Violates community guidelines')..."
                  value={endStreamReason}
                  onChange={(e) => setEndStreamReason(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  ⚠️ The streamer will receive a notification with your reason
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEndStreamDialog(false);
                    setEndStreamReason("");
                  }}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => endStreamMutation.mutate({
                    streamId: selectedStream.id,
                    reason: endStreamReason.trim() || "Your stream was ended by a moderator."
                  })}
                  disabled={!endStreamReason.trim() || endStreamMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {endStreamMutation.isPending ? "Ending..." : "End Stream & Notify"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Update Notification Dialog */}
      <Dialog open={showSendUpdateDialog} onOpenChange={setShowSendUpdateDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-400" />
              Send Update to All Users
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will send a notification to ALL active users ({allUsers.filter(u => !u.account_deleted && !u.is_banned).length} users)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                🚀 Users will be prompted to refresh their app/browser to get the latest update
              </p>
            </div>

            <div>
              <Label className="text-white mb-2 block">Update Message</Label>
              <Textarea
                placeholder="e.g., 'New features added! Refresh your app to see the latest updates.'"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSendUpdateDialog(false)}
                variant="outline"
                className="flex-1 border-[#2a2a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => sendUpdateNotificationMutation.mutate(updateMessage)}
                disabled={!updateMessage.trim() || sendUpdateNotificationMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {sendUpdateNotificationMutation.isPending ? "Sending..." : `Send to ${allUsers.filter(u => !u.account_deleted && !u.is_banned).length} Users`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlagCard({ flag, onClick, getSeverityColor, getFlagTypeEmoji }) {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="bg-[#1a1a24] border-[#2a2a3a] hover:border-red-500/50 cursor-pointer transition-all"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`bg-gradient-to-br ${getSeverityColor(flag.severity)} p-3 rounded-lg`}>
              <span className="text-2xl">{getFlagTypeEmoji(flag.flag_type)}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`bg-gradient-to-r ${getSeverityColor(flag.severity)}`}>
                  {flag.severity.toUpperCase()}
                </Badge>
                <Badge className="bg-purple-500">
                  AI: {flag.ai_confidence}%
                </Badge>
                <span className="text-xs text-gray-500">{timeAgo(flag.created_date)}</span>
              </div>

              <p className="text-white font-semibold mb-1">@{flag.username}</p>
              <p className="text-gray-300 bg-[#0a0a0f] p-2 rounded mb-2 line-clamp-2">
                {flag.message_content}
              </p>

              <p className="text-xs text-gray-400">
                {flag.ai_analysis}
              </p>

              {flag.status !== "pending" && (
                <Badge className="mt-2 bg-gray-600">
                  {flag.status === "dismissed" ? "Dismissed" : "Action Taken"}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
