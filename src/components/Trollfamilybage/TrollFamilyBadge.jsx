import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";

export default function TrollFamilyBadge({ user, className = "" }) {
  if (!user?.troll_family_tag) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white ${className}`}>
            <Users className="w-3 h-3 mr-1" />
            [{user.troll_family_tag}]
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1a1a24] border-[#2a2a3a] text-white">
          <p className="font-semibold">{user.troll_family_name}</p>
          <p className="text-xs text-gray-400 capitalize">{user.troll_family_role}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}