
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TrollOfficerApplicationPage() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingApplication } = useQuery({
    queryKey: ['trollOfficerApplication', user?.id],
    queryFn: async () => {
      const apps = await base44.entities.TrollOfficerApplication.filter({ user_id: user.id }, "-created_date");
      return apps[0] || null;
    },
    enabled: !!user?.id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!reason.trim() || !experience.trim() || !availability.trim()) {
        throw new Error("Please fill in all fields");
      }

      await base44.entities.TrollOfficerApplication.create({
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        username: user.username || user.full_name,
        user_level: user.level || 1,
        total_streaming_hours: user.total_streaming_hours || 0,
        reason: reason.trim(),
        experience: experience.trim(),
        availability: availability.trim(),
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trollOfficerApplication']);
      toast.success("Application submitted! Awaiting admin review.");
      setReason("");
      setExperience("");
      setAvailability("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (user.is_troll_officer && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500 p-8 text-center">
            <Shield className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">You're Already a Troll Officer!</h1>
            <p className="text-cyan-200 mb-6">
              You have full moderation privileges across the platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">Monthly Revenue Share</p>
                <p className="text-green-400 text-xl">2% of Platform Income</p>
                <p className="text-gray-400 text-sm mt-2">Paid in Troll Coins</p>
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-white font-bold">Powers</p>
                <ul className="text-gray-300 text-sm space-y-1 mt-2">
                  <li>✓ Report streams to admin</li>
                  <li>✓ Invisible until you chat</li>
                  <li>✓ Bold highlighted messages</li>
                  <li>✓ End streams (Level 80+)</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/#/Admin'}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Go to Moderation Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-cyan-500/20 border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
 