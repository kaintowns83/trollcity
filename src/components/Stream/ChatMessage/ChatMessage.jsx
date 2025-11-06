import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import OGBadge from "../OGBadge";

export default function ChatMessage({ message, currentUser, isStreamer }) {
  const isOwnMessage = currentUser?.id === message.user_id;
  const isAdmin = currentUser?.role === 'admin';
  const isTrollOfficer = message.is_troll_officer || false;
  
  // Don't show full_name unless admin or own message
  const displayName = message.username || (isAdmin || isOwnMessage ? message.user_name : 'User');

  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${
      isTrollOfficer ? 'bg-red-900/20 border-2 border-red-500' : ''
    }`}>
      {message.user_avatar ? (
        <img 
          src={message.user_avatar}
          alt={displayName}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {displayName[0]?.toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${
            isTrollOfficer ? 'text-white font-bold' : 'text-purple-400'
          }`} style={isTrollOfficer ? {
            textShadow: '0 0 3px #EF4444, 0 0 6px #EF4444, 1px 1px 0 #EF4444, -1px -1px 0 #EF4444, 1px -1px 0 #EF4444, -1px 1px 0 #EF4444'
          } : {}}>
            {displayName}
          </span>
          {message.user_level && (
            <Badge className="bg-cyan-500/20 text-cyan-400 text-xs px-1">
              Lv.{message.user_level}
            </Badge>
          )}
          <OGBadge user={{ created_date: message.user_created_date }} className="text-xs px-1 py-0" />
          {isTrollOfficer && (
            <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-0.5 animate-pulse">
              <Shield className="w-3 h-3 mr-1" />
              Troll Officer
            </Badge>
          )}
        </div>
        <p className={`text-sm break-words ${
          isTrollOfficer ? 'text-white font-bold' : 'text-white'
        }`} style={isTrollOfficer ? {
          textShadow: '0 0 2px #EF4444, 1px 1px 0 #EF4444, -1px -1px 0 #EF4444'
        } : {}}>
          {message.message}
        </p>
      </div>
    </div>
  );
}