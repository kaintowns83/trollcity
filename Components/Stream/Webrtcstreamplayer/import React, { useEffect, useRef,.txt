import React, { useEffect, useRef, useState } from "react";
import { Video, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WebRTCStreamPlayer({ stream, user, isStreamer }) {
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isStreamer || !stream || !user) return;

    let pc = null;
    let retryTimeout = null;

    const setupViewerConnection = async () => {
      try {
        console.log("👀 Setting up viewer WebRTC connection...");
        setIsConnecting(true);
        setError(null);

        // Configure STUN servers
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        };

        pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // Handle incoming tracks
        pc.ontrack = (event) => {
          console.log("📥 Received remote track:", event.track.kind);
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
            setIsConnecting(false);
          }
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", pc.connectionState);
          if (pc.connectionState === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setError('Connection lost');
            // Retry after 3 seconds
            retryTimeout = setTimeout(() => {
              setupViewerConnection();
            }, 3000);
          }
        };

        // Fetch the broadcaster's offer
        console.log("📡 Fetching broadcaster's offer...");
        const { data: offerData } = await base44.functions.invoke('getWebRTCOffer', {
          streamId: stream.id
        });

        if (!offerData.offer) {
          console.log("⏳ Offer not available yet, retrying in 2 seconds...");
          retryTimeout = setTimeout(() => {
            setupViewerConnection();
          }, 2000);
          return;
        }

        const offer = JSON.parse(offerData.offer);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer to backend
        console.log("📤 Sending answer to backend...");
        await base44.functions.invoke('storeWebRTCAnswer', {
          streamId: stream.id,
          answer: JSON.stringify(answer)
        });

        console.log("✅ WebRTC viewer connection setup complete!");

      } catch (error) {
        console.error("❌ WebRTC viewer setup error:", error);
        setError(error.message);
        setIsConnecting(false);
        
        // Retry after 5 seconds on error
        retryTimeout = setTimeout(() => {
          setupViewerConnection();
        }, 5000);
      }
    };

    setupViewerConnection();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (pc) {
        pc.close();
      }
    };
  }, [stream?.id, user?.id, isStreamer]);

  if (isStreamer) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg font-bold">You're Broadcasting</p>
          <p className="text-gray-400 text-sm">Viewers can see your stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        style={{ maxHeight: '70vh' }}
      />

      {/* Connection Status Overlay */}
      {isConnecting && !isConnected && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg font-bold">Connecting to stream...</p>
            <p className="text-gray-400 text-sm">Establishing peer-to-peer connection</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && !isConnecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg font-bold">Connection Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-2">Retrying...</p>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {isConnected && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            LIVE
          </div>
        </div>
      )}

      {/* WebRTC Info */}
      {isConnected && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-purple-500/90 backdrop-blur-sm border-purple-500 p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
              <div className="text-white">
                <p className="font-bold text-sm mb-1">📡 Peer-to-Peer Stream</p>
                <p className="text-xs opacity-90">
                  Connected directly to broadcaster via WebRTC
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}