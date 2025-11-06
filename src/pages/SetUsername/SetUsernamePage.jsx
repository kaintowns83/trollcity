import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SetUsernamePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (username) => {
      await base44.auth.updateMe({ username });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Username set successfully!");
      navigate(createPageUrl("Home"));
    },
    onError: () => {
      toast.error("Failed to set username");
    },
  });

  const checkUsername = async (value) => {
    if (value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const users = await base44.entities.User.filter({ username: value });
      setIsAvailable(users.length === 0);
    } catch (error) {
      setIsAvailable(null);
    }
    setIsChecking(false);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    if (value.length >= 3) {
      checkUsername(value);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.length >= 3 && isAvailable) {
      updateUsernameMutation.mutate(username);
    }
  };

  // If user already has username, redirect
  if (user?.username) {
    navigate(createPageUrl("Home"));
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Username</h1>
          <p className="text-gray-400">Pick a unique username for your Live Trollz profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-white text-lg mb-3 block">
              Username
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                @
              </div>
              <Input
                id="username"
                placeholder="yourusername"
                value={username}
                onChange={handleUsernameChange}
                className="pl-8 pr-12 bg-[#0a0a0f] border-[#2a2a3a] text-white placeholder:text-gray-500 text-lg py-6"
                maxLength={20}
                minLength={3}
              />
              {username.length >= 3 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isChecking ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500" />
                  ) : isAvailable === true ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : isAvailable === false ? (
                    <X className="w-5 h-5 text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                {username.length}/20 characters • Letters, numbers, and underscores only
              </p>
              {username.length >= 3 && isAvailable === false && (
                <p className="text-sm text-red-400">Username is already taken</p>
              )}
              {username.length >= 3 && isAvailable === true && (
                <p className="text-sm text-green-400">Username is available!</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={username.length < 3 || !isAvailable || updateUsernameMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-lg py-6"
          >
            {updateUsernameMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                Setting Username...
              </>
            ) : (
              <>
                <User className="w-5 h-5 mr-2" />
                Confirm Username
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong className="text-purple-400">Tip:</strong> Choose wisely! Your username represents you in Live Trollz.
          </p>
        </div>
      </Card>
    </div>
  );
}