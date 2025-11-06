
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Flame, Heart, Eye, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StreamCard from "../components/stream/StreamCard";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TrendingPage() {
  const [sortBy, setSortBy] = useState("gifts"); // gifts, likes, viewers
  const navigate = useNavigate();

  const { data: streams, isLoading } = useQuery({
    queryKey: ['trendingStreams', sortBy],
    queryFn: async () => {
      let sortField = "-total_gifts";
      
      if (sortBy === "likes") {
        sortField = "-likes";
      } else if (sortBy === "viewers") {
        sortField = "-viewer_count";
      }
      
      return await base44.entities.Stream.filter({ status: "live" }, sortField);
    },
    initialData: [],
    refetchInterval: 20000, // Every 20 seconds - prevents rate limiting
  });

  const topStream = streams[0];
  const restStreams = streams.slice(1);

  const getTotalStat = () => {
    if (sortBy === "gifts") {
      return streams.reduce((sum, s) => sum + (s.total_gifts || 0), 0).toLocaleString();
    } else if (sortBy === "likes") {
      return streams.reduce((sum, s) => sum + (s.likes || 0), 0).toLocaleString();
    } else {
      return streams.reduce((sum, s) => sum + (s.viewer_count || 0), 0).toLocaleString();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Trending Now
            </h1>
          </div>
          <p className="text-gray-400 text-lg">The hottest streams right now</p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <Button
            onClick={() => setSortBy("gifts")}
            variant={sortBy === "gifts" ? "default" : "outline"}
            className={sortBy === "gifts" ? "bg-yellow-600" : "border-[#2a2a3a] text-gray-400"}
            size="sm"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Top Gifted
          </Button>
          <Button
            onClick={() => setSortBy("likes")}
            variant={sortBy === "likes" ? "default" : "outline"}
            className={sortBy === "likes" ? "bg-pink-600" : "border-[#2a2a3a] text-gray-400"}
            size="sm"
          >
            <Heart className="w-4 h-4 mr-2" />
            Most Liked
          </Button>
          <Button
            onClick={() => setSortBy("viewers")}
            variant={sortBy === "viewers" ? "default" : "outline"}
            className={sortBy === "viewers" ? "bg-purple-600" : "border-[#2a2a3a] text-gray-400"}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Most Viewers
          </Button>

          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white ml-auto">
            {getTotalStat()} Total
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] w-full bg-[#1a1a24]" />
                <Skeleton className="h-4 w-3/4 bg-[#1a1a24]" />
              </div>
            ))}
          </div>
        ) : streams.length === 0 ? (
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No trending streams yet</h3>
            <p className="text-gray-500">Check back later for hot content</p>
          </div>
        ) : (
          <>
            {/* Top Stream - Large Featured */}
            {topStream && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-black px-8 py-3 rounded-full text-xl shadow-2xl flex items-center gap-3 animate-pulse">
                      <Trophy className="w-6 h-6" />
                      #1 TRENDING
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-[#1a1a24] to-[#2a1a34] p-6 rounded-xl border-2 border-orange-500 shadow-2xl">
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        {topStream.thumbnail ? (
                          <img 
                            src={topStream.thumbnail}
                            alt={topStream.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                            <TrendingUp className="w-16 h-16 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-500 text-white animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-2" />
                            LIVE
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-4">{topStream.title}</h2>
                        <p className="text-xl text-purple-400 mb-6">{topStream.streamer_name}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-[#0a0a0f] p-4 rounded-lg text-center">
                            <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{topStream.viewer_count || 0}</p>
                            <p className="text-xs text-gray-400">Viewers</p>
                          </div>
                          <div className="bg-[#0a0a0f] p-4 rounded-lg text-center">
                            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2 fill-pink-400" />
                            <p className="text-2xl font-bold text-white">{topStream.likes || 0}</p>
                            <p className="text-xs text-gray-400">Likes</p>
                          </div>
                          <div className="bg-[#0a0a0f] p-4 rounded-lg text-center">
                            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{topStream.total_gifts || 0}</p>
                            <p className="text-xs text-gray-400">Gifts</p>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            console.log('🔵 Trending - Navigating to stream:', topStream.id);
                            navigate(`/StreamViewer?id=${topStream.id}`);
                          }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg"
                        >
                          Watch Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rest of Streams */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="absolute -top-3 -left-3 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                      #{index + 2}
                    </div>
                  </div>
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
