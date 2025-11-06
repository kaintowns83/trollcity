import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, UserPlus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StreamModeratorsPage() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const streamId = urlParams.get('id');
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({
    can_mute_users: true,
    can_block_chat: true,
    can_ban_users: false,
    can_delete_messages: true,
    can_manage_stream: false,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stream } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: async () => {
      const streams = await base44.entities.Stream.filter({ id: streamId });
      return streams[0];
    },
    enabled: !!streamId,
  });

  const { data: moderators } = useQuery({
    queryKey: ['streamModerators', streamId],
    queryFn: () => base44.entities.StreamModerator.filter({ stream_id: streamId }),
    initialData: [],
    enabled: !!streamId,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['userSearch', searchUsername],
    queryFn: () => base44.entities.User.filter({ username: searchUsername }),
    initialData: [],
    enabled: searchUsername.length >= 3,
  });

  const addModeratorMutation = useMutation({
    mutationFn: (modData) => base44.entities.StreamModerator.create(modData),
    onSuccess: () => {
      queryClient.invalidateQueries(['streamModerators', streamId]);
      toast.success("Moderator added successfully!");
      setShowAddDialog(false);
      setSearchUsername("");
      setSelectedUser(null);
      setPermissions({
        can_mute_users: true,
        can_block_chat: true,
        can_ban_users: false,
        can_delete_messages: true,
        can_manage_stream: false,
      });
    },
  });

  const removeModeratorMutation = useMutation({
    mutationFn: (modId) => base44.entities.StreamModerator.delete(modId),
    onSuccess: () => {
      queryClient.invalidateQueries(['streamModerators', streamId]);
      toast.success("Moderator removed");
    },
  });

  const handleAddModerator = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    addModeratorMutation.mutate({
      stream_id: streamId,
      streamer_id: user.id,
      moderator_id: selectedUser.id,
      moderator_name: selectedUser.full_name,
      moderator_username: selectedUser.username,
      ...permissions,
    });
  };

  // Check if user is the streamer
  const isStreamer = user?.id === stream?.streamer_id;

  if (!isStreamer) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only the stream owner can manage moderators.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stream Moderators
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage moderators for your stream</p>
        </div>

        {/* Add Moderator Section */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Moderators ({moderators.length})</h2>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Moderator
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a24] border-[#2a2a3a] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add Stream Moderator</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Search for a user and set their permissions
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* User Search */}
                  <div>
                    <Label className="text-white mb-2 block">Search User by Username</Label>
                    <div className="relative">
 