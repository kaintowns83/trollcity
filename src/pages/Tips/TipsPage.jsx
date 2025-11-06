import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, TrendingUp, DollarSign, Heart, Users } from "lucide-react";
import { format } from "date-fns";

export default function TipsPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tipsReceived } = useQuery({
    queryKey: ['tipsReceived', user?.id],
    queryFn: () => base44.entities.Tip.filter({ streamer_id: user?.id }, "-created_date", 100),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: tipsSent } = useQuery({
    queryKey: ['tipsSent', user?.id],
    queryFn: () => base44.entities.Tip.filter({ tipper_id: user?.id }, "-created_date", 100),
    initialData: [],
    enabled: !!user?.id,
  });

  const totalReceived = tipsReceived.reduce((sum, tip) => {
    return sum + (tip.amount_usd || 0);
  }, 0);

  const totalSent = tipsSent.reduce((sum, tip) => {
    return sum + (tip.amount_usd || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-10 h-10 text-pink-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tips & Donations
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Track your tips and support your favorite streamers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-gray-400">Tips Received</span>
            </div>
            <p className="text-4xl font-bold text-green-400">${totalReceived.toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">{tipsReceived.length} tips</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-pink-400" />
              <span className="text-gray-400">Tips Sent</span>
            </div>
            <p className="text-4xl font-bold text-pink-400">${totalSent.toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">{tipsSent.length} tips</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span className="text-gray-400">Unique Supporters</span>
            </div>
            <p className="text-4xl font-bold text-cyan-400">
              {new Set(tipsReceived.map(t => t.tipper_id)).size}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="bg-[#1a1a24] border border-[#2a2a3a]">
            <TabsTrigger value="received">Tips Received</TabsTrigger>
            <TabsTrigger value="sent">Tips Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card className="bg-[#1a1a24] border-[#2a2a3a]">
              <div className="p-6 border-b border-[#2a2a3a]">
                <h2 className="text-2xl font-bold text-white">Tips from Supporters</h2>
              </div>
              <div className="divide-y divide-[#2a2a3a]">
                {tipsReceived.length === 0 ? (
                  <div className="p-12 text-center">
                    <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No tips received yet</p>
                  </div>
                ) : (
                  tipsReceived.map((tip) => (
                    <div key={tip.id} className="p-4 hover:bg-[#0a0a0f] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-semibold">
                              {tip.is_anonymous ? "Anonymous Supporter" : tip.tipper_name}
                            </p>
                            {tip.payment_method === 'coins' && (
                              <Badge className="bg-yellow-500/20 text-yellow-300">Coins</Badge>
                            )}
                          </div>
                          {tip.message && (
                            <p className="text-gray-300 text-sm mb-2 bg-[#0a0a0f] p-3 rounded-lg">
                              "{tip.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {format(new Date(tip.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-green-400">
                            {tip.amount_usd ? `$${tip.amount_usd.toFixed(2)}` : `${tip.amount_coins} coins`}
                          </p>
                          <Badge className={
                            tip.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            tip.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }>
                            {tip.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card className="bg-[#1a1a24] border-[#2a2a3a]">
              <div className="p-6 border-b border-[#2a2a3a]">
                <h2 className="text-2xl font-bold text-white">My Donations</h2>
              </div>
              <div className="divide-y divide-[#2a2a3a]">
                {tipsSent.length === 0 ? (
                  <div className="p-12 text-center">
                    <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">You haven't sent any tips yet</p>
                  </div>
                ) : (
                  tipsSent.map((tip) => (
                    <div key={tip.id} className="p-4 hover:bg-[#0a0a0f] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-semibold">To: {tip.streamer_name}</p>
                            {tip.is_anonymous && (
                              <Badge className="bg-purple-500/20 text-purple-300">Anonymous</Badge>
                            )}
                          </div>
                          {tip.message && (
                            <p className="text-gray-300 text-sm mb-2 bg-[#0a0a0f] p-3 rounded-lg">
                              "{tip.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {format(new Date(tip.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-purple-400">
                            {tip.amount_usd ? `$${tip.amount_usd.toFixed(2)}` : `${tip.amount_coins} coins`}
                          </p>
                          <Badge className={
                            tip.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            tip.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }>
                            {tip.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}