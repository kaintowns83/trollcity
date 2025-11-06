
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Radio, Heart, UserPlus, UserCheck, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import OGBadge from "../OGBadge";
import { useNavigate } from "react-router-dom";

export default function StreamCard({ stream }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['isFollowing', stream.streamer_id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.id === stream.streamer_id) return false;
      const follows = await base44.entities.Follow.filter({
        follower_id: currentUser.id,
        following_id: stream.streamer_id
      });
      return follows.length > 0;
    },
    enabled: !!currentUser && currentUser.id !== stream.streamer_id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const follows = await base44.entities.Follow.filter({
          follower_id: currentUser.id,
          following_id: stream.streamer_id
        });
        if (follows[0]) {
          await base44.entities.Follow.delete(follows[0].id);
        }
        
        // Update counts via backend function for service role access
        try {
          await base44.functions.invoke('updateFollowCounts', {
            userId: stream.streamer_id,
            followerId: currentUser.id,
            action: 'unfollow'
          });
        } catch (error) {
          console.error("Failed to update follow counts:", error);
        }
      } else {
        await base44.entities.Follow.create({
          follower_id: currentUser.id,
          following_id: stream.streamer_id,
          follower_name: currentUser.full_name,
          following_name: stream.streamer_name
        });
        
        // Update counts and send notification via backend
        try {
          await base44.functions.invoke('updateFollowCounts', {
            userId: stream.streamer_id,
            followerId: currentUser.id,
            followerName: currentUser.username || currentUser.full_name,
            action: 'follow'
          });
        } catch (error) {
          console.error("Failed to update follow counts:", error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['isFollowing']);
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['streams']);
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Stream.update(stream.id, {
        status: "ended"
      });

      await base44.entities.ModerationAction.create({
        moderator_id: currentUser.id,
        moderator_name: currentUser.username || currentUser.full_name,
        target_user_id: stream.streamer_id,
        target_username: stream.streamer_name,
        action_type: "stream_ended",
        reason: "Ended by Troll Officer (Level 80+)",
        stream_id: stream.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['streams']);
      toast.success("Stream ended by Troll Officer");
    },
    onError: (error) => {
      toast.error("Failed to end stream: " + error.message);
    }
  });

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error("Please login to follow");
      return;
    }
    followMutation.mutate();
  };

  const handleEndStreamClick = (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to end this stream? This action cannot be undone.")) {
      endStreamMutation.mutate();
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking a button
    if (e.target.closest('button')) {
      return;
    }
    
    console.log('🔵 StreamCard - Navigating to stream:', stream.id);
    // Use navigate with absolute path
    navigate(`/StreamViewer?id=${stream.id}`);
  };

  const isOwnStream = currentUser?.id === stream.streamer_id;
  const canEndStream = currentUser?.is_troll_officer && (currentUser?.level >= 80) && !isOwnStream;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className="bg-[#1a1a24] border-[#2a2a3a] overflow-hidden hover:border-purple-500 transition-all group relative"
        style={{ cursor: 'pointer' }}
      >
        <div 
          onClick={handleCardClick}
          className="relative aspect-[16/10]"
        >
          {stream.thumbnail ? (
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
              <Radio className="w-12 h-12 text-gray-500" />
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2" />
              LIVE
            </Badge>
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-2">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              <Eye className="w-3 h-3 mr-1" />
              {stream.viewer_count || 0}
            </Badge>
            {!isOwnStream && currentUser && (
              <Button
                onClick={handleFollowClick}
                disabled={followMutation.isPending}
                size="sm"
                className={`${
                  isFollowing 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-purple-600 hover:bg-purple-700"
                } opacity-0 group-hover:opacity-100 transition-opacity z-10`}
              >
                {isFollowing ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>
            )}
            {canEndStream && (
              <Button
                onClick={handleEndStreamClick}
                disabled={endStreamMutation.isPending}
                size="sm"
                className="bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="End Stream (Troll Officer)"
              >
                <Shield className="w-4 h-4" />
              </Button>
            )}
          </div>

          {stream.total_gifts > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-yellow-500/80 text-white backdrop-blur-sm">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                {stream.total_gifts}
              </Badge>
            </div>
          )}
        </div>

        <div 
          onClick={handleCardClick}
          className="p-4"
        >
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {stream.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            {stream.streamer_avatar ? (
              <img
                src={stream.streamer_avatar}
                alt={stream.streamer_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {stream.streamer_name[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-purple-400 text-sm font-semibold truncate">
                {stream.streamer_name}
              </p>
            </div>
            <OGBadge user={{ created_date: stream.streamer_created_date }} className="text-xs" />
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500 text-xs">
              {stream.category}
            </Badge>
            {stream.streamer_follower_count > 0 && (
              <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                {stream.streamer_follower_count} followers
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
