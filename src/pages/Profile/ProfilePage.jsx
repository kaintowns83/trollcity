
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Camera,
  Sparkles,
  Heart,
  Users,
  Coins,
  TrendingUp,
  Edit,
  Check,
  X,
  Crown,
  Shield,
  Trophy,
  Gift,
  Medal,
  MessageCircle,
  UserPlus,
  UserX,
  Ban,
  Copy,
  Image as ImageIcon,
  Video,
  Send,
  Share2,
  MoreVertical,
  Plus,
  CheckCircle,
  DollarSign, // Added DollarSign icon
  AlertCircle, // Added AlertCircle icon for verification section
  Hourglass, // Added Hourglass icon for verification section
  RefreshCcw // Added RefreshCcw icon for verification section
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserLink from "../components/UserLink";
import OGBadge from "../components/OGBadge";
import { Label } from "@/components/ui/label"; // Added Label component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select components
import { useNavigate } from "react-router-dom";
import PaymentVerificationSection from "../components/PaymentVerificationSection"; // NEW IMPORT
import TrollFamilyBadge from "../components/TrollFamilyBadge";

export default function ProfilePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get('userId');
  const tabParam = urlParams.get('tab'); // Read the tab parameter
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [editedDisplayName, setEditedDisplayName] = useState("");
  const [editedUsername, setEditedUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showEntranceEffects, setShowEntranceEffects] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postMedia, setPostMedia] = useState(null);
  const [postMediaPreview, setPostMediaPreview] = useState("");
  const [postType, setPostType] = useState("text");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentUsername, setPaymentUsername] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankRouting, setBankRouting] = useState("");

  // Add state for active tab
  const [activeTab, setActiveTab] = useState(tabParam || "posts");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['profileUser', profileUserId],
    queryFn: async () => {
      if (profileUserId && profileUserId !== currentUser?.id) {
        const users = await base44.entities.User.filter({ id: profileUserId });
        const targetUser = users[0];
        
        // Block access to admin profiles for non-admins
        if (targetUser && targetUser.role === 'admin' && currentUser?.role !== 'admin') {
          toast.error("Admin profiles are private");
          navigate('/Home');
          return null;
        }
        
        return targetUser;
      }
      return currentUser;
    },
    enabled: !!currentUser,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', profileUser?.id],
    queryFn: () => base44.entities.UserPost.filter({ user_id: profileUser.id }, "-created_date"),
    enabled: !!profileUser?.id,
    initialData: [],
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
    initialData: [],
  });

  const { data: ownedEntranceEffects = [] } = useQuery({
    queryKey: ['userEntranceEffects', profileUser?.id],
    queryFn: () => base44.entities.UserEntranceEffect.filter({ user_id: profileUser.id }),
    enabled: !!profileUser?.id,
    initialData: [],
  });

  const { data: availableEntranceEffects = [] } = useQuery({
    queryKey: ['entranceEffects'],
    queryFn: () => base44.entities.EntranceEffect.list(),
    initialData: [],
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['isFollowing', profileUser?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !profileUser || currentUser.id === profileUser.id) return false;
      const follows = await base44.entities.Follow.filter({
        follower_id: currentUser.id,
        following_id: profileUser.id
      });
      return follows.length > 0;
    },
    enabled: !!currentUser && !!profileUser && currentUser.id !== profileUser.id,
  });

  const { data: isBlocked } = useQuery({
    queryKey: ['isBlocked', profileUser?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !profileUser || currentUser.id === profileUser.id) return null;
      const blocks = await base44.entities.BlockedUser.filter({
        blocker_id: currentUser.id,
        blocked_id: profileUser.id
      });
      return blocks.length > 0 ? blocks[0] : null;
    },
    enabled: !!currentUser && !!profileUser && currentUser.id !== profileUser.id,
  });

  const { data: mySubscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', currentUser?.id],
    queryFn: () => base44.entities.UserSubscription.filter({
      subscriber_id: currentUser.id,
      status: "active"
    }),
    enabled: !!currentUser,
    initialData: [],
  });

  const hasActiveSubscription = mySubscriptions.length > 0;

  const { data: myLeaderboard = [] } = useQuery({
    queryKey: ['myLeaderboard', profileUser?.id],
    queryFn: async () => {
      const entries = await base44.entities.StreamerLeaderboard.filter(
        { streamer_id: profileUser.id },
        "-total_coins_gifted",
        1000
      );

      return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    },
    enabled: !!profileUser?.id,
    initialData: [],
  });

  const topSupporters = myLeaderboard.slice(0, 10);
  const isOwnProfile = currentUser?.id === profileUser?.id;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const follows = await base44.entities.Follow.filter({
          follower_id: currentUser.id,
          following_id: profileUser.id
        });
        if (follows[0]) {
          await base44.entities.Follow.delete(follows[0].id);
        }
        await base44.asServiceRole.entities.User.update(profileUser.id, {
          follower_count: Math.max(0, (profileUser.follower_count || 0) - 1)
        });
        await base44.auth.updateMe({
          following_count: Math.max(0, (currentUser.following_count || 0) - 1)
        });
      } else {
        await base44.entities.Follow.create({
          follower_id: currentUser.id,
          following_id: profileUser.id,
          follower_name: currentUser.full_name,
          following_name: profileUser.full_name
        });
        await base44.asServiceRole.entities.User.update(profileUser.id, {
          follower_count: (profileUser.follower_count || 0) + 1
        });
        await base44.auth.updateMe({
          following_count: (currentUser.following_count || 0) + 1
        });

        // Send notification to user being followed
        await base44.asServiceRole.entities.Notification.create({
          user_id: profileUser.id,
          type: "new_follower",
          title: "🎉 New Follower!",
          message: `${currentUser.username || currentUser.full_name} started following you`,
          icon: "👤",
          link_url: `/#/Profile?userId=${currentUser.id}`,
          related_user_id: currentUser.id,
          related_user_name: currentUser.full_name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['isFollowing']);
      queryClient.invalidateQueries(['profileUser']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success(isFollowing ? "Unfollowed!" : "Following!");
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async () => {
      if (isBlocked) {
        await base44.entities.BlockedUser.delete(isBlocked.id);
      } else {
        await base44.entities.BlockedUser.create({
          blocker_id: currentUser.id,
          blocker_name: currentUser.full_name,
          blocked_id: profileUser.id,
          blocked_name: profileUser.full_name,
          blocked_username: profileUser.username || profileUser.full_name,
          reason: "Blocked from profile"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['isBlocked']);
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      setShowBlockDialog(false);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      // Check if conversation exists
      const existingConv = await base44.entities.Conversation.filter({
        participant1_id: currentUser.id,
        participant2_id: profileUser.id
      });

      const existingConv2 = await base44.entities.Conversation.filter({
        participant1_id: profileUser.id,
        participant2_id: currentUser.id
      });

      let conversation = existingConv[0] || existingConv2[0];
      let unreadP1 = 0;
      let unreadP2 = 1;

      if (!conversation) {
        // Create new conversation
        conversation = await base44.entities.Conversation.create({
          participant1_id: currentUser.id,
          participant1_name: currentUser.full_name,
          participant1_username: currentUser.username || currentUser.full_name,
          participant1_avatar: currentUser.avatar,
          participant1_created_date: currentUser.created_date,
          participant2_id: profileUser.id,
          participant2_name: profileUser.full_name,
          participant2_username: profileUser.username || profileUser.full_name,
          participant2_avatar: profileUser.avatar,
          participant2_created_date: profileUser.created_date,
          last_message: message,
          last_message_time: new Date().toISOString(),
          unread_count_p1: 0,
          unread_count_p2: 1
        });
      } else {
        // Update unread count based on who is participant1 in the conversation
        if (conversation.participant1_id === currentUser.id) {
          unreadP1 = conversation.unread_count_p1 || 0;
          unreadP2 = (conversation.unread_count_p2 || 0) + 1;
        } else { // currentUser is participant2
          unreadP1 = (conversation.unread_count_p1 || 0) + 1;
          unreadP2 = conversation.unread_count_p2 || 0;
        }
      }

      // Send message
      await base44.entities.DirectMessage.create({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_username: currentUser.username || currentUser.full_name,
        sender_avatar: currentUser.avatar,
        receiver_id: profileUser.id,
        receiver_name: profileUser.full_name,
        message: message,
        is_read: false
      });

      // Update conversation
      await base44.entities.Conversation.update(conversation.id, {
        last_message: message.substring(0, 100),
        last_message_time: new Date().toISOString(),
        unread_count_p1: unreadP1,
        unread_count_p2: unreadP2
      });
    },
    onSuccess: () => {
      setMessageText("");
      setShowMessageDialog(false);
      toast.success("Message sent!");
      // Use React Router navigation instead of window.location
      setTimeout(() => {
        navigate('/messages'); // Assuming /messages is the correct path for the Messages page
      }, 1000);
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      let mediaUrl = "";
      let thumbnailUrl = "";

      if (postMedia) {
        setIsUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: postMedia });
        mediaUrl = file_url;

        if (postType === "video") {
          thumbnailUrl = file_url;
        }
        setIsUploading(false);
      }

      await base44.entities.UserPost.create({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        username: currentUser.username || currentUser.full_name,
        user_avatar: currentUser.avatar,
        post_type: postType,
        content: postData.content,
        media_url: mediaUrl,
        media_thumbnail: thumbnailUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts']);
      setShowCreatePost(false);
      setPostContent("");
      setPostMedia(null);
      setPostMediaPreview("");
      setPostType("text");
      toast.success("Post created!");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId) => {
      const existingLikes = await base44.entities.PostLike.filter({
        post_id: postId,
        user_id: currentUser.id
      });

      const post = posts.find(p => p.id === postId);

      if (existingLikes.length > 0) {
        await base44.entities.PostLike.delete(existingLikes[0].id);
        await base44.entities.UserPost.update(postId, {
          likes_count: Math.max(0, (post.likes_count || 0) - 1)
        });
      } else {
        await base44.entities.PostLike.create({
          post_id: postId,
          user_id: currentUser.id,
          user_name: currentUser.full_name
        });
        await base44.entities.UserPost.update(postId, {
          likes_count: (post.likes_count || 0) + 1
        });

        // Send notification to post owner (if not liking own post)
        if (post.user_id !== currentUser.id) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: post.user_id,
            type: "new_follower", // As specified in the outline, though 'post_like' might be more descriptive
            title: "❤️ New Like!",
            message: `${currentUser.username || currentUser.full_name} liked your post`,
            icon: "❤️",
            link_url: `/#/Profile?userId=${currentUser.id}`,
            related_user_id: currentUser.id,
            related_user_name: currentUser.full_name
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts']);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, comment }) => {
      const post = posts.find(p => p.id === postId);

      await base44.entities.PostComment.create({
        post_id: postId,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        username: currentUser.username || currentUser.full_name,
        user_avatar: currentUser.avatar,
        comment: comment
      });

      await base44.entities.UserPost.update(postId, {
        comments_count: (post.comments_count || 0) + 1
      });

      // Send notification to post owner (if not commenting on own post)
      if (post.user_id !== currentUser.id) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: post.user_id,
          type: "new_follower", // As specified in the outline, though 'post_comment' might be more descriptive
          title: "💬 New Comment!",
          message: `${currentUser.username || currentUser.full_name} commented on your post`,
          icon: "💬",
          link_url: `/#/Profile?userId=${post.user_id}`,
          related_user_id: currentUser.id,
          related_user_name: currentUser.full_name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts']);
      toast.success("Comment added!");
    },
  });

  const sendPostGiftMutation = useMutation({
    mutationFn: async ({ post, gift }) => {
      if ((currentUser.coins || 0) < gift.coin_value) {
        throw new Error("Not enough coins!");
      }

      const isPurchasedCoins = (currentUser.purchased_coins || 0) >= gift.coin_value;
      const purchasedCoinsUsed = Math.min(currentUser.purchased_coins || 0, gift.coin_value);
      const freeCoinsUsed = gift.coin_value - purchasedCoinsUsed;

      await base44.auth.updateMe({
        coins: (currentUser.coins || 0) - gift.coin_value,
        purchased_coins: (currentUser.purchased_coins || 0) - purchasedCoinsUsed,
        free_coins: (currentUser.free_coins || 0) - freeCoinsUsed
      });

      const postOwner = await base44.entities.User.filter({ id: post.user_id });
      if (postOwner[0]) {
        await base44.entities.User.update(post.user_id, {
          coins: (postOwner[0].coins || 0) + gift.coin_value,
          earned_coins: isPurchasedCoins
            ? (postOwner[0].earned_coins || 0) + gift.coin_value
            : (postOwner[0].earned_coins || 0),
          total_gifts_received: (postOwner[0].total_gifts_received || 0) + gift.coin_value
        });
      }

      await base44.entities.PostGift.create({
        post_id: post.id,
        gift_id: gift.id,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        receiver_id: post.user_id,
        receiver_name: post.user_name,
        gift_name: gift.name,
        gift_emoji: gift.emoji,
        coin_value: gift.coin_value,
        is_purchased_coins: isPurchasedCoins
      });

      await base44.entities.UserPost.update(post.id, {
        total_gifts: (post.total_gifts || 0) + gift.coin_value
      });

      // Update StreamerLeaderboard (Top Supporters) for POST GIFTS
      const existingLeaderboard = await base44.entities.StreamerLeaderboard.filter({
        streamer_id: post.user_id,
        gifter_id: currentUser.id
      });

      if (existingLeaderboard.length > 0) {
        await base44.entities.StreamerLeaderboard.update(existingLeaderboard[0].id, {
          total_coins_gifted: (existingLeaderboard[0].total_coins_gifted || 0) + gift.coin_value,
          total_gifts_sent: (existingLeaderboard[0].total_gifts_sent || 0) + 1,
          last_gift_date: new Date().toISOString()
        });
      } else {
        await base44.entities.StreamerLeaderboard.create({
          streamer_id: post.user_id,
          streamer_name: post.user_name,
          gifter_id: currentUser.id,
          gifter_name: currentUser.full_name,
          gifter_username: currentUser.username || currentUser.full_name,
          gifter_avatar: currentUser.avatar,
          total_coins_gifted: gift.coin_value,
          total_gifts_sent: 1,
          last_gift_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['userPosts']);
      queryClient.invalidateQueries(['myLeaderboard']);
      setShowGiftDialog(false);
      setSelectedPost(null);
      toast.success("Gift sent!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      let avatarUrl = profileUser.avatar;
      let coverUrl = profileUser.cover_photo;

      if (avatar) {
        setIsUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: avatar });
          avatarUrl = file_url;
        } catch (error) {
          console.error("Avatar upload error:", error);
        }
      }

      if (coverPhoto) {
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: coverPhoto });
          coverUrl = file_url;
        } catch (error) {
          console.error("Cover photo upload error:", error);
        }
      }

      setIsUploading(false);

      await base44.auth.updateMe({
        ...data,
        avatar: avatarUrl,
        cover_photo: coverUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['profileUser']);
      setIsEditing(false);
      setAvatar(null);
      setAvatarPreview("");
      setCoverPhoto(null);
      setCoverPreview("");
      toast.success("Profile updated!");
    },
  });

  const setActiveEntranceEffectMutation = useMutation({
    mutationFn: async (effectId) => {
      const activeEffects = ownedEntranceEffects.filter(e => e.is_active);
      for (const effect of activeEffects) {
        await base44.entities.UserEntranceEffect.update(effect.id, { is_active: false });
      }

      const selectedEffect = ownedEntranceEffects.find(e => e.effect_id === effectId);
      if (selectedEffect) {
        await base44.entities.UserEntranceEffect.update(selectedEffect.id, { is_active: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userEntranceEffects']);
      toast.success("Entrance effect updated!");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        payment_method: paymentMethod
      };

      // Add payment details based on method
      if (paymentMethod === "paypal") {
        if (!paymentEmail || !paymentEmail.includes("@")) {
          throw new Error("Please enter a valid email for PayPal.");
        }
        updates.payment_email = paymentEmail;
        updates.payment_username = null;
        updates.bank_account_number = null;
        updates.bank_routing_number = null;
      } else if (paymentMethod === "cashapp" || paymentMethod === "venmo") {
        if (!paymentUsername) {
          throw new Error("Please enter your username.");
        }
        // Auto-add $ for CashApp if not present
        let formattedUsername = paymentUsername.trim();
        if (paymentMethod === "cashapp" && !formattedUsername.startsWith("$")) {
          formattedUsername = "$" + formattedUsername;
        }
        updates.payment_username = formattedUsername;
        updates.payment_email = null;
        updates.bank_account_number = null;
        updates.bank_routing_number = null;
      } else if (paymentMethod === "bank_transfer") {
        if (!bankAccount || !bankRouting) {
          throw new Error("Please enter both bank account and routing numbers.");
        }
        updates.bank_account_number = bankAccount;
        updates.bank_routing_number = bankRouting;
        updates.payment_email = null;
        updates.payment_username = null;
      } else {
        throw new Error("Please select a payment method.");
      }

      await base44.auth.updateMe(updates);

      // Create payment verification record
      await base44.entities.PaymentVerification.create({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        payment_method: paymentMethod,
        payment_details: updates.payment_email || updates.payment_username || "Bank Transfer",
        test_payment_sent: false,
        verified_by_user: false,
        verification_required: true,
        notes: "Payment method added - awaiting test payment from admin"
      });

      // Send notification to user
      await base44.asServiceRole.entities.Notification.create({
        user_id: currentUser.id,
        type: "achievement",
        title: "💳 Payment Method Added",
        message: "Your payment method has been saved! Admin will send a $0.00 test payment within 24 hours to verify it works. You'll be notified when it's sent.",
        icon: "✅",
        link_url: "/#/Profile?tab=payment"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['profileUser']);
      queryClient.invalidateQueries(['paymentVerifications']); // Invalidate new query
      setShowPaymentDialog(false);
      toast.success("Payment method saved! You'll be notified when test payment is sent."); // Updated toast message
      
      // Force refresh all user-related queries to update entire system
      queryClient.invalidateQueries(['payouts']);
      queryClient.invalidateQueries(['earnings']);
      
      // Small delay to ensure all queries refresh
      setTimeout(() => {
        queryClient.refetchQueries(['currentUser']);
        queryClient.refetchQueries(['profileUser']);
        queryClient.refetchQueries(['paymentVerifications']); // Refetch new query
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update payment method");
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

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePostMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updates = {
      bio: editedBio,
      display_name: editedDisplayName,
      username: editedUsername
    };

    if (editedUsername && editedUsername.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    updateProfileMutation.mutate(updates);
  };

  const copyUserId = () => {
    if (profileUser?.user_id) {
      navigator.clipboard.writeText(profileUser.user_id);
      toast.success("User ID copied!");
    }
  };

  const openPaymentDialog = () => {
    if (!profileUser) {
      console.error("❌ No profile user data available");
      toast.error("Profile data not loaded yet");
      return;
    }
    
    console.log("🟢 Opening payment dialog...");
    console.log("🟢 Profile User:", profileUser);
    console.log("🟢 Payment Method:", profileUser?.payment_method);
    
    setPaymentMethod(profileUser.payment_method || "");
    setPaymentEmail(profileUser.payment_email || "");
    setPaymentUsername(profileUser.payment_username ? profileUser.payment_username.replace(/^\$/, '') : ""); // Remove '$' for display in input
    setBankAccount("");
    setBankRouting("");
    setShowPaymentDialog(true);
    
    console.log("🟢 showPaymentDialog state set to:", true);
  };

  const getTierInfo = (level) => {
    if (level >= 1 && level <= 9) return { tier: 1, color: "from-gray-500 to-slate-500" };
    if (level >= 10 && level <= 19) return { tier: 2, color: "from-blue-500 to-cyan-500" };
    if (level >= 20 && level <= 29) return { tier: 3, color: "from-purple-500 to-pink-500" };
    if (level >= 30) return { tier: 4, color: "from-yellow-500 to-orange-500" };
    return { tier: 1, color: "from-gray-500 to-slate-500" };
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-500 to-orange-500";
    if (rank === 2) return "from-gray-400 to-slate-400";
    if (rank === 3) return "from-orange-600 to-amber-600";
    if (rank <= 10) return "from-purple-500 to-pink-500";
    if (rank <= 50) return "from-blue-500 to-cyan-500";
    return "from-gray-600 to-slate-600";
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "👑";
    if (rank <= 50) return "⭐";
    return "🎖️";
  };

  const activeEntranceEffect = ownedEntranceEffects.find(e => e.is_active);

  const handleMessageUser = () => {
    setShowMessageDialog(true);
  };

  // Effect to handle tab parameter changes
  useEffect(() => {
    if (tabParam && isOwnProfile) {
      setActiveTab(tabParam);
    }
  }, [tabParam, isOwnProfile]);

  if (isLoading || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const tierInfo = getTierInfo(profileUser.level || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cover Photo */}
        {(coverPreview || profileUser.cover_photo || isEditing) && (
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            {coverPreview || profileUser.cover_photo ? (
              <img
                src={coverPreview || profileUser.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-900" />
            )}
            {isOwnProfile && isEditing && (
              <label className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Upload Cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Profile Header */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              {avatarPreview || profileUser.avatar ? (
                <img
                  src={avatarPreview || profileUser.avatar}
                  alt={profileUser.full_name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-500"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center ring-4 ring-purple-500`}>
                  <span className="text-white text-5xl font-bold">
                    {profileUser.full_name[0]?.toUpperCase()}
                  </span>
                </div>
              )}

              {isOwnProfile && isEditing && (
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3 mb-4">
                      <div>
                        <Label className="text-gray-400 text-sm mb-1 block">Display Name</Label>
                        <Input
                          value={editedDisplayName}
                          onChange={(e) => setEditedDisplayName(e.target.value)}
                          placeholder="Your display name"
                          className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm mb-1 block">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">@</span>
                          <Input
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="username"
                            className="bg-[#0a0a0f] border-[#2a2a3a] text-white pl-8"
                            maxLength={20}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {profileUser.display_name && (
                        <h1 className="text-3xl font-bold text-white mb-1">
                          {profileUser.display_name}
                        </h1>
                      )}
                      <h2 className="text-2xl font-semibold text-purple-400 mb-2">
                        {profileUser.username ? `@${profileUser.username}` : profileUser.full_name}
                      </h2>
                    </>
                  )}

                  {/* Only show email to the profile owner or admin */}
                  {(isOwnProfile || currentUser?.role === 'admin') && <p className="text-gray-400">{profileUser.email}</p>}
                  
                  {/* Only show username (or 'user') if not own profile and not admin */}
                  {!isOwnProfile && currentUser?.role !== 'admin' && (
                    <p className="text-gray-500 text-sm italic">@{profileUser.username || 'user'}</p>
                  )}
                  
                  {(isOwnProfile || currentUser?.role === 'admin') && profileUser.user_id && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-sm">ID: {profileUser.user_id}</span>
                      <button
                        onClick={copyUserId}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Block Button (retained in its original position for now as per implied structure by outline's omissions) */}
                {!isOwnProfile && (
                  <Button
                    onClick={() => setShowBlockDialog(true)}
                    variant="outline"
                    className={isBlocked ? "border-green-500 text-green-400 hover:bg-green-900" : "border-red-500 text-red-400 hover:bg-red-900"}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {isBlocked ? "Unblock" : "Block"}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`bg-gradient-to-r ${tierInfo.color} border-0 text-white px-3 py-1`}>
                  Level {profileUser.level || 1} • Tier {tierInfo.tier}
                </Badge>
                <OGBadge user={profileUser} />
                <TrollFamilyBadge user={profileUser} />
                {profileUser.is_troll_officer && (
                  <Badge className="bg-cyan-500 text-white border-0 px-3 py-1">
                    <Shield className="w-4 h-4 mr-1" />
                    Troll Officer
                  </Badge>
                )}
                {profileUser.role === 'admin' && (
                  <Badge className="bg-red-500 text-white border-0 px-3 py-1">
                    <Crown className="w-4 h-4 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isUploading || updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {isUploading || updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setAvatar(null);
                        setAvatarPreview("");
                        setCoverPhoto(null);
                        setCoverPreview("");
                      }}
                      variant="outline"
                      className="border-red-500 text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">
                  {profileUser.bio || "No bio yet."}
                </p>
              )}
            </div>
          </div>
        </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        {isOwnProfile ? (
          <>
            {!isEditing && ( // Only show edit button when not already editing
              <Button
                onClick={() => {
                  setIsEditing(true);
                  setEditedBio(profileUser.bio || "");
                  setEditedDisplayName(profileUser.display_name || "");
                  setEditedUsername(profileUser.username || "");
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            )}
            {/* Additional 'go live' or other owner-specific buttons could go here */}
          </>
        ) : (
          <>
            {!isFollowing ? (
              <Button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Follow
              </Button>
            ) : (
              <Button
                onClick={() => followMutation.mutate()} // Use followMutation for unfollow as well
                disabled={followMutation.isPending}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
              >
                <UserX className="w-5 h-5 mr-2 fill-current" />
                Following
              </Button>
            )}
            
            {/* Message Button - ALL USERS CAN MESSAGE (including admin) */}
            <Button
              onClick={handleMessageUser}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </Button>
          </>
        )}
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a1a24] border border-[#2a2a3a]">
            <TabsTrigger value="posts">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leaderboard">
              Top Supporters
              {topSupporters.length > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white border-0">{topSupporters.length}</Badge>
              )}
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="payment">
                Payment
              </TabsTrigger>
            )}
            {isOwnProfile && ownedEntranceEffects.length > 0 && (
              <TabsTrigger value="effects">Effects</TabsTrigger>
            )}
            {isOwnProfile && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {isOwnProfile && (
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Post
                </Button>
              </Card>
            )}

            {posts.length === 0 ? (
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
                <ImageIcon className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400">
                  {isOwnProfile ? "Share your first post!" : "No posts to show"}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    gifts={gifts}
                    onLike={() => likePostMutation.mutate(post.id)}
                    onComment={(comment) => commentMutation.mutate({ postId: post.id, comment })}
                    onSendGift={(gift) => {
                      setSelectedPost(post);
                      sendPostGiftMutation.mutate({ post, gift });
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Users className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{profileUser.follower_count || 0}</p>
                <p className="text-gray-400 text-sm">Followers</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Heart className="w-8 h-8 text-pink-400 mb-2" />
                <p className="text-2xl font-bold text-white">{profileUser.following_count || 0}</p>
                <p className="text-gray-400 text-sm">Following</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Coins className="w-8 h-8 text-yellow-400 mb-2" />
                <div>
                    <p className="text-gray-400 text-sm">Coins</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-xl">
                        {(profileUser.coins || 0).toLocaleString()}
                      </p>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        ≈ ${((profileUser.coins || 0) * 0.00625).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-green-400">{currentUser?.purchased_coins?.toLocaleString() || 0} Troll</span>
                  <span className="text-red-400">{currentUser?.free_coins?.toLocaleString() || 0} Free</span>
                </div>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                <p className="text-2xl font-bold text-white">{profileUser.total_views || 0}</p>
                <p className="text-gray-400 text-sm">Total Views</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Gift className="w-8 h-8 text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">{profileUser.total_gifts_received?.toLocaleString() || 0}</p>
                <p className="text-gray-400 text-sm">Gifts Received</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Sparkles className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">{profileUser.earned_coins?.toLocaleString() || 0}</p>
                <p className="text-gray-400 text-sm">Earned Coins</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Crown className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">Level {profileUser.level || 1}</p>
                <p className="text-gray-400 text-sm">Current Level</p>
              </Card>

              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                <Trophy className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{topSupporters.length}</p>
                <p className="text-gray-400 text-sm">Top Supporters</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-[#1a1a24] border-[#2a2a3a]">
              <div className="p-6 border-b border-[#2a2a3a]">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Top {topSupporters.length} Supporters
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Users who have sent the most gifts
                </p>
              </div>

              {topSupporters.length === 0 ? (
                <div className="p-12 text-center">
                  <Gift className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No supporters yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2a2a3a]">
                  {topSupporters.map((supporter, index) => (
                    <div key={supporter.id} className="p-4 hover:bg-[#0a0a0f] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(supporter.rank)} flex items-center justify-center`}>
                          <div className="text-center">
                            <div className="text-2xl">{getRankEmoji(supporter.rank)}</div>
                            <div className="text-white text-xs font-bold">#{supporter.rank}</div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {supporter.gifter_avatar ? (
                            <img
                              src={supporter.gifter_avatar}
                              alt={supporter.gifter_name}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center ring-2 ring-purple-500">
                              <span className="text-white font-bold text-xl">
                                {supporter.gifter_name[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">{supporter.gifter_username || supporter.gifter_name}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Coins className="w-4 h-4" />
                              <span className="font-bold">{supporter.total_coins_gifted.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-purple-400">
                              <Gift className="w-4 h-4" />
                              <span className="font-bold">{supporter.total_gifts_sent}</span>
                            </div>
                          </div>
                        </div>

                        {supporter.rank <= 10 && (
                          <Medal className={`w-8 h-8 ${
                            supporter.rank === 1 ? 'text-yellow-400' :
                            supporter.rank === 2 ? 'text-gray-400' :
                            supporter.rank === 3 ? 'text-orange-600' :
                            'text-purple-400'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* NEW: Payment Settings Tab */}
          {isOwnProfile && (
            <TabsContent value="payment">
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    Payment Method
                  </h3>
                  <Button
                    onClick={openPaymentDialog}
                    className="bg-purple-600 hover:bg-purple-700"
                    type="button"
                  >
                    Update Payment Method
                  </Button>
                </div>

                <div className="bg-[#0a0a0f] rounded-lg p-4">
                  {profileUser.payment_method ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Payment Method:</span>
                        <span className="text-white font-semibold capitalize">
                          {profileUser.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                      {(profileUser.payment_email || profileUser.payment_username) && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Account:</span>
                          <span className="text-white font-semibold">
                            {profileUser.payment_email || profileUser.payment_username}
                          </span>
                        </div>
                      )}
                       {profileUser.bank_account_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Bank Account:</span>
                          <span className="text-white font-semibold">
                            ****{profileUser.bank_account_number.slice(-4)}
                          </span>
                        </div>
                      )}
                      {profileUser.bank_routing_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Routing Number:</span>
                          <span className="text-white font-semibold">
                            ****{profileUser.bank_routing_number.slice(-4)}
                          </span>
                        </div>
                      )}
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                        <p className="text-green-300 text-sm">
                          ✅ Payment method configured. A $0.00 test payment will be sent to verify your account.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No payment method set</p>
                      <Button
                        onClick={openPaymentDialog}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        type="button"
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Verification Section */}
                <PaymentVerificationSection userId={profileUser.id} />
              </Card>
            </TabsContent>
          )}

          {isOwnProfile && ownedEntranceEffects.length > 0 && (
            <TabsContent value="effects">
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Entrance Effects
                  </h3>
                  <Button
                    onClick={() => setShowEntranceEffects(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Change Effect
                  </Button>
                </div>

                {activeEntranceEffect && (
                  <div className="bg-[#0a0a0f] rounded-lg p-4 border-2 border-purple-500">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">
                        {activeEntranceEffect.animation_type === 'fire' ? '🔥' :
                          activeEntranceEffect.animation_type === 'sparkle' ? '✨' :
                          activeEntranceEffect.animation_type === 'hearts' ? '❤️' :
                          activeEntranceEffect.animation_type === 'lightning' ? '⚡' : '🌟'}
                      </div>
                      <div>
                        <p className="text-white font-bold">{activeEntranceEffect.name}</p>
                        <p className="text-purple-400 text-sm">Active entrance effect</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          {isOwnProfile && (
            <TabsContent value="settings">
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6">
                <h3 className="text-xl font-bold text-white mb-6">Privacy Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Show Followers List</p>
                      <p className="text-gray-400 text-sm">Let others see who follows you</p>
                    </div>
                    <Button
                      onClick={async () => {
                        await base44.auth.updateMe({
                          show_followers_list: !profileUser.show_followers_list
                        });
                        queryClient.invalidateQueries(['profileUser']);
                        queryClient.invalidateQueries(['currentUser']);
                        toast.success(profileUser.show_followers_list ? "Followers list hidden" : "Followers list visible");
                      }}
                      className={profileUser.show_followers_list !== false ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}
                    >
                      {profileUser.show_followers_list !== false ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="h-px bg-[#2a2a3a]" />

                  <div className="bg-[#0a0a0f] rounded-lg p-4">
                    <h4 className="text-white font-bold mb-2">Streaming Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Streaming Hours:</span>
                        <span className="text-yellow-400 font-bold">{(profileUser.total_streaming_hours || 0).toFixed(1)} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hours Since Last Payout:</span>
                        <span className="text-cyan-400 font-bold">{(profileUser.hours_since_last_payout || 0).toFixed(1)} hrs</span>
                      </div>
                      {profileUser.last_payout_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Payout:</span>
                          <span className="text-green-400">{new Date(profileUser.last_payout_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
                        <p className="text-purple-400 text-xs">
                          💡 Stream 72 hours total for automatic level upgrade!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => { setPostType("text"); setPostMedia(null); setPostMediaPreview(""); }}
                className={postType === "text" ? "bg-purple-600" : "bg-[#2a2a3a]"}
              >
                Text
              </Button>
              <Button
                onClick={() => { setPostType("image"); setPostMedia(null); setPostMediaPreview(""); }}
                className={postType === "image" ? "bg-purple-600" : "bg-[#2a2a3a]"}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                onClick={() => { setPostType("video"); setPostMedia(null); setPostMediaPreview(""); }}
                className={postType === "video" ? "bg-purple-600" : "bg-[#2a2a3a]"}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>

            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="bg-[#0a0a0f] border-[#2a2a3a] text-white min-h-[120px]"
              maxLength={1000}
            />

            {(postType === "image" || postType === "video") && (
              <div>
                <Label className="block text-sm text-gray-400 mb-2">
                  Upload {postType === "image" ? "Image" : "Video"}
                </Label>
                {postMediaPreview && (
                  <div className="mb-3">
                    {postType === "image" ? (
                      <img src={postMediaPreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
                    ) : (
                      <video src={postMediaPreview} controls className="w-full max-h-64 rounded-lg" />
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  accept={postType === "image" ? "image/*" : "video/*"}
                  onChange={handlePostMediaChange}
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreatePost(false)}
                variant="outline"
                className="flex-1 border-[#2a2a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createPostMutation.mutate({ content: postContent })}
                disabled={!postContent.trim() || isUploading || createPostMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isUploading || createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              Send Message to {profileUser.username || profileUser.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-[#0a0a0f] p-4 rounded-lg flex items-center gap-3">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {profileUser.full_name[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-bold">{profileUser.username || profileUser.full_name}</p>
                <p className="text-gray-400 text-sm">{profileUser.full_name}</p>
              </div>
            </div>

            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="bg-[#0a0a0f] border-[#2a2a3a] text-white min-h-[120px]"
              maxLength={1000}
            />

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessageText("");
                }}
                variant="outline"
                className="flex-1 border-[#2a2a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => sendMessageMutation.mutate(messageText)}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                {sendMessageMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entrance Effects Dialog */}
      {showEntranceEffects && (
        <Dialog open={showEntranceEffects} onOpenChange={setShowEntranceEffects}>
          <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Select Entrance Effect
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              {ownedEntranceEffects.map((userEffect) => {
                const effectDetails = availableEntranceEffects.find(e => e.id === userEffect.effect_id);
                if (!effectDetails) return null;

                const effectEmoji = effectDetails.animation_type === 'fire' ? '🔥' :
                  effectDetails.animation_type === 'sparkle' ? '✨' :
                  effectDetails.animation_type === 'hearts' ? '❤️' :
                  effectDetails.animation_type === 'lightning' ? '⚡' : '🌟';

                return (
                  <button
                    key={userEffect.id}
                    onClick={() => setActiveEntranceEffectMutation.mutate(userEffect.effect_id)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      userEffect.is_active
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-[#2a2a3a] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-5xl mb-3">{effectEmoji}</div>
                    <p className="text-white font-bold mb-1">{effectDetails.name}</p>
                    {userEffect.is_active && (
                      <Badge className="bg-purple-500 text-white mt-2">
                        Active
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Block/Unblock Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              {isBlocked ? "Unblock User" : "Block User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-[#0a0a0f] p-4 rounded-lg">
              <p className="text-white mb-2">
                {isBlocked
                  ? `Unblock ${profileUser.username || profileUser.full_name}?`
                  : `Block ${profileUser.username || profileUser.full_name}?`
                }
              </p>
              <p className="text-gray-400 text-sm">
                {isBlocked
                  ? "This user will be able to interact with you again."
                  : "This user won't be able to see your posts or interact with you."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowBlockDialog(false)}
                variant="outline"
                className="flex-1 border-[#2a2a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => blockUserMutation.mutate()}
                disabled={blockUserMutation.isPending}
                className={isBlocked ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1 bg-red-600 hover:bg-red-700"}
              >
                {blockUserMutation.isPending ? "Processing..." : (isBlocked ? "Unblock" : "Block")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Update Payment Method
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-xs">
                💰 This is where you'll receive your payout when you cash out your earned coins.
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label className="text-white mb-2 block">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-[#2a2a3a]">
                  <SelectItem value="paypal" className="text-white">PayPal</SelectItem>
                  <SelectItem value="cashapp" className="text-white">Cash App</SelectItem>
                  <SelectItem value="venmo" className="text-white">Venmo</SelectItem>
                  <SelectItem value="bank_transfer" className="text-white">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PayPal Email */}
            {paymentMethod === "paypal" && (
              <div>
                <Label className="text-white mb-2 block">PayPal Email *</Label>
                <Input
                  type="email"
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                />
              </div>
            )}

            {/* CashApp/Venmo Username */}
            {(paymentMethod === "cashapp" || paymentMethod === "venmo") && (
              <div>
                <Label className="text-white mb-2 block">
                  {paymentMethod === "cashapp" ? "Cash App Tag" : "Venmo Username"} *
                </Label>
                <div className="relative">
                  {paymentMethod === "cashapp" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold text-lg">
                      $
                    </span>
                  )}
                  <Input
                    value={paymentUsername}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove $ if user tries to type it for CashApp
                      if (paymentMethod === "cashapp") {
                        value = value.replace(/\$/g, "");
                      }
                      setPaymentUsername(value);
                    }}
                    placeholder={paymentMethod === "cashapp" ? "YourCashtag" : "@YourVenmo"}
                    className={`bg-[#0a0a0f] border-[#2a2a3a] text-white ${paymentMethod === "cashapp" ? "pl-7" : ""}`}
                  />
                </div>
                {paymentMethod === "cashapp" && (
                  <p className="text-xs text-gray-500 mt-1">$ will be added automatically</p>
                )}
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === "bank_transfer" && (
              <>
                <div>
                  <Label className="text-white mb-2 block">Bank Account Number *</Label>
                  <Input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Account number"
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                    type="password" // Use type="password" for sensitive numbers
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Routing Number *</Label>
                  <Input
                    value={bankRouting}
                    onChange={(e) => setBankRouting(e.target.value)}
                    placeholder="Routing number"
                    className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPaymentDialog(false)}
                variant="outline"
                className="flex-1 border-[#2a2a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updatePaymentMutation.mutate()}
                disabled={!paymentMethod || updatePaymentMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updatePaymentMutation.isPending ? "Updating..." : "Save Payment Method"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              🔒 Your payment information is encrypted and secure
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostCard({ post, currentUser, gifts, onLike, onComment, onSendGift }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showGiftDialog, setShowGiftDialog] = useState(false);

  // Removed the useQuery for postComments as per the change request
  // const { data: comments = [] } = useQuery({
  //   queryKey: ['postComments', post.id],
  //   queryFn: () => base44.entities.PostComment.filter({ post_id: post.id }, "-created_date"),
  //   enabled: showComments,
  //   initialData: [],
  // });

  const { data: postGifts = [] } = useQuery({
    queryKey: ['postGifts', post.id],
    queryFn: () => base44.entities.PostGift.filter({ post_id: post.id }),
    initialData: [],
  });

  const { data: postLikes = [] } = useQuery({
    queryKey: ['postLikes', post.id],
    queryFn: () => base44.entities.PostLike.filter({ post_id: post.id }),
    initialData: [],
  });

  const isLikedByCurrentUser = currentUser && postLikes.some(like => like.user_id === currentUser.id);

  return (
    <Card className="bg-[#1a1a24] border-[#2a2a3a] overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <UserLink userId={post.user_id} className="flex items-center gap-3">
          {post.user_avatar ? (
            <img src={post.user_avatar} alt={post.user_name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{post.user_name[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-white font-bold hover:text-purple-400 transition-colors">{post.username || post.user_name}</p>
            <p className="text-gray-400 text-xs">
              {new Date(post.created_date).toLocaleDateString()} at {new Date(post.created_date).toLocaleTimeString()}
            </p>
          </div>
        </UserLink>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </Button>
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-white">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_url && (
        <div className="w-full">
          {post.post_type === "image" && (
            <img src={post.media_url} alt="Post" className="w-full max-h-96 object-contain" />
          )}
          {post.post_type === "video" && (
            <video src={post.media_url} controls className="w-full max-h-96" />
          )}
        </div>
      )}

      {/* Gifts Display */}
      {postGifts.length > 0 && (
        <div className="px-4 py-2 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm">Gifts:</span>
            {postGifts.slice(0, 5).map((gift, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="text-xl">{gift.emoji}</span>
                <span className="text-yellow-400 text-sm">{gift.coin_value}</span>
                {gift.is_purchased_coins && (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                )}
              </div>
            ))}
            {postGifts.length > 5 && (
              <span className="text-gray-400 text-sm">+{postGifts.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      {/* Stats - Show counts only, not who liked/commented */}
      <div className="px-4 py-2 border-t border-[#2a2a3a] flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>{post.likes_count || 0} likes</span>
          <span>{post.comments_count || 0} comments</span>
          <span>{post.total_gifts || 0} coins gifted</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-[#2a2a3a] flex items-center gap-3">
        <Button
          onClick={onLike}
          variant="ghost"
          className={`flex-1 text-gray-400 ${isLikedByCurrentUser ? 'text-pink-500 hover:text-pink-400' : 'hover:text-pink-400'}`}
        >
          <Heart className={`w-5 h-5 mr-2 ${isLikedByCurrentUser ? 'fill-pink-500' : ''}`} />
          Like
        </Button>
        <Button
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          className="flex-1 text-gray-400 hover:text-blue-400"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment
        </Button>
        <Button
          onClick={() => setShowGiftDialog(true)}
          variant="ghost"
          className="flex-1 text-gray-400 hover:text-yellow-400"
        >
          <Gift className="w-5 h-5 mr-2" />
          Gift
        </Button>
        <Button
          variant="ghost"
          className="flex-1 text-gray-400 hover:text-purple-400"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Comments Section - Don't show who commented, just show comment count */}
      {showComments && (
        <div className="px-4 py-3 border-t border-[#2a2a3a] space-y-3">
          {currentUser && (
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
              />
              <Button
                onClick={() => {
                  onComment(commentText);
                  setCommentText("");
                }}
                disabled={!commentText.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="bg-[#0a0a0f] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">
              {post.comments_count || 0} {post.comments_count === 1 ? 'comment' : 'comments'}
            </p>
            <p className="text-gray-500 text-xs mt-1">Comments are private</p>
          </div>
        </div>
      )}

      {/* Gift Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              Send Gift to {post.username || post.user_name}
            </DialogTitle>
          </DialogHeader>

          {currentUser && (
            <div className="bg-[#0a0a0f] p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Balance:</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xl">
                    {currentUser.coins?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">Purchased:</span>
                <span className="text-green-400 flex items-center gap-1">
                  {currentUser.purchased_coins || 0} <CheckCircle className="w-3 h-3" />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Free:</span>
                <span className="text-gray-400">{currentUser.free_coins || 0}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto pr-4">
            {gifts.length === 0 ? (
              <p className="col-span-3 text-gray-500 text-center">No gifts available.</p>
            ) : (
              gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => {
                    onSendGift(gift);
                    setShowGiftDialog(false);
                  }}
                  className="p-4 rounded-xl border-2 border-[#2a2a3a] hover:border-yellow-400 transition-all"
                  disabled={currentUser && (currentUser.coins || 0) < gift.coin_value}
                >
                  <div className="text-4xl mb-2">{gift.emoji}</div>
                  <p className="text-white text-sm font-bold">{gift.name}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">{gift.coin_value}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
