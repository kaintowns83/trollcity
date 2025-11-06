import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AgeVerification({ onVerified }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    localStorage.setItem('age_verified', 'true');
    setConfirmed(true);
    // Small delay for animation, then call onVerified
    setTimeout(() => {
      onVerified();
    }, 300);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" style={{ 
      WebkitBackdropFilter: 'blur(10px)',
      touchAction: 'none'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Age Verification Required
          </h1>

          <p className="text-gray-300 mb-6 text-lg">
            You must be <span className="text-red-400 font-bold">18 years or older</span> to access TrollCity.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-300 text-sm">
              ⚠️ This platform may contain mature content. By continuing, you confirm that you are of legal age.
            </p>
          </div>

          {confirmed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 text-green-400 font-bold text-xl"
            >
              <CheckCircle className="w-6 h-6" />
              Verified! Loading...
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg"
              >
                I am 18 or Older - Enter
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500/10 py-6 text-lg"
              >
                I am Under 18 - Exit
              </Button>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-6">
            By entering, you agree to our terms of service and privacy policy.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}