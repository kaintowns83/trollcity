
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Gift,
  Radio,
  UserPlus,
  Trophy,
  Star,
  Calendar,
  Crown,
  Trash2,
  CheckCheck
} from "lucide-react";
import { toast } from "sonner";
import UserLink from "../components/UserLink";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      return await base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 100);
    },
    enabled: !!user,
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
    initialData: [],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notif of unreadNotifications) {
        await base44.entities.Notification.update(notif.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("Notification deleted");
    },
  });

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stream_live':
        return <Radio className="w-6 h-6 text-red-500" />;
      case 'new_follower':
        return <UserPlus className="w-6 h-6 text-purple-500" />;
      case 'gift_received':
        return <Gift className="w-6 h-6 text-yellow-500" />;
      case 'tip_received':
        return <Gift className="w-6 h-6 text-green-500" />;
      case 'subscription':
        return <Crown className="w-6 h-6 text-pink-500" />;
      case 'achievement':
        return <Trophy className="w-6 h-6 text-orange-500" />;
      case 'level_up':
        return <Star className="w-6 h-6 text-cyan-500" />;
      case 'scheduled_stream':
        return <Calendar className="w-6 h-6 text-blue-500" />;
      case 'daily_reward':
        return <Gift className="w-6 h-6 text-green-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    markAsReadMutation.mutate(notification.id);
    
    if (notification.link_url) {
      window.location.href = notification.link_url;
    } else if (notification.related_user_id) {
      window.location.href = `/#/Profile?userId=${notification.related_user_id}`;
    } else if (notification.related_stream_id) {
      window.location.href = `/#/StreamViewer?id=${notification.related_stream_id}`;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <p className="text-gray-400">Stay updated with your activity</p>
        </div>

        {unreadCount > 0 && (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-white">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          </Card>
        )}

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-[#1a1a24] border border-[#2a2a3a]">
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" onClick={() => setFilter("read")}>
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
            <Bell className="w-20 h-20 text-gray-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Loading notifications...</h3>
            <p className="text-gray-400">Please wait a moment.</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
            <Bell className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
            <p className="text-gray-400">
              {filter === "unread" ? "All caught up!" : "You don't have any notifications yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-[#1a1a24] border-[#2a2a3a] overflow-hidden transition-all hover:border-purple-500/50 ${
                  !notification.is_read ? 'border-l-4 border-l-purple-500' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2"> {/* This div contains text content and the 'New' badge */}
                        <div> {/* This div contains the new title/message/time structure */}
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-bold">{notification.title}</p>
                            <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                              {formatTimeAgo(notification.created_date)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{notification.message}</p>
                        </div>

                        {!notification.is_read && (
                          <Badge className="bg-purple-500 text-white">New</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {notification.related_user_id && (
                          <Button
                            onClick={() => {
                              markAsReadMutation.mutate(notification.id);
                              window.location.href = `/#/Profile?userId=${notification.related_user_id}`;
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            View Profile
                          </Button>
                        )}

                        {notification.link_url && (
                          <Button
                            onClick={() => handleNotificationClick(notification)}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            View
                          </Button>
                        )}

                        {!notification.is_read && (
                          <Button
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            size="sm"
                            variant="outline"
                            className="border-[#2a2a3a]"
                          >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        )}

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this notification?')) {
                              deleteNotificationMutation.mutate(notification.id);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
