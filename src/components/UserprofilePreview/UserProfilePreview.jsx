
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import OGBadge from "@/components/og-badge";
import {
  User,
  MessageCircle,
  UserPlus,
  UserX,
  Ban,
  Shield,
  Crown,
  Eye,
  Heart,
  Coins,
  Trophy,
  X
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePreview({ userId, children }) {
  const queryClient = useQueryClient();
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  // Internal state to manage the dialog's open/close status
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Effect to manage dialog open state based on userId prop
  useEffect(() => {
    if (userId) {
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      // Optionally reset other states when dialog closes
      setShowMessageBox(false);
      setMessageText("");
    }
  }, [userId]);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = currentUser?.role === 'admin';

  const { data: previewUser, isLoading } = useQuery({
    queryKey: ['previewUser', userId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: userId });
      return users[0];
    },
    enabled: !!userId && isDialogOpen, // Enable query only when dialog is open and userId is present
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['isFollowing', userId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.id === userId) return false;
      const follows = await base44.entities.Follow.filter({
        follower_id: currentUser.id,
        following_id: userId
      });
      return follows.length > 0;
    },
    enabled: !!currentUser && !!userId && currentUser.id !== userId && isDialogOpen,
  });

  const { data: isBlocked } = useQuery({
    queryKey: ['isBlocked', userId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.id === userId) return null;
      const blocks = await base44.entities.BlockedUser.filter({
        blocker_id: currentUser.id,
        blocked_id: userId
      });
      return blocks.length > 0 ? blocks[0] : null;
    },
    enabled: !!currentUser && !!userId && currentUser.id !== userId && isDialogOpen,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const follows = await base44.entities.Follow.filter({
          follower_id: currentUser.id,
          following_id: userId
        });
        if (follows[0]) {
          await base44.entities.Follow.delete(follows[0].id);
        }
        await base44.entities.User.update(userId, {
          follower_count: Math.max(0, (previewUser.follower_count || 0) - 1)
        });
        await base44.auth.updateMe({
          following_count: Math.max(0, (currentUser.following_count || 0) - 1)
        });
      } else {
        await base44.entities.Follow.create({
          follower_id: currentUser.id,
          following_id: userId,
          follower_name: currentUser.full_name,
          following_name: previewUser.full_name
        });
        await base44.entities.User.update(userId, {
          follower_count: (previewUser.follower_count || 0) + 1
        });
        await base44.auth.updateMe({
          following_count: (currentUser.following_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['isFollowing']);
      queryClient.invalidateQueries(['previewUser']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success(isFollowing ? "Unfollowed!" : "Following!");
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (isBlocked) {
        await base44.entities.BlockedUser.delete(isBlocked.id);
      } else {
        await base44.entities.BlockedUser.create({
          blocker_id: currentUser.id,
          blocker_name: currentUser.full_name,
          blocked_id: userId,
          blocked_name: previewUser.full_name,
          blocked_username: previewUser.username || previewUser.full_name,
          reason: "Blocked from preview"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['isBlocked']);
      toast.success(isBlocked ? "User unblocked" : "User blocked");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      // Check if conversation exists
      let conversations = await base44.entities.Conversation.filter({
        participant1_id: currentUser.id,
        participant2_id: userId
      });

      if (conversations.length === 0) {
        // Check reverse
        conversations = await base44.entities.Conversation.filter({
          participant1_id: userId,
          participant2_id: currentUser.id
        });
      }

      let conversation;
      if (conversations.length === 0) {
        // Create new conversation
        conversation = await base44.entities.Conversation.create({
          participant1_id: currentUser.id,
          participant1_name: currentUser.full_name,
          participant1_username: currentUser.username || currentUser.full_name,
          participant1_avatar: currentUser.avatar,
          participant2_id: userId,
          participant2_name: previewUser.full_name,
          participant2_username: previewUser.username || previewUser.full_name,
          participant2_avatar: previewUser.avatar,
          last_message: message,
          last_message_time: new Date().toISOString(),
          unread_count_p2: 1
        });
      } else {
        conversation = conversations[0];
        // Update conversation
        const isP1 = conversation.participant1_id === currentUser.id;
        await base44.entities.Conversation.update(conversation.id, {
          last_message: message,
          last_message_time: new Date().toISOString(),
          [isP1 ? 'unread_count_p2' : 'unread_count_p1']:
            (isP1 ? conversation.unread_count_p2 : conversation.unread_count_p1) + 1
        });
      }

      // Create message
      await base44.entities.DirectMessage.create({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_username: currentUser.username || currentUser.full_name,
        sender_avatar: currentUser.avatar,
        receiver_id: userId,
        receiver_name: previewUser.full_name,
        message: message
      });
    },
    onSuccess: () => {
      toast.success("Message sent!");
      setMessageText("");
      setShowMessageBox(false);
    },
  });

  const getTierInfo = (level) => {
    if (level >= 1 && level <= 9) return { tier: 1, color: "from-gray-500 to-slate-500" };
    if (level >= 10 && level <= 19) return { tier: 2, color: "from-blue-500 to-cyan-500" };
    if (level >= 20 && level <= 29) return { tier: 3, color: "from-purple-500 to-pink-500" };
    if (level >= 30) return { tier: 4, color: "from-yellow-500 to-orange-500" };
    return { tier: 1, color: "from-gray-500 to-slate-500" };
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // If the parent component manages `userId` state to open this dialog,
    // the parent would need to clear `userId` to fully dismiss it.
    // This component only controls its own internal dialog visibility.
  };

  const handleViewFullProfile = () => {
    setIsDialogOpen(false); // Close the preview dialog
    // Force navigation with href instead of hash
    window.location.href = `/#/Profile?userId=${userId}`;
    // Force reload to ensure profile loads
    window.location.reload();
  };

  if (!isDialogOpen || !userId) return null; // Only render if dialog should be open and userId is present

  if (isLoading || !previewUser) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const tierInfo = getTierInfo(previewUser.level || 1);
  const isOwnProfile = currentUser?.id === userId;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-md">
        <button
          onClick={handleCloseDialog}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-4">
            {previewUser.avatar ? (
              <img
                src={previewUser.avatar}
                alt={previewUser.full_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500"
              />
            ) : (
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center ring-4 ring-purple-500`}>
                <span className="text-white text-3xl font-bold">
                  {previewUser.full_name[0]?.toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white truncate">
                  {previewUser.username || 'User'}
                </p>
                <OGBadge user={previewUser} className="text-xs px-1 py-0" />
              </div>
              {/* Only show full name to admin */}
              {isAdmin && (
                <p className="text-gray-400 text-sm truncate">{previewUser.full_name}</p>
              )}
              {/* Only show email to admin */}
              {isAdmin && (
                <p className="text-gray-500 text-xs truncate">{previewUser.email}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={`bg-gradient-to-r ${tierInfo.color} border-0 text-white text-xs`}>
                  Level {previewUser.level || 1} • Tier {tierInfo.tier}
                </Badge>
                {previewUser.is_troll_officer && (
                  <Badge className="bg-cyan-500 text-white border-0 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Officer
                  </Badge>
                )}
                {previewUser.role === 'admin' && (
                  <Badge className="bg-red-500 text-white border-0 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {previewUser.bio && (
            <p className="text-gray-300 text-sm">{previewUser.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0a0a0f] p-3 rounded-lg text-center">
              <Eye className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{previewUser.follower_count || 0}</p>
              <p className="text-gray-400 text-xs">Followers</p>
            </div>
            <div className="bg-[#0a0a0f] p-3 rounded-lg text-center">
              <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{previewUser.following_count || 0}</p>
              <p className="text-gray-400 text-xs">Following</p>
            </div>
            <div className="bg-[#0a0a0f] p-3 rounded-lg text-center">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{previewUser.coins?.toLocaleString() || 0}</p>
              <p className="text-gray-400 text-xs">Coins</p>
            </div>
          </div>

          {/* Message Box */}
          {showMessageBox && !isOwnProfile && (
            <div className="space-y-3 bg-[#0a0a0f] p-4 rounded-lg">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="bg-[#1a1a24] border-[#2a2a3a] text-white min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowMessageBox(false)}
                  variant="outline"
                  className="flex-1 border-[#2a2a3a]"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => sendMessageMutation.mutate(messageText)}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  size="sm"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="space-y-2">
              <Button
                onClick={handleViewFullProfile}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <User className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>

              {!showMessageBox && (
                <Button
                  onClick={() => setShowMessageBox(true)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isFollowing ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => blockMutation.mutate()}
                  disabled={blockMutation.isPending}
                  variant="outline"
                  className={isBlocked ? "border-green-500 text-green-400 hover:bg-green-900" : "border-red-500 text-red-400 hover:bg-red-900"}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>
            </div>
          )}

          {isOwnProfile && (
            <Button
              onClick={handleViewFullProfile}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <User className="w-4 h-4 mr-2" />
              View My Profile
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
