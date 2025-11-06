
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, UserPlus, Users, Radio, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StreamCard from "../components/stream/StreamCard";
import UserLink from "../components/UserLink";
import { motion } from "framer-motion";

export default function FollowingPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: follows } = useQuery({
    queryKey: ['follows', user?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user.id }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: streams, isLoading: streamsLoading } = useQuery({
    queryKey: ['followingStreams'],
    queryFn: async () => {
      const allStreams = await base44.entities.Stream.filter({ status: "live" });
      const followingIds = follows.map(f => f.following_id);
      return allStreams.filter(s => followingIds.includes(s.streamer_id));
    },
    initialData: [],
    enabled: follows.length > 0,
    staleTime: 500,
    refetchInterval: 20000, // Update every 20 seconds
  });

  // Get all followed users with their online status
  const { data: followedUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['followedUsers', user?.id, follows],
    queryFn: async () => {
      if (!follows || follows.length === 0) return [];
      
      const followingIds = follows.map(f => f.following_id);
      
      // Get all followed users
      const usersPromises = followingIds.map(async (userId) => {
        try {
          const users = await base44.entities.User.filter({ id: userId });
          return users[0] || null;
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          return null;
        }
      });
      
      const users = await Promise.all(usersPromises);
      const validUsers = users.filter(u => u !== null);
      
      // Check which users are currently streaming
      const liveStreamers = streams.map(s => s.streamer_id);
      
      // Add online status to users
      const usersWithStatus = validUsers.map(u => ({
        ...u,
        isOnline: liveStreamers.includes(u.id),
        currentStream: streams.find(s => s.streamer_id === u.id)
      }));
      
      // Sort: online first, then by name
      return usersWithStatus.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (a.username || a.full_name).localeCompare(b.username || a.full_name);
      });
    },
    enabled: !!user?.id && follows.length > 0,
    initialData: [],
    refetchInterval: 5000,
  });

  const onlineCount = followedUsers.filter(u => u.isOnline).length;
  const offlineCount = followedUsers.filter(u => !u.isOnline).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-white">Following</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-400 text-lg">People you follow</p>
            {follows.length > 0 && (
              <>
                <Badge className="bg-green-500/20 text-green-400 border-green-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  {onlineCount} Online
                </Badge>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">
                  {offlineCount} Offline
                </Badge>
              </>
            )}
          </div>
        </div>

        {follows.length === 0 ? (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
            <UserPlus className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">You're not following anyone yet</h3>
            <p className="text-gray-500 mb-6">Follow streamers to see their content here</p>
            <Button 
              onClick={() => window.location.href = '/#/Home'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Discover Streamers
            </Button>
          </Card>
        ) : (
          <>
            {/* Live Streams Section */}
            {streams.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <Radio className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold text-white">Live Now</h2>
                  <Badge className="bg-red-500 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2" />
                    {streams.length}
                  </Badge>
                </div>
                {streamsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[16/10] w-full bg-[#1a1a24]" />
                        <Skeleton className="h-4 w-3/4 bg-[#1a1a24]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {streams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Followed Users Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">All Following</h2>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                  {follows.length}
                </Badge>
              </div>

              {usersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full bg-[#0a0a0f]" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2 bg-[#0a0a0f]" />
                          <Skeleton className="h-3 w-16 bg-[#0a0a0f]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {followedUsers.map((followedUser, index) => (
                    <motion.div
                      key={followedUser.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`bg-[#1a1a24] border-[#2a2a3a] p-4 hover:border-purple-500 transition-all cursor-pointer ${
                        followedUser.isOnline ? 'border-green-500/50' : ''
                      }`}>
                        <UserLink userId={followedUser.id} className="block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                              {followedUser.avatar ? (
                                <img 
                                  src={followedUser.avatar}
                                  alt={followedUser.username || followedUser.full_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {(followedUser.username || followedUser.full_name)[0]?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {/* Online Status Indicator */}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1a1a24] ${
                                followedUser.isOnline ? 'bg-green-500' : 'bg-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate hover:text-purple-400 transition-colors">
                                {followedUser.username || 'User'}
                              </p>
                              <p className="text-gray-400 text-sm truncate">
                                {user?.role === 'admin' ? followedUser.full_name : `@${followedUser.username || 'user'}`}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {followedUser.isOnline ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500 w-full justify-center">
                              <Radio className="w-3 h-3 mr-1" />
                              Live Now
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500 w-full justify-center">
                              Offline
                            </Badge>
                          )}

                          {/* Current Stream Info */}
                          {followedUser.currentStream && (
                            <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
                              <p className="text-white text-sm font-medium mb-1 line-clamp-1">
                                {followedUser.currentStream.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                  {followedUser.currentStream.category}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {followedUser.currentStream.viewer_count || 0}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* User Stats */}
                          {!followedUser.isOnline && (
                            <div className="mt-3 pt-3 border-t border-[#2a2a3a] flex items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {followedUser.follower_count || 0} followers
                              </div>
                              {followedUser.level && (
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                  Lvl {followedUser.level}
                                </Badge>
                              )}
                            </div>
                          )}
                        </UserLink>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
