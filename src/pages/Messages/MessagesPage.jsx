
import React, { useState, useRef, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search, Plus, X, Crown } from "lucide-react"; // Added Crown
import { toast } from "sonner";
import OGBadge from "../components/OGBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Added Badge

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const searchRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConv?.id]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Get all users for search - INCLUDE ADMIN
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const users = await base44.entities.User.list("-created_date", 1000);
      // Show all users including admin, remove deleted accounts
      return users.filter(u => !u.account_deleted);
    },
    enabled: !!user,
    initialData: [],
  });

  // Get all conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const conv1 = await base44.entities.Conversation.filter({ participant1_id: user.id }, "-last_message_time");
      const conv2 = await base44.entities.Conversation.filter({ participant2_id: user.id }, "-last_message_time");
      
      const allConv = [...conv1, ...conv2];
      const uniqueConv = allConv.filter((conv, index, self) =>
        index === self.findIndex((c) => c.id === conv.id)
      );
      
      return uniqueConv.sort((a, b) => 
        new Date(b.last_message_time || b.created_date) - new Date(a.last_message_time || a.created_date)
      );
    },
    enabled: !!user,
    refetchInterval: 1000, // Refresh every 1 second
    initialData: [],
  });

  // Get messages for selected conversation
  const { data: selectedConversationMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['conversationMessages', selectedConv?.id],
    queryFn: async () => {
      if (!selectedConv?.id) return [];
      return await base44.entities.DirectMessage.filter({ conversation_id: selectedConv.id }, "created_date");
    },
    enabled: !!selectedConv?.id,
    refetchInterval: 1000, // Refresh every 1 second
    initialData: [],
  });

  // Search users
  const handleUserSearch = (query) => {
    setUserSearch(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = allUsers
      .filter(u => {
        if (u.id === user.id) return false; // Don't show current user
        
        const matchesUsername = u.username?.toLowerCase().startsWith(searchLower);
        const matchesName = u.full_name?.toLowerCase().startsWith(searchLower);
        const matchesUserId = u.user_id?.toLowerCase().includes(searchLower);
        const matchesEmail = u.email?.toLowerCase().startsWith(searchLower);
        
        return matchesUsername || matchesName || matchesUserId || matchesEmail;
      })
      .slice(0, 8);

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  // Start conversation with user
  const startConversationMutation = useMutation({
    mutationFn: async (selectedUser) => {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        (conv.participant1_id === user.id && conv.participant2_id === selectedUser.id) ||
        (conv.participant2_id === user.id && conv.participant1_id === selectedUser.id)
      );

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const newConv = await base44.entities.Conversation.create({
        participant1_id: user.id,
        participant1_name: user.full_name,
        participant1_username: user.username || user.full_name,
        participant1_avatar: user.avatar,
        participant1_created_date: user.created_date,
        participant2_id: selectedUser.id,
        participant2_name: selectedUser.full_name,
        participant2_username: selectedUser.username || selectedUser.full_name,
        participant2_avatar: selectedUser.avatar,
        participant2_created_date: selectedUser.created_date,
        last_message: "",
        last_message_time: new Date().toISOString(),
        unread_count_p1: 0,
        unread_count_p2: 0
      });

      return newConv;
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries(['conversations', user?.id]);
      setSelectedConv(conv);
      setShowNewMessage(false);
      setUserSearch("");
      setSearchResults([]);
      setShowSearchResults(false);
      toast.success("Conversation started!");
    },
    onError: (error) => {
      console.error('Start conversation error:', error);
      toast.error('Failed to start conversation');
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (text) => {
      if (!selectedConv?.id || !user?.id) {
        throw new Error('Missing conversation or user data');
      }

      const otherUserId = selectedConv.participant1_id === user.id 
        ? selectedConv.participant2_id 
        : selectedConv.participant1_id;

      await base44.entities.DirectMessage.create({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_username: user.username || user.full_name,
        sender_avatar: user.avatar,
        receiver_id: otherUserId,
        receiver_name: selectedConv.participant1_id === user.id 
          ? selectedConv.participant2_name 
          : selectedConv.participant1_name,
        message: text,
        is_read: false
      });

      await base44.entities.Conversation.update(selectedConv.id, {
        last_message: text.substring(0, 100),
        last_message_time: new Date().toISOString(),
        ...(selectedConv.participant1_id === user.id 
          ? { unread_count_p2: (selectedConv.unread_count_p2 || 0) + 1 }
          : { unread_count_p1: (selectedConv.unread_count_p1 || 0) + 1 }
        )
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries(['conversationMessages', selectedConv?.id]);
      queryClient.invalidateQueries(['conversations', user?.id]);
    },
    onError: (error) => {
      console.error('Send error:', error);
      toast.error('Failed to send message');
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConv && user) {
      const isP1 = selectedConv.participant1_id === user.id;
      const unreadCount = isP1 ? selectedConv.unread_count_p1 : selectedConv.unread_count_p2;
      
      if (unreadCount > 0) {
        base44.entities.Conversation.update(selectedConv.id, {
          ...(isP1 
            ? { unread_count_p1: 0 }
            : { unread_count_p2: 0 }
          )
        }).then(() => {
          queryClient.invalidateQueries(['conversations', user.id]);
        });
      }
    }
  }, [selectedConv?.id, user?.id]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center">
        <p className="text-red-400">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Messages</h1>
            </div>
            <Button
              onClick={() => setShowNewMessage(!showNewMessage)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Message
            </Button>
          </div>
          <p className="text-gray-400">Chat with other users</p>
        </div>

        {/* New Message Search */}
        {showNewMessage && (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-bold">Start New Conversation</h3>
              <Button
                onClick={() => {
                  setShowNewMessage(false);
                  setUserSearch("");
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                variant="ghost"
                size="icon"
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  placeholder="Search by username, name, email, or user ID..."
                  className="bg-[#0a0a0f] border-[#2a2a3a] text-white pl-10"
                  autoFocus
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((searchUser) => (
                    <button
                      key={searchUser.id}
                      onClick={() => startConversationMutation.mutate(searchUser)}
                      disabled={startConversationMutation.isPending}
                      className="w-full p-3 hover:bg-[#2a2a3a] transition-colors flex items-center gap-3 text-left"
                    >
                      {searchUser.avatar ? (
                        <img 
                          src={searchUser.avatar}
                          alt={searchUser.username || searchUser.full_name}
                          className="w-10 h-10 rounded-full object-cover"
 