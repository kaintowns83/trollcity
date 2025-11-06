
import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Crown, Send, MessageCircle, Lock, Pin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import OGBadge from "../components/OGBadge";

export default function OfficerChatPage() {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === 'admin';
  const isTrollOfficer = user?.is_troll_officer;

  const { data: messages = [] } = useQuery({
    queryKey: ['trollOfficerMessages'],
    queryFn: () => base44.entities.TrollOfficerMessage.list("created_date", 500),
    enabled: isAdmin || isTrollOfficer,
    refetchInterval: 10000, // Every 10 seconds - real-time officer chat
    initialData: [],
  });

  const { data: allOfficers = [] } = useQuery({
    queryKey: ['allOfficers'],
    queryFn: async () => {
      const officers = await base44.entities.User.filter({ is_troll_officer: true });
      const admins = await base44.entities.User.filter({ role: 'admin' });
      return [...officers, ...admins];
    },
    enabled: isAdmin || isTrollOfficer,
    refetchInterval: 30000, // Every 30 seconds - officers list doesn't change often
    initialData: [],
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      await base44.entities.TrollOfficerMessage.create({
        sender_id: user.id,
        sender_name: user.full_name,
        sender_username: user.username || user.full_name,
        sender_avatar: user.avatar,
        is_admin: user.role === 'admin',
        message: message,
        message_type: "text"
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries(['trollOfficerMessages']);
    },
    onError: () => {
      toast.error("Failed to send message");
    }
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async (message) => {
      await base44.entities.TrollOfficerMessage.create({
        sender_id: user.id,
        sender_name: user.full_name,
        sender_username: user.username || user.full_name,
        sender_avatar: user.avatar,
        is_admin: true,
        message: message,
        message_type: "announcement",
        is_pinned: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trollOfficerMessages']);
      toast.success("Announcement sent!");
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          <p className="text-gray-400">This chatroom is only accessible to Troll Officers and Admin.</p>
        </Card>
      </div>
    );
  }

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Officer Chatroom</h1>
                <p className="text-400">
                  {allOfficers.length} Officers & Admin Online
                </p>
              </div>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500 px-4 py-2">
              <Lock className="w-4 h-4 mr-2" />
              Private
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Members List */}
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4 lg:col-span-1">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Members
            </h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {allOfficers.map((officer) => (
                  <div key={officer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0a0a0f] transition-colors">
                    {officer.avatar ? (
                      <img
                        src={officer.avatar}
                        alt={officer.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {officer.full_name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {officer.username || officer.full_name}
                      </p>
 