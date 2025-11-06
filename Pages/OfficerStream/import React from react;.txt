import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Radio, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OfficerStreamPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === 'admin';
  const isTrollOfficer = user?.is_troll_officer;

  // Get the special officer stream (if any exists)
  const { data: officerStream } = useQuery({
    queryKey: ['officerStream'],
    queryFn: async () => {
      const streams = await base44.entities.Stream.filter({
        category: "officer_only",
        status: "live"
      });
      return streams[0] || null;
    },
    enabled: isAdmin || isTrollOfficer,
    refetchInterval: 5000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAdmin && !isTrollOfficer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 flex items-center justify-center">
        <Card className="bg-[#1a1a24] border-red-500/50 p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">This page is only accessible to Troll Officers and Admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Troll Officer Stream
          </h1>
          <p className="text-gray-400 text-lg">
            Exclusive live stream for Troll Officers & Admin only
          </p>
        </div>

        {/* Current Stream */}
        {officerStream ? (
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Badge className="bg-red-500 text-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2" />
                LIVE NOW
              </Badge>
              <Badge className="bg-cyan-500 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Officers Only
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {officerStream.thumbnail ? (
                  <img
                    src={officerStream.thumbnail}
                    alt={officerStream.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                    <Radio className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {officerStream.title}
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    {officerStream.streamer_avatar ? (
                      <img
                        src={officerStream.streamer_avatar}
                        alt={officerStream.streamer_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {officerStream.streamer_name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold">{officerStream.streamer_name}</p>
                      <p className="text-gray-400 text-sm">Host</p>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0f] rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Current Viewers</p>
                    <p className="text-white font-bold text-xl">{officerStream.viewer_count || 0}</p>
                  </div>
                </div>

                <Link to={createPageUrl(`StreamViewer?id=${officerStream.id}`)}>
                  <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3">
                    <Radio className="w-5 h-5" />
                    Join Officer Stream
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
            <Radio className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Officer Stream</h3>
            <p className="text-gray-400 mb-6">
              There's no officer-only stream running at the moment.
            </p>
            <p className="text-gray-500 text-sm">
              Only Admin can create officer streams. Check back later!
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6 mt-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            About Officer Streams
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Exclusive live streams for Troll Officers and Admin only</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Discuss platform policies, moderation strategies, and updates</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Connect with other officers and coordinate moderation efforts</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Get early announcements and participate in officer voting</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}