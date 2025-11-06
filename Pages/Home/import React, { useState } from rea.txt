import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Radio, Flame, Heart, Eye, TrendingUp, Sparkles, User } from "lucide-react";
import StreamCard from "../components/stream/StreamCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  
  // ===== ALL STATE DECLARATIONS =====
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // ===== ALL QUERIES (must be called unconditionally) =====
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      console.log('🔍 Fetching live streams...');
      const liveStreams = await base44.entities.Stream.filter({ status: "live" }, "-viewer_count");
      console.log('✅ Found streams:', liveStreams.length, liveStreams);
      return liveStreams;
    },
    initialData: [],
    staleTime: 0,
    refetchInterval: 3000, // Update every 3 seconds for near-instant updates
  });

  const { data: featuredStreams = [] } = useQuery({
    queryKey: ['featuredStreams'],
    queryFn: async () => {
      const allStreams = await base44.entities.Stream.filter({ status: "live" }, "-troll_points");
      return allStreams.slice(0, 6);
    },
    initialData: [],
    staleTime: 0,
    refetchInterval: 5000, // Update every 5 seconds
  });

  const { data: users = [] } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const allUsers = await base44.entities.User.list('-created_date', 50);
      return allUsers.filter(u => 
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);
    },
    enabled: searchQuery.length >= 2,
    initialData: [],
  });

  // ===== HELPER FUNCTIONS (not hooks) =====
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = !searchQuery || 
      stream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.streamer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || stream.category === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const categories = [
    { value: "all", label: "All", icon: Radio },
    { value: "gaming", label: "Gaming", icon: Sparkles },
    { value: "music", label: "Music", icon: Heart },
    { value: "talk", label: "Just Chatting", icon: TrendingUp },
    { value: "creative", label: "Creative", icon: Flame },
  ];

  const showUserResults = searchQuery.length >= 2 && users.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8 overflow-y-auto">
      <style>{`
        .logo-glow {
          filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header with Logo */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690097d0394b13206d0558a9/4f3fcb44d_trollcity_featured_1024x500.png"
              alt="TrollCity Logo"
              className="h-16 md:h-20 w-auto object-contain mx-auto logo-glow"
            />
          </motion.div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Radio className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Discover Live
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Watch live streams from creators around the world</p>
        </div>

        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search streams or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-[#1a1a24] border-[#2a2a3a] text-white text-lg focus:border-purple-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500/20 text-red-400 border-red-500 px-4 py-2">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
                {streams.length} Live
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500 px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                {streams.reduce((sum, s) => sum + (s.viewer_count || 0), 0)} Watching
              </Badge>
            </div>
          </div>
        </div>

        {/* User Search Results */}
        {showUserResults && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Users</h2>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
                {users.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    onClick={() => navigate(`/Profile?userId=${user.id}`)}
                    className="bg-[#1a1a24] border-[#2a2a3a] p-4 cursor-pointer hover:border-purple-500 transition-all"
                  >
                    <div className="text-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={user.username || user.full_name}
                          className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold text-xl">
                            {(user.username || user.full_name)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <p className="text-white font-semibold text-sm truncate">
                        {user.username || user.full_name}
                      </p>
                      {user.level && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">
                          Lvl {user.level}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        {!showUserResults && (
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.value;
              return (
                <Button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  variant={isActive ? "default" : "outline"}
                  className={`flex-shrink-0 ${
                    isActive 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-[#2a2a3a] text-gray-400 hover:text-white hover:border-purple-500"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Featured Streams */}
        {featuredStreams.length > 0 && activeFilter === "all" && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Featured</h2>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500">
                Hot Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Streams */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Radio className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-white">All Live Streams</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full bg-[#1a1a24]" />
                  <Skeleton className="h-4 w-3/4 bg-[#1a1a24]" />
                  <Skeleton className="h-4 w-1/2 bg-[#1a1a24]" />
                </div>
              ))}
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="bg-[#1a1a24] border-[#2a2a3a] rounded-lg p-12 text-center">
              <Radio className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                {searchQuery ? "No streams found" : "No live streams"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? "Try a different search term" 
                  : "Be the first to go live!"}
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => setSearchQuery("")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}