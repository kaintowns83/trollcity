import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  X,
  Gift,
  Heart,
  UserPlus,
  Radio,
  Trophy,
  Star,
  MessageCircle,
  Crown,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import UserLink from "./UserLink";

export default function NotificationBar({ user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 50),
    enabled: !!user,
    initialData: [],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stream_live':
        return <Radio className="w-5 h-5 text-red-500" />;
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'gift_received':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      case 'tip_received':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'subscription':
        return <Crown className="w-5 h-5 text-pink-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-orange-500" />;
      case 'level_up':
        return <Star className="w-5 h-5 text-cyan-500" />;
      case 'scheduled_stream':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'daily_reward':
        return <Gift className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
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

  if (!user) return null;

  return (
    <>
      {/* Notification Bell Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-[#1a1a24] hover:bg-[#2a2a3a] border-2 border-purple-500/50 rounded-full h-12 w-12 p-0"
        >
          <Bell className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 min-w-[20px] h-5 flex items-center justify-center rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-[#1a1a24] border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                      size="sm"
                      variant="ghost"
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowNotifications(false)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="max-h-[70vh]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#2a2a3a]">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-4 hover:bg-[#0a0a0f] transition-colors text-left ${
                          !notification.is_read ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-xs mb-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(notification.created_date).toLocaleString()}
                            </p>
                          </div>

                          {!notification.is_read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-3 border-t border-[#2a2a3a]">
                <Button
                  onClick={() => {
                    setShowNotifications(false);
                    window.location.href = '/#/Notifications';
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  View All Notifications
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}