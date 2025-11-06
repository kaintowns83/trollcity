import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function OGBadge({ user, className = "" }) {
  if (!user?.created_date) return null;
  
  // Check if user created account before December 2025
  const createdDate = new Date(user.created_date);
  const ogCutoffDate = new Date('2025-12-01');
  const isOG = createdDate < ogCutoffDate;
  
  if (!isOG) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white ${className}`}>
            👹 OG
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <p className="font-semibold">Original Gangster</p>
          <p className="text-xs text-gray-400">Joined before Dec 2025</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to check if user is OG (can be imported elsewhere)
export function isOGUser(user) {
  if (!user?.created_date) return false;
  const createdDate = new Date(user.created_date);
  const ogCutoffDate = new Date('2025-12-01');
  return createdDate < ogCutoffDate;
}