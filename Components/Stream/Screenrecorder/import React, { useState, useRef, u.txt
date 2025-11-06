import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, StopCircle, Download, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const MAX_RECORDING_TIME = 3600; // 1 hour in seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        toast.success("Recording stopped and ready to download!");
      };

      // Handle user stopping screen share
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000); // Capture data every second
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedBlob(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 1 hour
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            toast.info("Recording stopped - 1 hour limit reached");
          }
          return newTime;
        });
      }, 1000);

      toast.success("Screen recording started!");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please allow screen sharing.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stream-recording-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Recording downloaded!");
    }
  };

  return (
    <Card className="bg-[#1a1a24] border-[#2a2a3a] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Screen Recording</h3>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm font-bold">REC</span>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
          <span className="text-sm text-gray-500">/ 01:00:00</span>
        </div>
      )}

      <div className="flex gap-2">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 gap-2"
          >
            <Video className="w-4 h-4" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Stop Recording
          </Button>
        )}

        {recordedBlob && !isRecording && (
          <Button
            onClick={downloadRecording}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
          >
            <Download className="w-4 h-4" />
            Download ({(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB)
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Record your stream for up to 1 hour. The recording will be saved to your device.
      </p>
    </Card>
  );
}