import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Monitor, Camera, StopCircle, Radio } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CameraRecorder() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamMode, setStreamMode] = useState("camera"); // camera, screen, or both
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Get available video devices
    navigator.mediaDevices.enumerateDevices()
      .then(deviceList => {
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      })
      .catch(error => {
        console.error('Error getting devices:', error);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      let stream;

      if (streamMode === "camera") {
        // Camera only
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
      } else if (streamMode === "screen") {
        // Screen only
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
      } else if (streamMode === "both") {
        // Both camera and screen
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: true
        });

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        });

        // Combine streams (in real scenario, you'd use canvas to merge them)
        stream = screenStream;
        // Store camera stream for PIP or side-by-side display
        streamRef.cameraStream = cameraStream;
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);
      toast.success("Camera started!");
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error("Failed to start camera. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (streamRef.cameraStream) {
      streamRef.cameraStream.getTracks().forEach(track => track.stop());
      streamRef.cameraStream = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    toast.success("Camera stopped");
  };

  return (
    <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Live Camera</h3>
        </div>
        {isStreaming && (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Camera off</p>
            </div>
          </div>
        )}
      </div>

      {!isStreaming && (
        <>
          {/* Stream Mode Selection */}
          <div className="mb-4">
            <label className="text-white text-sm mb-2 block">Stream Source</label>
            <Select value={streamMode} onValueChange={setStreamMode}>
              <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a24] border-[#2a2a3a]">
                <SelectItem value="camera" className="text-white">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Camera Only
                  </div>
                </SelectItem>
                <SelectItem value="screen" className="text-white">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Screen Only
                  </div>
                </SelectItem>
                <SelectItem value="both" className="text-white">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Camera + Screen
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Camera Selection */}
          {(streamMode === "camera" || streamMode === "both") && devices.length > 0 && (
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">Select Camera</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#2a2a3a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-[#2a2a3a]">
                  {devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId} className="text-white">
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isStreaming ? (
          <Button
            onClick={startCamera}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 gap-2"
          >
            <Video className="w-4 h-4" />
            Start Camera
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Stop Camera
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        {streamMode === "camera" && "Stream using your webcam"}
        {streamMode === "screen" && "Share your screen with viewers"}
        {streamMode === "both" && "Stream camera and screen together"}
      </p>
    </Card>
  );
}