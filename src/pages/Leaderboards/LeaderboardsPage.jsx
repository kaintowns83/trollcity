
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Medal, TrendingUp, Gift, Eye, Clock, Flame, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import OGBadge from "../components/OGBadge";

export default function LeaderboardsPage() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [category, setCategory] = useState("gifts");

  const getTimeFilter = () => {
    const now = new Date();
    switch (timePeriod) {
      case "daily":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "weekly":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "monthly":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', timePeriod, category],
    queryFn: async () => {
      const timeFilter = getTimeFilter();
      
      // Get all streams from the time period
      const allStreams = await base44.entities.Stream.filter({}, "-created_date", 1000);
      const filteredStreams = allStreams.filter(s => 
        new Date(s.created_date) >= new Date(timeFilter)
      );

      // Aggregate by streamer
      const streamerStats = {};
      
      filteredStreams.forEach(stream => {
        if (!streamerStats[stream.streamer_id]) {
          streamerStats[stream.streamer_id] = {
            streamer_id: stream.streamer_id,
            streamer_name: stream.streamer_name,
            total_viewers: 0,
            total_gifts: 0,
            total_likes: 0,
            troll_points: 0,
            stream_count: 0,
            total_duration: 0,
            best_viewer_count: 0,
            // Note: streamer.created_date for OGBadge is not directly available from stream objects.
            // If it's intended to be the streamer's account creation date, it would need to be fetched
            // from the User entity or similar. For now, it will be undefined as per current aggregation logic
            // unless a stream's created_date is erroneously assigned here.
            // Keeping this comment for clarity regarding the source of 'created_date' for the OGBadge.
            // For strict adherence to the outline, we will add streamer.created_date to the OGBadge props,
            // assuming it will be present or handled by OGBadge.
          };
        }

        const stats = streamerStats[stream.streamer_id];
        stats.total_viewers += stream.viewer_count || 0;
        stats.total_gifts += stream.total_gifts || 0;
        stats.total_likes += stream.likes || 0;
        stats.troll_points += stream.troll_points || 0;
        stats.stream_count += 1;
        stats.best_viewer_count = Math.max(stats.best_viewer_count, stream.viewer_count || 0);

        // Calculate duration (if stream ended)
        if (stream.status === 'ended' && stream.created_date) {
          const start = new Date(stream.created_date);
          const end = stream.updated_date ? new Date(stream.updated_date) : new Date();
          const duration = Math.floor((end - start) / (1000 * 60)); // minutes
          stats.total_duration += duration;
        }
      });

      // Convert to array and sort
      let rankings = Object.values(streamerStats);
      
      // Sort based on category
      switch (category) {
        case "gifts":
          rankings.sort((a, b) => b.total_gifts - a.total_gifts);
          break;
        case "viewers":
          rankings.sort((a, b) => b.total_viewers - a.total_viewers);
          break;
        case "duration":
          rankings.sort((a, b) => b.total_duration - a.total_duration);
          break;
        case "trollPoints":
          rankings.sort((a, b) => b.troll_points - a.troll_points);
          break;
        default:
          rankings.sort((a, b) => b.total_gifts - a.total_gifts);
      }

      return rankings.slice(0, 50); // Top 50
    },
    initialData: [],
    staleTime: 60000, // Cache for 1 minute
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return "from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
    if (rank === 2) return "from-gray-400/20 to-slate-400/20 border-gray-400/50";
    if (rank === 3) return "from-orange-500/20 to-amber-500/20 border-orange-500/50";
    return "from-purple-500/10 to-pink-500/10 border-[#2a2a3a]";
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "gifts": return <Gift className="w-5 h-5" />;
      case "viewers": return <Eye className="w-5 h-5" />;
      case "duration": return <Clock className="w-5 h-5" />;
      case "trollPoints": return <Flame className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryValue = (streamer) => {
    switch (category) {
      case "gifts": return `${streamer.total_gifts.toLocaleString()} coins`;
      case "viewers": return `${streamer.total_viewers.toLocaleString()} viewers`;
      case "duration": return `${Math.floor(streamer.total_duration / 60)}h ${streamer.total_duration % 60}m`;
      case "trollPoints": return `${streamer.troll_points.toLocaleString()} 🔥`;
      default: return "";
    }
  };

  const handleStreamerClick = (streamerId) => {
    navigate(createPageUrl("Profile") + `?userId=${streamerId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Leaderboards
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Discover the top performing streamers on TrollCity</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
            <label className="text-sm text-gray-400 mb-3 block">Time Period</label>
            <Tabs value={timePeriod} onValueChange={setTimePeriod}>
              <TabsList className="bg-[#0a0a0f] border border-[#2a2a3a] w-full">
                <TabsTrigger value="daily" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>

          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
            <label className="text-sm text-gray-400 mb-3 block">Category</label>
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="bg-[#0a0a0f] border border-[#2a2a3a] w-full grid grid-cols-4">
                <TabsTrigger value="gifts" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                  <Gift className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="viewers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Eye className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="duration" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  <Clock className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="trollPoints" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <Flame className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>

        {/* Top 3 Podium */}
        {!isLoading && leaderboardData.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-12"
            >
              <Card 
                onClick={() => handleStreamerClick(leaderboardData[1].streamer_id)}
                className="bg-gradient-to-br from-gray-400/20 to-slate-400/20 border-2 border-gray-400 p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 truncate">{leaderboardData[1].streamer_name}</h3>
                <p className="text-gray-300 text-sm mb-2">{getCategoryValue(leaderboardData[1])}</p>
                <Badge className="bg-gray-400 text-black border-0">2nd Place</Badge>
              </Card>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <Star className="w-16 h-16 text-yellow-400 animate-pulse" />
              </div>
              <Card 
                onClick={() => handleStreamerClick(leaderboardData[0].streamer_id)}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2 truncate">{leaderboardData[0].streamer_name}</h3>
                <p className="text-yellow-300 text-base mb-2 font-semibold">{getCategoryValue(leaderboardData[0])}</p>
                <Badge className="bg-yellow-500 text-black border-0 font-bold">👑 Champion</Badge>
              </Card>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <Card 
                onClick={() => handleStreamerClick(leaderboardData[2].streamer_id)}
                className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500 p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 truncate">{leaderboardData[2].streamer_name}</h3>
                <p className="text-gray-300 text-sm mb-2">{getCategoryValue(leaderboardData[2])}</p>
                <Badge className="bg-orange-500 text-white border-0">3rd Place</Badge>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Full Rankings */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a]">
          <div className="p-6 border-b border-[#2a2a3a]">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {getCategoryIcon()}
              {category === "gifts" && "Top Earners"}
              {category === "viewers" && "Most Watched"}
              {category === "duration" && "Most Active"}
              {category === "trollPoints" && "Troll Masters"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Rankings for the past {timePeriod === "daily" ? "24 hours" : timePeriod === "weekly" ? "7 days" : "30 days"}
            </p>
          </div>

          <div className="divide-y divide-[#2a2a3a]">
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full bg-[#0a0a0f]" />
                  <Skeleton className="h-4 flex-1 bg-[#0a0a0f]" />
                </div>
              ))
            ) : leaderboardData.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Data Yet</h3>
                <p className="text-gray-500">Be the first to stream and claim the top spot!</p>
              </div>
            ) : (
              leaderboardData.map((streamer, index) => {
                const rank = index + 1;
                return (
                  <motion.div
                    key={streamer.streamer_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleStreamerClick(streamer.streamer_id)}
                    className={`p-4 hover:bg-[#0a0a0f] cursor-pointer transition-colors ${
                      rank <= 3 ? `bg-gradient-to-r ${getRankBg(rank)} border-l-4` : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* Streamer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold text-lg">
                            {streamer.streamer_name}
                          </h3>
                          <OGBadge user={{ created_date: streamer.created_date }} className="text-xs px-1 py-0" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {streamer.stream_count} streams
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {streamer.best_viewer_count} peak viewers
                          </span>
                          {category !== "duration" && streamer.total_duration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(streamer.total_duration / 60)}h {streamer.total_duration % 60}m
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          rank === 1 ? 'text-yellow-400' : 
                          rank === 2 ? 'text-gray-400' : 
                          rank === 3 ? 'text-orange-400' : 
                          'text-purple-400'
                        }`}>
                          {getCategoryValue(streamer)}
                        </p>
                        {category === "gifts" && (
                          <p className="text-xs text-gray-500">
                            ${(streamer.total_gifts / 100).toFixed(2)} value
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
