import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function GoLivePage() {
  const queryClient = useQueryClient();
  
  // ===== ALL STATE DECLARATIONS =====
  const [step, setStep] = useState(1);
  const [streamConfig, setStreamConfig] = useState({
    title: "",
    category: "gaming",
    stream_mode: "solo",
    max_participants: 1,
    secured_boxes: false,
  });
  const [isLive, setIsLive] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  // ===== ALL QUERIES (must be called unconditionally) =====
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activeStreams = [] } = useQuery({
    queryKey: ['myActiveStreams'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Stream.filter({
        streamer_id: user.id,
        status: "live"
      });
    },
    enabled: !!user,
    initialData: [],
  });

  // ===== ALL MUTATIONS (must be defined unconditionally) =====
  const createStreamMutation = useMutation({
    mutationFn: async (config) => {
      console.log("🎥 Starting WebRTC stream...");

      const stream = await base44.entities.Stream.create({
        title: config.title,
        streamer_name: user.username || user.full_name,
        streamer_id: user.id,
        streamer_avatar: user.avatar,
        streamer_follower_count: user.follower_count || 0,
        streamer_created_date: user.created_date,
        category: config.category,
        status: "live",
        stream_mode: config.stream_mode,
        max_participants: config.max_participants,
        secured_boxes: config.secured_boxes,
        streaming_backend: "webrtc",
        thumbnail: config.thumbnail,
        last_heartbeat: new Date().toISOString(),
        viewer_count: 0,
        total_gifts: 0,
        likes: 0,
        troll_points: 0
      });

      // Notify followers
      try {
        const followers = await base44.entities.Follow.filter({ 
          following_id: user.id 
        });
        
        if (followers.length > 0) {
          console.log(`📣 Notifying ${followers.length} followers...`);
          
          for (const follower of followers) {
            await base44.asServiceRole.entities.Notification.create({
              user_id: follower.follower_id,
              type: "stream_live",
              title: "🔴 Now Live!",
              message: `${user.username || user.full_name} is now streaming: ${config.title}`,
              icon: "📺",
              link_url: `/#/StreamViewer?id=${stream.id}`,
              related_user_id: user.id,
              related_user_name: user.username || user.full_name,
              related_stream_id: stream.id
            }).catch(err => {
              console.error(`Failed to notify follower ${follower.follower_id}:`, err);
            });
          }
        }
      } catch (error) {
        console.error("Failed to notify followers:", error);
      }

      return stream;
    },
    onSuccess: (stream) => {
      console.log("🎉 Stream created, setting up WebRTC...");
      setCurrentStream(stream);
      setIsLive(true);
      setupWebRTC(stream);
      queryClient.invalidateQueries(['myActiveStreams']);
      toast.success("🎉 You're live!");
    },
    onError: (error) => {
      console.error("❌ Stream creation error:", error);
      toast.error(error.message || "Failed to start stream");
    }
  });

  const endStreamMutation = useMutation({
    mutationFn: async () => {
      if (!currentStream) return;

      await base44.entities.Stream.update(currentStream.id, {
        status: "ended"
      });

      const startTime = new Date(currentStream.created_date).getTime();
      const endTime = Date.now();
      const hoursStreamed = (endTime - startTime) / (1000 * 60 * 60);

      await base44.auth.updateMe({
        total_streaming_hours: (user.total_streaming_hours || 0) + hoursStreamed,
        hours_since_last_payout: (user.hours_since_last_payout || 0) + hoursStreamed
      });

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      if (peerConnection) {
        peerConnection.close();
      }
    },
    onSuccess: () => {
      setIsLive(false);
      setCurrentStream(null);
      setMediaStream(null);
      setThumbnail(null);
      setPeerConnection(null);
      setStep(1);
      setStreamConfig({
        title: "",
        category: "gaming",
        stream_mode: "solo",
        max_participants: 1,
        secured_boxes: false,
      });
      queryClient.invalidateQueries(['myActiveStreams']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Stream ended!");
    },
    onError: (error) => {
      toast.error("Failed to end stream: " + error.message);
    }
  });

  // ===== ALL EFFECTS (must be called unconditionally) =====
  useEffect(() => {
    if (activeStreams.length > 0) {
      setCurrentStream(activeStreams[0]);
      setIsLive(true);
    }
  }, [activeStreams]);

  // ===== HELPER FUNCTIONS (not hooks, safe to define anywhere) =====
  const setupWebRTC = async (stream) => {
    try {
      console.log("🔧 Setting up WebRTC peer connection...");

      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };

      const pc = new RTCPeerConnection(configuration);

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, mediaStream);
          console.log("➕ Added track to peer connection:", track.kind);
        });
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });

      await pc.setLocalDescription(offer);

      console.log("📤 Sending WebRTC offer to backend...");

      await base44.functions.invoke('storeWebRTCOffer', {
        streamId: stream.id,
        offer: JSON.stringify(offer)
      });

      setPeerConnection(pc);

      console.log("✅ WebRTC setup complete!");

    } catch (error) {
      console.error("❌ WebRTC setup error:", error);
      toast.error("Failed to setup WebRTC: " + error.message);
    }
  };

  const captureThumbnail = async (stream) => {
    try {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      setThumbnail(thumbnailUrl);

      video.srcObject = null;
      return thumbnailUrl;
    } catch (error) {
      console.error("Failed to capture thumbnail:", error);
      return null;
    }
  };

  const handleStartStream = async () => {
    if (!streamConfig.title.trim()) {
      toast.error("Please enter a stream title");
      return;
    }

    try {
      toast.info("Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      setMediaStream(stream);
      const thumb = await captureThumbnail(stream);
      
      console.log('🎥 Creating stream with status: live');
      createStreamMutation.mutate({ ...streamConfig, thumbnail: thumb });
    } catch (error) {
      console.error("Failed to access camera:", error);
      toast.error("Failed to access camera/microphone. Please check permissions.");
    }
  };

  // ===== EARLY RETURNS (only after all hooks) =====
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Please login</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to go live.</p>
        </Card>
      </div>
    );
  }

  if (!user.is_broadcaster_approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Broadcaster Approval Required</h2>
          <p className="text-gray-400 mb-6">
            You need to be an approved broadcaster to go live. Please apply to become a broadcaster first.
          </p>
          <Button
            onClick={() => window.location.href = '/#/BroadcasterApplication'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Apply Now
          </Button>
        </Card>
      </div>
    );
  }

  // ===== LIVE STREAM VIEW =====
  if (isLive && currentStream && mediaStream) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col z-50">
        <div className="bg-[#1a1a24] border-b border-[#2a2a3a] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Badge className="bg-red-500 text-white animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2" />
              LIVE
            </Badge>
            <h1 className="text-white font-bold text-lg">{currentStream.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Eye className="w-5 h-5" />
              <span className="font-bold">{currentStream.viewer_count || 0}</span>
            </div>
            <Button
              onClick={() => {
                if (confirm("Are you sure you want to end your stream?")) {
                  endStreamMutation.mutate();
                }
              }}
              disabled={endStreamMutation.isPending}
              variant="destructive"
              size="sm"
            >
              End Stream
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-black overflow-hidden">
          <video
            ref={(video) => {
              if (video && mediaStream) {
                video.srcObject = mediaStream;
              }
            }}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />

          <div className="absolute top-4 left-4 bg-purple-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg z-10">
            <p className="font-bold">You're Live! 🎥</p>
            <p className="text-sm">Broadcasting via WebRTC</p>
            <p className="text-xs mt-1">Stream ID: {currentStream.id}</p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg z-10">
            <p className="font-bold text-sm">📡 Peer-to-Peer Streaming Active</p>
            <p className="text-xs">Viewers connect directly to your device via WebRTC</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN SETUP VIEW =====
  return (
    <div className="h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] overflow-y-auto">
      <div className="min-h-full p-4 md:p-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Go Live</h1>
              <p className="text-gray-400 text-lg">Start your live stream</p>
            </motion.div>
          </div>

          <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Stream Details</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-white font-medium mb-2 block">Stream Title *</label>
                      <Input
                        value={streamConfig.title}
                        onChange={(e) => setStreamConfig({ ...streamConfig, title: e.target.value })}
                        placeholder="What are you streaming?"
                        className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                        maxLength={100}
                      />
                      <p className="text-gray-500 text-sm mt-1">{streamConfig.title.length}/100</p>
                    </div>

                    <div>
                      <label className="text-white font-medium mb-2 block">Category *</label>
                      <Select
                        value={streamConfig.category}
                        onValueChange={(value) => setStreamConfig({ ...streamConfig, category: value })}
                      >
                        <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gaming">🎮 Gaming</SelectItem>
                          <SelectItem value="music">🎵 Music</SelectItem>
                          <SelectItem value="talk">💬 Just Chatting</SelectItem>
                          <SelectItem value="creative">🎨 Creative</SelectItem>
                          <SelectItem value="fitness">💪 Fitness</SelectItem>
                          <SelectItem value="cooking">🍳 Cooking</SelectItem>
                          <SelectItem value="trolling">😈 Trolling</SelectItem>
                          <SelectItem value="other">📺 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-white font-medium mb-2 block">Stream Mode</label>
                      <Select
                        value={streamConfig.stream_mode}
                        onValueChange={(value) => {
                          const maxParticipants = value === "solo" ? 1 : 4;
                          setStreamConfig({ 
                            ...streamConfig, 
                            stream_mode: value,
                            max_participants: maxParticipants
                          });
                        }}
                      >
                        <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Solo - Full Screen</SelectItem>
                          <SelectItem value="multi">Multi-Troll Beam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {streamConfig.stream_mode === "multi" && (
                      <div>
                        <label className="text-white font-medium mb-2 block">Max Participants</label>
                        <Select
                          value={String(streamConfig.max_participants)}
                          onValueChange={(value) => setStreamConfig({ ...streamConfig, max_participants: parseInt(value) })}
                        >
                          <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Boxes</SelectItem>
                            <SelectItem value="4">4 Boxes</SelectItem>
                            <SelectItem value="6">6 Boxes</SelectItem>
                            <SelectItem value="8">8 Boxes</SelectItem>
                            <SelectItem value="10">10 Boxes</SelectItem>
                            <SelectItem value="12">12 Boxes</SelectItem>
                            <SelectItem value="14">14 Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!streamConfig.title.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Review & Start</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Title</p>
                      <p className="text-white font-semibold">{streamConfig.title}</p>
                    </div>

                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Category</p>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                        {streamConfig.category}
                      </Badge>
                    </div>

                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Mode</p>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500">
                        {streamConfig.stream_mode === "solo" ? "Solo Stream" : `Multi-Troll Beam (${streamConfig.max_participants} boxes)`}
                      </Badge>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Using peer-to-peer WebRTC streaming
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 border-[#2a2a3a]"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleStartStream}
                      disabled={createStreamMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-6"
                    >
                      {createStreamMutation.isPending ? (
                        "Starting..."
                      ) : (
                        <>
                          <Radio className="w-5 h-5 mr-2" />
                          Go Live
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}