import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserPlus, Crown, Shield, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import UserLink from "../components/UserLink";
import OGBadge from "../components/OGBadge";
import TrollFamilyBadge from "../components/TrollFamilyBadge";
import { motion } from "framer-motion";

export default function UserSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      // Search by username or display name
      const allUsers = await base44.entities.User.list();
      
      const query = debouncedQuery.toLowerCase();
      const filtered = allUsers.filter(user => {
        // Hide admin profiles from non-admins
        if (user.role === 'admin' && currentUser?.role !== 'admin') {
          return false;
        }

        const username = (user.username || '').toLowerCase();
        const displayName = (user.display_name || '').toLowerCase();
        const fullName = (user.full_name || '').toLowerCase();
        const userId = (user.user_id || '').toLowerCase();

        return username.includes(query) || 
               displayName.includes(query) || 
               fullName.includes(query) ||
               userId.includes(query);
      });

      // Sort by level (highest first)
      return filtered.sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 50);
    },
    enabled: debouncedQuery.length >= 2,
    initialData: [],
  });

  const getTierInfo = (level) => {
    if (level >= 1 && level <= 9) return { tier: 1, color: "from-gray-500 to-slate-500" };
    if (level >= 10 && level <= 19) return { tier: 2, color: "from-blue-500 to-cyan-500" };
    if (level >= 20 && level <= 29) return { tier: 3, color: "from-purple-500 to-pink-500" };
    if (level >= 30) return { tier: 4, color: "from-yellow-500 to-orange-500" };
    return { tier: 1, color: "from-gray-500 to-slate-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">Find Users</h1>
          </div>
          <p className="text-gray-400 text-lg">Search for users by username, display name, or User ID</p>
        </div>

        {/* Search Bar */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by username, name, or User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-[#0a0a0f] border-[#2a2a3a] text-white text-lg focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-gray-500 text-sm mt-3">Type at least 2 characters to search</p>
          )}
        </Card>

        {/* Search Results */}
        {debouncedQuery.length >= 2 && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="bg-[#1a1a24] border-[#2a2a3a] p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-16 h-16 rounded-full bg-[#0a0a0f]" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2 bg-[#0a0a0f]" />
                        <Skeleton className="h-4 w-24 bg-[#0a0a0f]" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                <p className="text-gray-400">Try searching with a different term</p>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400">
                    Found {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((user, index) => {
                    const tierInfo = getTierInfo(user.level || 1);
                    
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <UserLink userId={user.id} className="block">
                          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4 hover:border-purple-500 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar}
                                  alt={user.username || user.full_name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center`}>
                                  <span className="text-white font-bold text-xl">
                                    {(user.username || user.full_name)[0]?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-white font-bold truncate">
                                    {user.username ? `@${user.username}` : user.full_name}
                                  </p>
                                  <OGBadge user={user} className="text-xs" />
                                  <TrollFamilyBadge user={user} className="text-xs" />
                                </div>
                                
                                {user.display_name && user.display_name !== user.username && (
                                  <p className="text-gray-400 text-sm truncate mb-1">
 