
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Crown, Shield, Trophy, Plus, UserPlus, Check, X, Star, Flame, Gift } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import UserLink from "../components/UserLink";

export default function TrollFamilyPage() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyTag, setFamilyTag] = useState("");
  const [familyDescription, setFamilyDescription] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myFamily } = useQuery({
    queryKey: ['myFamily', user?.troll_family_id],
    queryFn: async () => {
      if (!user?.troll_family_id) return null;
      const families = await base44.entities.TrollFamily.filter({ id: user.troll_family_id });
      return families[0] || null;
    },
    enabled: !!user?.troll_family_id,
  });

  const { data: myFamilyMembers = [] } = useQuery({
    queryKey: ['myFamilyMembers', myFamily?.id],
    queryFn: () => base44.entities.TrollFamilyMember.filter({ family_id: myFamily.id, is_active: true }, "-contribution_points"),
    enabled: !!myFamily?.id,
    initialData: [],
  });

  const { data: allFamilies = [] } = useQuery({
    queryKey: ['allFamilies'],
    queryFn: () => base44.entities.TrollFamily.filter({ is_recruiting: true }, "-total_family_points"),
    initialData: [],
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
  });

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites', user?.id],
    queryFn: () => base44.entities.TrollFamilyInvite.filter({ invitee_id: user.id, status: "pending" }),
    enabled: !!user?.id,
    initialData: [],
    refetchInterval: 30000, // Every 30 seconds - prevents rate limiting
  });

  const createFamilyMutation = useMutation({
    mutationFn: async () => {
      if (!familyName || !familyTag) {
        throw new Error("Please provide a family name and tag!");
      }

      const family = await base44.entities.TrollFamily.create({
        family_name: familyName,
        family_tag: familyTag,
        founder_id: user.id,
        founder_name: user.full_name,
        leader_id: user.id,
        leader_name: user.full_full_name,
        description: familyDescription,
        member_count: 1,
        total_family_points: 0,
        family_level: 1,
        min_level_requirement: 1
      });

      await base44.entities.TrollFamilyMember.create({
        family_id: family.id,
        family_name: familyName,
        family_tag: familyTag,
        user_id: user.id,
        user_name: user.full_name,
        username: user.username || user.full_name,
        user_avatar: user.avatar,
        user_level: user.level,
        role: "founder"
      });

      await base44.auth.updateMe({
        troll_family_id: family.id,
        troll_family_name: familyName,
        troll_family_tag: familyTag,
        troll_family_role: "founder"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['myFamily']);
      queryClient.invalidateQueries(['allFamilies']);
      setShowCreateDialog(false);
      setFamilyName("");
      setFamilyTag("");
      setFamilyDescription("");
      toast.success("🎉 Troll Family created!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const joinFamilyMutation = useMutation({
    mutationFn: async (family) => {
      if (family.member_count >= family.max_members) {
        throw new Error("This family is full!");
      }

      await base44.entities.TrollFamilyMember.create({
        family_id: family.id,
        family_name: family.family_name,
        family_tag: family.family_tag,
        user_id: user.id,
        user_name: user.full_name,
        username: user.username || user.full_name,
        user_avatar: user.avatar,
        user_level: user.level,
        role: "member"
      });

      await base44.entities.TrollFamily.update(family.id, {
        member_count: (family.member_count || 0) + 1
      });

      await base44.auth.updateMe({
        troll_family_id: family.id,
        troll_family_name: family.family_name,
        troll_family_tag: family.family_tag,
        troll_family_role: "member"
      });

      // Notify family leader
      await base44.asServiceRole.entities.Notification.create({
        user_id: family.leader_id,
        type: "new_follower",
        title: "👨‍👩‍👧‍👦 New Family Member!",
        message: `${user.username || user.full_name} joined your Troll Family: ${family.family_name}`,
        icon: "👤",
        link_url: `/#/TrollFamily`,
        related_user_id: user.id,
        related_user_name: user.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['myFamily']);
      queryClient.invalidateQueries(['allFamilies']);
      toast.success("🎉 You joined the family!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const leaveFamilyMutation = useMutation({
    mutationFn: async () => {
      const members = await base44.entities.TrollFamilyMember.filter({
        family_id: myFamily.id,
        user_id: user.id
      });

      if (members[0]) {
        await base44.entities.TrollFamilyMember.delete(members[0].id);
      }

 