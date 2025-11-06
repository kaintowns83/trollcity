import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Trophy, Flame, Clock, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function TrollerzBattlePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Music className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Singing Battle
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            1v1 Vocal Showdowns
          </p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] border-purple-500/50 p-8 md:p-12 text-center mb-8">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-purple-400" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Coming Soon! 🎤
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get ready for the most intense singing battles ever! Challenge any streamer to a 1v1 vocal battle and let your community decide the winner.
            </p>
            
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-8">
              <p className="text-purple-300 text-lg font-semibold mb-4">
                Stay tuned for updates!
              </p>
              <p className="text-gray-400 text-sm">
                We're working hard to bring you this epic feature. Follow us on social media to be the first to know when it launches.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1v1 Singing Duels</h3>
            <p className="text-sm text-gray-400">
              Challenge any streamer to an epic vocal showdown
            </p>
          </Card>

          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Troll Points</h3>
            <p className="text-sm text-gray-400">
              Viewers send gifts to boost their favorite singer
            </p>
          </Card>

          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Win Rewards</h3>
            <p className="text-sm text-gray-400">
              Winners get featured spotlight and exclusive badges
            </p>
          </Card>
        </motion.div>

        {/* Sign Off Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-500/50 p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-pink-400" />
              <p className="text-lg font-bold text-white">From the Trollerz Team</p>
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            
            <p className="text-gray-300 mb-4 italic">
              "We're building something epic for you! Singing battles will revolutionize the way vocalists compete. Thank you for your patience and support!"
            </p>
            
            <div className="flex items-center justify-center gap-2 text-pink-400">
              <span className="text-2xl">🎤</span>
              <span className="font-bold">- The Trollerz Squad</span>
              <span className="text-2xl">🎵</span>
            </div>
          </Card>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-8 py-6 text-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Back to Streams
          </Button>
        </div>
      </div>
    </div>
  );
}