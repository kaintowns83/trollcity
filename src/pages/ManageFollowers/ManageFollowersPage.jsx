import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Trash2, Search, Filter, UserMinus, AlertCircle, Calendar, Eye, Gift, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { differenceInDays } from "date-fns";

export default function ManageFollowersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'selected' | 'category'

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Get all follows where current user is being followed
  const { data: followers = [], isLoading } = useQuery({
    queryKey: ['myFollowers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const follows = await base44.entities.Follow.filter({ following_id: user.id }, "-created_date");
      
      // Get user data for each follower
      const followersWithData = await Promise.all(
        follows.map(async (follow) => {
          try {
            const followerUsers = await base44.entities.User.filter({ id: follow.follower_id });
            const followerUser = followerUsers[0];
            
            if (!followerUser) return null;

            // Check activity - last stream, gifts sent, etc.
            const streams = await base44.entities.Stream.filter({ streamer_id: follow.follower_id }, "-created_date", 1);
            const giftsSent = await base44.entities.StreamGift.filter({ sender_id: follow.follower_id });

            return {
              ...follow,
              user: followerUser,
              lastStream: streams[0],
              totalGiftsSent: giftsSent.reduce((sum, g) => sum + (g.coin_value || 0), 0),
              giftsCount: giftsSent.length,
              daysSinceFollow: differenceInDays(new Date(), new Date(follow.created_date))
            };
          } catch (error) {
            console.error("Error fetching follower data:", error);
            return null;
          }
        })
      );

      return followersWithData.filter(f => f !== null);
    },
    enabled: !!user?.id,
    initialData: [],
  });

  // Categorize followers
  const categorizeFollower = (follower) => {
    const categories = [];

    // Inactive (no activity in 30+ days)
    if (follower.daysSinceFollow > 30 && !follower.lastStream && follower.giftsCount === 0) {
      categories.push('inactive');
    }

    // New (followed within 7 days)
    if (follower.daysSinceFollow <= 7) {
      categories.push('new');
    }

    // Active supporters (sent gifts)
    if (follower.giftsCount > 0) {
      categories.push('supporters');
    }

    // Zero activity (never interacted)
    if (follower.giftsCount === 0 && !follower.lastStream) {
      categories.push('zero_activity');
    }

    // Streamers (have streamed before)
    if (follower.lastStream) {
      categories.push('streamers');
    }

    return categories;
  };

  // Filter followers by category
  const filteredFollowers = followers.filter(follower => {
    // Search filter
    const matchesSearch = !searchQuery || 
      follower.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      follower.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (filterCategory === 'all') return true;

    const categories = categorizeFollower(follower);
    return categories.includes(filterCategory);
  });

  // Get category counts
  const getCategoryCounts = () => {
    const counts = {
      all: followers.length,
      inactive: 0,
      new: 0,
      supporters: 0,
      zero_activity: 0,
      streamers: 0
    };

    followers.forEach(follower => {
      const categories = categorizeFollower(follower);
      categories.forEach(cat => {
        if (counts[cat] !== undefined) counts[cat]++;
      });
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Remove followers mutation
  const removeFollowersMutation = useMutation({
    mutationFn: async (followerIds) => {
      // Remove follow records
      for (const id of followerIds) {
        const follow = followers.find(f => f.follower_id === id);
        if (follow) {
          await base44.entities.Follow.delete(follow.id);
        }
      }

      // Update follower count
      await base44.auth.updateMe({
        follower_count: Math.max(0, (user.follower_count || 0) - followerIds.length)
      });

      // Update following count for each removed follower
      for (const id of followerIds) {
        const followerUser = followers.find(f => f.follower_id === id)?.user;
        if (followerUser) {
          await base44.entities.User.update(id, {
            following_count: Math.max(0, (followerUser.following_count || 0) - 1)
          });
        }
      }
    },
    onSuccess: (_, followerIds) => {
      queryClient.invalidateQueries(['myFollowers']);
      queryClient.invalidateQueries(['currentUser']);
      setSelectedFollowers([]);
      setShowDeleteDialog(false);
      toast.success(`Removed ${followerIds.length} follower${followerIds.length !== 1 ? 's' : ''}`);
    },
    onError: (error) => {
      toast.error("Failed to remove followers: " + error.message);
    }
  });

  const handleSelectFollower = (followerId) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFollowers.length === filteredFollowers.length) {
      setSelectedFollowers([]);
    } else {
      setSelectedFollowers(filteredFollowers.map(f => f.follower_id));
    }
  };

  const handleRemoveSelected = () => {
    setDeleteMode('selected');
    setShowDeleteDialog(true);
  };

  const handleRemoveByCategory = () => {
    setDeleteMode('category');
    setShowDeleteDialog(true);
  };

  const confirmRemoval = () => {
    if (deleteMode === 'selected') {
      removeFollowersMutation.mutate(selectedFollowers);
    } else if (deleteMode === 'category') {
      const categoryFollowerIds = filteredFollowers.map(f => f.follower_id);
      removeFollowersMutation.mutate(categoryFollowerIds);
    }
  };

  const categories = [
    { value: 'all', label: 'All Followers', icon: Users, color: 'text-purple-400' },
    { value: 'inactive', label: 'Inactive (30+ days)', icon: AlertCircle, color: 'text-red-400' },
    { value: 'new', label: 'New (7 days)', icon: Calendar, color: 'text-green-400' },
    { value: 'supporters', label: 'Supporters (Sent Gifts)', icon: Gift, color: 'text-yellow-400' },
    { value: 'zero_activity', label: 'Zero Activity', icon: UserMinus, color: 'text-gray-400' },
    { value: 'streamers', label: 'Streamers', icon: Eye, color: 'text-cyan-400' },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Manage Followers</h1>
          </div>
          <p className="text-gray-400 text-lg">Organize and clean up your follower list</p>
        </div>

        {/* Search and Actions */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search followers by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white pl-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="border-[#2a2a3a] text-gray-300"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedFollowers.length === filteredFollowers.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleRemoveSelected}
                disabled={selectedFollowers.length === 0 || removeFollowersMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove ({selectedFollowers.length})
              </Button>
            </div>
          </div>

          {/* Selected count indicator */}
          {selectedFollowers.length > 0 && (
            <motion.div
